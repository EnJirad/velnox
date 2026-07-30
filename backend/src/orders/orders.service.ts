import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: any) {
    // Basic implementation for MVP
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    return this.prisma.order.create({
      data: {
        userId,
        orderNumber,
        subtotal: data.subtotal,
        total: data.total,
        status: OrderStatus.PENDING,
        items: {
          create: data.items.map((item: any) => ({
            productId: item.productId,
            merchantId: item.merchantId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: true,
      },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
            merchant: true,
          },
        },
        user: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }
}
