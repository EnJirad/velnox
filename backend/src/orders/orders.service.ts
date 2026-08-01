import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

const SHIPPING_FEE = 40;
const FREE_SHIPPING_THRESHOLD = 990;

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `VLX-${timestamp}-${random}`;
}

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async createFromCart(userId: string) {
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
        },
        include: { items: true },
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

    return order;
  }

  findMine(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } } },
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

  async findForMerchant(userId: string) {
    const merchant = await this.prisma.merchant.findUnique({ where: { userId } });
    if (!merchant) {
      throw new ForbiddenException('You do not have a merchant account');
    }
    return this.prisma.orderItem.findMany({
      where: { merchantId: merchant.id },
      include: { order: true, product: true },
      orderBy: { order: { createdAt: 'desc' } },
    });
  }

  findAll() {
    return this.prisma.order.findMany({
      include: { items: true, user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return this.prisma.order.update({ where: { id }, data: { status: dto.status } });
  }
}
