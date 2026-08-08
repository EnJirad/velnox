import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ShippingAddressDto } from './dto/checkout.dto';
import { EventsGateway } from '../events/events.gateway';

const SHIPPING_FEE = 40;
const FREE_SHIPPING_THRESHOLD = 990;

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `VLX-${timestamp}-${random}`;
}


/** ฟิลด์ order สำหรับ list — ไม่พึ่ง shipping ถ้า DB ยังไม่ sync; detail ใช้ full */
/** list ไม่ดึง shipping_* เพื่อกัน 500 ถ้า DB ยังไม่ sync คอลัมน์ (detail ค่อยดึงเต็ม) */
const ORDER_LIST_SELECT = {
  id: true,
  userId: true,
  orderNumber: true,
  status: true,
  subtotal: true,
  shippingFee: true,
  total: true,
  paymentStatus: true,
  createdAt: true,
  trackingNumber: true,
  carrier: true,
  shippingName: true,
  shippingPhone: true,
  shippingAddressLine: true,
  shippingProvince: true,
  shippingPostalCode: true,
  shippingCountry: true,
} as const;

/** ตัด | GPS:lat,lng ออก — ร้านไม่ควรเห็นพิกัด (Center / แอปขนส่งเท่านั้น) */
function stripGeoFromAddressLine(line: string | null | undefined): string | null {
  if (line == null) return line ?? null;
  return line.replace(/\s*\|\s*GPS:[-\d.]+,[-\d.]+\s*$/i, '').trim();
}

function sanitizeOrderShippingForMerchant<T extends { shippingAddressLine?: string | null }>(
  order: T,
): T {
  return {
    ...order,
    shippingAddressLine: stripGeoFromAddressLine(order.shippingAddressLine),
  };
}


function normalizePaymentMethod(method?: string): string {
  const m = (method || 'promptpay').trim();
  const map: Record<string, string> = {
    promptpay: 'PROMPTPAY_QR',
    PROMPTPAY: 'PROMPTPAY_QR',
    PROMPTPAY_QR: 'PROMPTPAY_QR',
    card: 'CARD',
    CARD: 'CARD',
    cod: 'COD',
    COD: 'COD',
    bank_transfer: 'BANK_TRANSFER',
    BANK_TRANSFER: 'BANK_TRANSFER',
  };
  return map[m] ?? map[m.toLowerCase()] ?? m;
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventsGateway,
  ) {}

  async createFromCart(
    userId: string,
    paymentMethod: string = 'promptpay',
    shipping?: ShippingAddressDto,
  ) {
    if (
      !shipping ||
      !shipping.name?.trim() ||
      !shipping.phone?.trim() ||
      !shipping.addressLine?.trim() ||
      !shipping.province?.trim() ||
      !shipping.postalCode?.trim()
    ) {
      throw new BadRequestException('Shipping address is required');
    }

    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        throw new BadRequestException(`Not enough stock for ${item.product.name}`);
      }
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0,
    );
    const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const total = subtotal + shippingFee;

    const order = await this.prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId,
          orderNumber: generateOrderNumber(),
          status: 'PENDING',
          subtotal,
          shippingFee,
          total,
          paymentStatus: 'PENDING',
          shippingName: shipping.name.trim(),
          shippingPhone: shipping.phone.trim(),
          shippingAddressLine: shipping.addressLine.trim(),
          shippingProvince: shipping.province.trim(),
          shippingPostalCode: shipping.postalCode.trim(),
          shippingCountry: (shipping.country ?? 'TH').trim() || 'TH',
          items: {
            create: await Promise.all(
              cart.items.map(async (item) => {
                const product = await tx.product.findUniqueOrThrow({
                  where: { id: item.productId },
                });
                const shop = await tx.shop.findUniqueOrThrow({ where: { id: product.shopId } });
                return {
                  productId: item.productId,
                  merchantId: shop.merchantId,
                  quantity: item.quantity,
                  price: item.price,
                };
              }),
            ),
          },
          payment: {
            create: {
              method: normalizePaymentMethod(paymentMethod),
              amount: total,
              status: 'PENDING',
            },
          },
        },
        include: {
          items: { include: { product: { select: { id: true, name: true } } } },
          payment: true,
          user: { select: { id: true, name: true, email: true } },
        },
      });

      await Promise.all(
        cart.items.map((item) =>
          tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          }),
        ),
      );

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return created;
    });

    this.events.emitOrderCreated(order);
    return order;
  }

  findMine(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: { orderBy: { sortOrder: 'asc' }, take: 1 },
              },
            },
          },
        },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneForUser(userId: string, id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } }, payment: true },
    });
    if (!order || order.userId !== userId) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async findAdminById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        payment: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: { orderBy: { sortOrder: 'asc' }, take: 1 },
              },
            },
            merchant: {
              select: {
                id: true,
                user: { select: { name: true, email: true } },
              },
            },
          },
        },
      },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async findForMerchant(userId: string) {
    const merchant = await this.prisma.merchant.findUnique({ where: { userId } });
    if (!merchant) {
      throw new ForbiddenException('You do not have a merchant account');
    }
    const rows = await this.prisma.orderItem.findMany({
      where: { merchantId: merchant.id },
      select: {
        id: true,
        orderId: true,
        productId: true,
        merchantId: true,
        quantity: true,
        price: true,
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            images: { orderBy: { sortOrder: 'asc' }, take: 1 },
          },
        },
        order: { select: { ...ORDER_LIST_SELECT, payment: true } },
      },
      orderBy: { order: { createdAt: 'desc' } },
    });
    // Merchant: ที่อยู่ข้อความเท่านั้น — ไม่ส่งพิกัด
    return rows.map((row) => ({
      ...row,
      order: row.order
        ? sanitizeOrderShippingForMerchant(row.order)
        : row.order,
    }));
  }

  findAll() {
    return this.prisma.order.findMany({
      select: {
        ...ORDER_LIST_SELECT,
        items: {
          select: {
            id: true,
            orderId: true,
            productId: true,
            merchantId: true,
            quantity: true,
            price: true,
            product: { select: { id: true, name: true } },
          },
        },
        user: { select: { id: true, name: true, email: true } },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }


  /**
   * ร้านกรอกเลขพัสดุ → ออเดอร์เป็น SHIPPED
   * แจ้ง Shop + Center ผ่าน order:updated
   */
  async shipForMerchant(
    userId: string,
    orderId: string,
    trackingNumber: string,
    carrier?: string,
  ) {
    const merchant = await this.prisma.merchant.findUnique({ where: { userId } });
    if (!merchant) {
      throw new ForbiddenException('You do not have a merchant account');
    }

    const item = await this.prisma.orderItem.findFirst({
      where: { orderId, merchantId: merchant.id },
    });
    if (!item) {
      throw new ForbiddenException('Order does not belong to this merchant');
    }

    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.paymentStatus !== 'PAID') {
      throw new BadRequestException('ออเดอร์ยังไม่ชำระเงิน');
    }
    if (order.status === 'CANCELLED' || order.status === 'DELIVERED') {
      throw new BadRequestException('ไม่สามารถอัปเดตออเดอร์นี้ได้');
    }

    const tn = trackingNumber.trim();
    if (tn.length < 3) {
      throw new BadRequestException('กรุณากรอกเลขพัสดุ');
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        trackingNumber: tn,
        carrier: carrier?.trim() || null,
        status: 'SHIPPED',
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        payment: true,
        items: {
          include: {
            product: { select: { id: true, name: true } },
            merchant: { select: { id: true } },
          },
        },
      },
    });

    this.events.emitOrderUpdated({
      ...updated,
      notify: 'ORDER_SHIPPED',
      message: 'ร้านค้าอัปเดตเลขพัสดุแล้ว — สินค้ากำลังจัดส่ง',
    });

    return updated;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    const updated = await this.prisma.order.update({
      where: { id },
      data: { status: dto.status },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            product: { select: { id: true, name: true } },
          },
        },
      },
    });
    this.events.emitOrderUpdated(updated);
    return updated;
  }
}
