import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreatePackDto } from './dto/create-pack.dto';

function computeNextDeliveryDate(
  from: Date,
  frequency: 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY',
): Date {
  const next = new Date(from);
  switch (frequency) {
    case 'WEEKLY':
      next.setDate(next.getDate() + 7);
      break;
    case 'BI_WEEKLY':
      next.setDate(next.getDate() + 14);
      break;
    case 'MONTHLY':
      next.setMonth(next.getMonth() + 1);
      break;
  }
  return next;
}

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `VLR-${timestamp}-${random}`;
}

@Injectable()
export class VelRepeatService {
  private readonly logger = new Logger(VelRepeatService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * ซื้อแพ็ก (จ่ายก้อนเดียว) → สร้าง VelRepeatPack + history PURCHASED
   * หมายเหตุ: payment gateway จริงยังไม่ต่อ — รับ prepaidPaymentId จาก client ได้
   */
  async purchasePack(userId: string, dto: CreatePackDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
      include: { shop: true },
    });
    if (!product || product.status !== 'ACTIVE') {
      throw new NotFoundException('Product not found');
    }

    const unitsPerDelivery = dto.unitsPerDelivery ?? 1;
    if (dto.totalUnits < unitsPerDelivery) {
      throw new BadRequestException('totalUnits must be >= unitsPerDelivery');
    }

    const nextDeliveryDate = computeNextDeliveryDate(new Date(), dto.frequency);

    const pack = await this.prisma.$transaction(async (tx) => {
      const created = await tx.velRepeatPack.create({
        data: {
          userId,
          productId: dto.productId,
          planCode: dto.planCode,
          frequency: dto.frequency,
          totalUnits: dto.totalUnits,
          remainingUnits: dto.totalUnits,
          unitsPerDelivery,
          unitPrice: dto.unitPrice,
          packPrice: dto.packPrice,
          freeShipping: dto.freeShipping ?? true,
          status: 'ACTIVE',
          nextDeliveryDate,
          prepaidPaymentId: dto.prepaidPaymentId,
        },
        include: {
          product: { include: { images: true, shop: true } },
        },
      });

      await tx.velRepeatHistory.create({
        data: {
          packId: created.id,
          action: 'PURCHASED',
          note: `plan=\( {dto.planCode} units= \){dto.totalUnits} packPrice=${dto.packPrice}`,
        },
      });

      return created;
    });

    return pack;
  }

  findMine(userId: string) {
    return this.prisma.velRepeatPack.findMany({
      where: { userId },
      include: {
        product: { include: { images: true, shop: true } },
        deliveries: { orderBy: { scheduledAt: 'desc' }, take: 5 },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async getOwned(userId: string, id: string) {
    const pack = await this.prisma.velRepeatPack.findUnique({ where: { id } });
    if (!pack || pack.userId !== userId) {
      throw new NotFoundException('Pack not found');
    }
    return pack;
  }

  async pause(userId: string, id: string) {
    const pack = await this.getOwned(userId, id);
    if (pack.status !== 'ACTIVE') {
      throw new BadRequestException('Only ACTIVE packs can be paused');
    }
    await this.prisma.velRepeatHistory.create({
      data: { packId: id, action: 'PAUSED' },
    });
    return this.prisma.velRepeatPack.update({
      where: { id },
      data: { status: 'PAUSED' },
    });
  }

  async resume(userId: string, id: string) {
    const pack = await this.getOwned(userId, id);
    if (pack.status !== 'PAUSED') {
      throw new BadRequestException('Only PAUSED packs can be resumed');
    }
    if (pack.remainingUnits <= 0) {
      throw new BadRequestException('Pack has no remaining units');
    }
    const nextDeliveryDate = computeNextDeliveryDate(new Date(), pack.frequency);
    await this.prisma.velRepeatHistory.create({
      data: { packId: id, action: 'RESUMED' },
    });
    return this.prisma.velRepeatPack.update({
      where: { id },
      data: { status: 'ACTIVE', nextDeliveryDate },
    });
  }

  async cancel(userId: string, id: string) {
    const pack = await this.getOwned(userId, id);
    if (pack.status === 'CANCELLED' || pack.status === 'COMPLETED') {
      throw new BadRequestException('Pack is already closed');
    }
    await this.prisma.velRepeatHistory.create({
      data: {
        packId: id,
        action: 'CANCELLED',
        note: `remainingUnits=${pack.remainingUnits}`,
      },
    });
    return this.prisma.velRepeatPack.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  async history(userId: string, id: string) {
    await this.getOwned(userId, id);
    return this.prisma.velRepeatHistory.findMany({
      where: { packId: id },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * สำหรับ Merchant / Center: นับจำนวนแพ็กตามสถานะ
   */
  async platformSummary() {
    const [active, paused, completed, cancelled] = await Promise.all([
      this.prisma.velRepeatPack.count({ where: { status: 'ACTIVE' } }),
      this.prisma.velRepeatPack.count({ where: { status: 'PAUSED' } }),
      this.prisma.velRepeatPack.count({ where: { status: 'COMPLETED' } }),
      this.prisma.velRepeatPack.count({ where: { status: 'CANCELLED' } }),
    ]);
    return {
      active,
      paused,
      completed,
      cancelled,
      total: active + paused + completed + cancelled,
    };
  }

  /**
   * Cron engine: หา pack ที่ถึงวันส่ง + ยังมีเครดิต
   * → สร้าง Order (paymentStatus = PAID, shipping ตาม freeShipping)
   * → ลด remainingUnits / stock
   * → บันทึก delivery + history
   * → ถ้า remaining = 0 → COMPLETED
   */
  async processDuePacks(now: Date = new Date()) {
    const due = await this.prisma.velRepeatPack.findMany({
      where: {
        status: 'ACTIVE',
        nextDeliveryDate: { lte: now },
        remainingUnits: { gt: 0 },
      },
      include: { product: { include: { shop: true } } },
    });

    const results: {
      packId: string;
      orderId?: string;
      skipped?: string;
      completed?: boolean;
    }[] = [];

    for (const pack of due) {
      const units = Math.min(pack.unitsPerDelivery, pack.remainingUnits);

      if (pack.product.stock < units) {
        // eslint-disable-next-line no-await-in-loop
        await this.prisma.velRepeatHistory.create({
          data: {
            packId: pack.id,
            action: 'SKIPPED_OUT_OF_STOCK',
            note: `needed=\( {units} stock= \){pack.product.stock}`,
          },
        });
        results.push({ packId: pack.id, skipped: 'OUT_OF_STOCK' });
        continue;
      }

      const subtotal = Number(pack.unitPrice) * units;
      const shippingFee = pack.freeShipping ? 0 : 40;
      const total = subtotal + shippingFee;
      const remainingAfter = pack.remainingUnits - units;
      const nextDeliveryDate =
        remainingAfter > 0
          ? computeNextDeliveryDate(now, pack.frequency)
          : pack.nextDeliveryDate;

      // eslint-disable-next-line no-await-in-loop
      const order = await this.prisma.$transaction(async (tx) => {
        const created = await tx.order.create({
          data: {
            userId: pack.userId,
            orderNumber: generateOrderNumber(),
            status: 'CONFIRMED',
            subtotal,
            shippingFee,
            total,
            paymentStatus: 'PAID', // prepaid แล้ว
            items: {
              create: [
                {
                  productId: pack.productId,
                  merchantId: pack.product.shop.merchantId,
                  quantity: units,
                  price: pack.unitPrice,
                },
              ],
            },
            payment: {
              create: {
                method: 'velrepeat_prepaid',
                amount: total,
                status: 'PAID',
                paidAt: now,
                transactionId: pack.prepaidPaymentId ?? `PACK-${pack.id}`,
              },
            },
          },
        });

        await tx.product.update({
          where: { id: pack.productId },
          data: { stock: { decrement: units } },
        });

        await tx.velRepeatDelivery.create({
          data: {
            packId: pack.id,
            orderId: created.id,
            units,
            scheduledAt: pack.nextDeliveryDate,
            deliveredAt: now,
          },
        });

        await tx.velRepeatPack.update({
          where: { id: pack.id },
          data: {
            remainingUnits: remainingAfter,
            nextDeliveryDate,
            status: remainingAfter <= 0 ? 'COMPLETED' : 'ACTIVE',
          },
        });

        await tx.velRepeatHistory.create({
          data: {
            packId: pack.id,
            action: remainingAfter <= 0 ? 'COMPLETED' : 'DELIVERED',
            note: `order=${created.orderNumber} units=${units} remaining=${remainingAfter}`,
          },
        });

        return created;
      });

      results.push({
        packId: pack.id,
        orderId: order.id,
        completed: remainingAfter <= 0,
      });
    }

    if (results.length > 0) {
      this.logger.log(`VelRepeat: processed ${results.length} due pack(s)`);
    }

    return results;
  }
}