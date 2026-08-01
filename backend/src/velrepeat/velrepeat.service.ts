import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

function computeNextOrderDate(
  from: Date,
  frequency: 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY' | 'CUSTOM',
  customIntervalDays?: number,
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
    case 'CUSTOM':
      next.setDate(next.getDate() + (customIntervalDays ?? 30));
      break;
  }
  return next;
}

const SHIPPING_FEE = 40;
const FREE_SHIPPING_THRESHOLD = 990;

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `VLR-${timestamp}-${random}`;
}

@Injectable()
export class VelRepeatService {
  private readonly logger = new Logger(VelRepeatService.name);

  constructor(private readonly prisma: PrismaService) {}

  async subscribe(userId: string, dto: CreateSubscriptionDto) {
    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product || product.status !== 'ACTIVE') {
      throw new NotFoundException('Product not found');
    }
    if (dto.frequency === 'CUSTOM' && !dto.customIntervalDays) {
      throw new BadRequestException('customIntervalDays is required for CUSTOM frequency');
    }

    const nextOrderDate = computeNextOrderDate(new Date(), dto.frequency, dto.customIntervalDays);

    const subscription = await this.prisma.velRepeatSubscription.create({
      data: {
        userId,
        productId: dto.productId,
        frequency: dto.frequency,
        quantity: dto.quantity,
        status: 'ACTIVE',
        nextOrderDate,
      },
    });

    await this.prisma.velRepeatHistory.create({
      data: { subscriptionId: subscription.id, action: 'SUBSCRIBED' },
    });

    return subscription;
  }

  findMine(userId: string) {
    return this.prisma.velRepeatSubscription.findMany({
      where: { userId },
      include: { product: { include: { images: true, shop: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async getOwned(userId: string, id: string) {
    const subscription = await this.prisma.velRepeatSubscription.findUnique({ where: { id } });
    if (!subscription || subscription.userId !== userId) {
      throw new NotFoundException('Subscription not found');
    }
    return subscription;
  }

  async pause(userId: string, id: string) {
    await this.getOwned(userId, id);
    await this.prisma.velRepeatHistory.create({ data: { subscriptionId: id, action: 'PAUSED' } });
    return this.prisma.velRepeatSubscription.update({ where: { id }, data: { status: 'PAUSED' } });
  }

  async resume(userId: string, id: string) {
    const subscription = await this.getOwned(userId, id);
    const nextOrderDate = computeNextOrderDate(new Date(), subscription.frequency);
    await this.prisma.velRepeatHistory.create({ data: { subscriptionId: id, action: 'RESUMED' } });
    return this.prisma.velRepeatSubscription.update({
      where: { id },
      data: { status: 'ACTIVE', nextOrderDate },
    });
  }

  async cancel(userId: string, id: string) {
    await this.getOwned(userId, id);
    await this.prisma.velRepeatHistory.create({ data: { subscriptionId: id, action: 'CANCELLED' } });
    return this.prisma.velRepeatSubscription.update({ where: { id }, data: { status: 'CANCELLED' } });
  }

  async update(userId: string, id: string, dto: UpdateSubscriptionDto) {
    const subscription = await this.getOwned(userId, id);
    const frequency = dto.frequency ?? subscription.frequency;
    const nextOrderDate = dto.frequency
      ? computeNextOrderDate(new Date(), frequency, dto.customIntervalDays)
      : subscription.nextOrderDate;

    await this.prisma.velRepeatHistory.create({
      data: { subscriptionId: id, action: 'UPDATED' },
    });

    return this.prisma.velRepeatSubscription.update({
      where: { id },
      data: {
        frequency,
        quantity: dto.quantity ?? subscription.quantity,
        nextOrderDate,
      },
    });
  }

  async history(userId: string, id: string) {
    await this.getOwned(userId, id);
    return this.prisma.velRepeatHistory.findMany({
      where: { subscriptionId: id },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Admin/ops visibility: platform-wide subscription counts, used by
   * VelMerchant ("จำนวน VelRepeat") and VelCenter analytics per
   * docs/01_Project_Overview.md section 7 and 8.
   */
  async platformSummary() {
    const [active, paused, cancelled] = await Promise.all([
      this.prisma.velRepeatSubscription.count({ where: { status: 'ACTIVE' } }),
      this.prisma.velRepeatSubscription.count({ where: { status: 'PAUSED' } }),
      this.prisma.velRepeatSubscription.count({ where: { status: 'CANCELLED' } }),
    ]);
    return { active, paused, cancelled, total: active + paused + cancelled };
  }

  /**
   * Core VelRepeat engine: runs on a schedule (see VelRepeatCronService).
   * Finds subscriptions due today or earlier, creates an Order for each,
   * decrements stock, advances nextOrderDate, and logs history so the
   * customer/merchant/admin dashboards can all see what happened.
   */
  async processDueSubscriptions(now: Date = new Date()) {
    const due = await this.prisma.velRepeatSubscription.findMany({
      where: { status: 'ACTIVE', nextOrderDate: { lte: now } },
      include: { product: { include: { shop: true } } },
    });

    const results: { subscriptionId: string; orderId?: string; skipped?: string }[] = [];

    for (const sub of due) {
      if (sub.product.stock < sub.quantity) {
        // eslint-disable-next-line no-await-in-loop
        await this.prisma.velRepeatHistory.create({
          data: { subscriptionId: sub.id, action: 'SKIPPED_OUT_OF_STOCK' },
        });
        results.push({ subscriptionId: sub.id, skipped: 'OUT_OF_STOCK' });
        continue;
      }

      const subtotal = Number(sub.product.price) * sub.quantity;
      const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
      const total = subtotal + shippingFee;

      // eslint-disable-next-line no-await-in-loop
      const order = await this.prisma.$transaction(async (tx) => {
        const created = await tx.order.create({
          data: {
            userId: sub.userId,
            orderNumber: generateOrderNumber(),
            status: 'PENDING',
            subtotal,
            shippingFee,
            total,
            paymentStatus: 'PENDING',
            items: {
              create: [
                {
                  productId: sub.productId,
                  merchantId: sub.product.shop.merchantId,
                  quantity: sub.quantity,
                  price: sub.product.price,
                },
              ],
            },
          },
        });

        await tx.product.update({
          where: { id: sub.productId },
          data: { stock: { decrement: sub.quantity } },
        });

        const nextOrderDate = computeNextOrderDate(now, sub.frequency);
        await tx.velRepeatSubscription.update({
          where: { id: sub.id },
          data: { nextOrderDate },
        });

        await tx.velRepeatHistory.create({
          data: { subscriptionId: sub.id, action: `ORDER_CREATED:${created.orderNumber}` },
        });

        return created;
      });

      results.push({ subscriptionId: sub.id, orderId: order.id });
    }

    if (results.length > 0) {
      this.logger.log(`VelRepeat: processed ${results.length} due subscription(s)`);
    }

    return results;
  }
}
