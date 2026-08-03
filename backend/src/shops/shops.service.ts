import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { AdminUpdateShopStatusDto } from './dto/admin-update-shop-status.dto';

@Injectable()
export class ShopsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.shop.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        merchant: {
          select: {
            id: true,
            status: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
        _count: {
          select: { products: true },
        },
      },
    });
  }

  async findById(id: string) {
    const shop = await this.prisma.shop.findUnique({
      where: { id },
      include: {
        merchant: {
          select: {
            id: true,
            status: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
        products: {
          where: { status: { not: 'ARCHIVED' } },
          orderBy: { createdAt: 'desc' },
          include: {
            images: { orderBy: { sortOrder: 'asc' }, take: 1 },
            category: { select: { id: true, name: true } },
          },
        },
        _count: {
          select: { products: true },
        },
      },
    });
    if (!shop) {
      throw new NotFoundException('Shop not found');
    }
    return shop;
  }

  async getAdminStats(id: string) {
    const shop = await this.prisma.shop.findUnique({ where: { id } });
    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    const items = await this.prisma.orderItem.findMany({
      where: { product: { shopId: id } },
      include: {
        product: { select: { id: true, name: true } },
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            paymentStatus: true,
            createdAt: true,
          },
        },
      },
    });

    let totalRevenue = 0;
    const orderMap = new Map<
      string,
      {
        id: string;
        orderNumber: string;
        status: string;
        paymentStatus: string;
        createdAt: Date;
        itemTotal: number;
      }
    >();
    const productMap = new Map<
      string,
      { productId: string; name: string; quantitySold: number; revenue: number }
    >();

    for (const it of items) {
      const line = Number(it.price) * it.quantity;
      totalRevenue += line;

      const existingOrder = orderMap.get(it.orderId);
      if (existingOrder) {
        existingOrder.itemTotal += line;
      } else {
        orderMap.set(it.orderId, {
          id: it.order.id,
          orderNumber: it.order.orderNumber,
          status: it.order.status,
          paymentStatus: it.order.paymentStatus,
          createdAt: it.order.createdAt,
          itemTotal: line,
        });
      }

      const existingProduct = productMap.get(it.productId);
      if (existingProduct) {
        existingProduct.quantitySold += it.quantity;
        existingProduct.revenue += line;
      } else {
        productMap.set(it.productId, {
          productId: it.productId,
          name: it.product.name,
          quantitySold: it.quantity,
          revenue: line,
        });
      }
    }

    const topProducts = [...productMap.values()]
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 10);

    const recentOrders = [...orderMap.values()]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 20)
      .map((o) => ({
        ...o,
        createdAt: o.createdAt.toISOString(),
      }));

    const productCounts = await this.prisma.product.groupBy({
      by: ['status'],
      where: { shopId: id },
      _count: true,
    });

    const productsByStatus = Object.fromEntries(
      productCounts.map((r) => [r.status, r._count]),
    );

    return {
      shopId: id,
      totalRevenue,
      totalOrders: orderMap.size,
      totalItemsSold: items.reduce((s, it) => s + it.quantity, 0),
      productsByStatus,
      topProducts,
      recentOrders,
    };
  }

  async adminUpdateStatus(id: string, dto: AdminUpdateShopStatusDto) {
    const shop = await this.prisma.shop.findUnique({ where: { id } });
    if (!shop) {
      throw new NotFoundException('Shop not found');
    }
    return this.prisma.shop.update({
      where: { id },
      data: { status: dto.status },
    });
  }

  async adminDelete(id: string) {
    const shop = await this.prisma.shop.findUnique({ where: { id } });
    if (!shop) {
      throw new NotFoundException('Shop not found');
    }
    await this.prisma.shop.delete({ where: { id } });
    return { success: true, id };
  }

  private async getOwnedMerchant(userId: string) {
    const merchant = await this.prisma.merchant.findUnique({ where: { userId } });
    if (!merchant) {
      throw new ForbiddenException('You do not have an approved merchant account');
    }
    if (merchant.status !== 'APPROVED') {
      throw new ForbiddenException('Your merchant account is not approved yet');
    }
    return merchant;
  }

  async createForUser(userId: string, dto: CreateShopDto) {
    const merchant = await this.getOwnedMerchant(userId);
    return this.prisma.shop.create({ data: { ...dto, merchantId: merchant.id } });
  }

  async findMine(userId: string) {
    const merchant = await this.prisma.merchant.findUnique({ where: { userId } });
    if (!merchant) {
      throw new NotFoundException('No merchant account found');
    }
    return this.prisma.shop.findMany({
      where: { merchantId: merchant.id },
      include: { _count: { select: { products: true } } },
    });
  }

  async updateOwned(userId: string, shopId: string, dto: UpdateShopDto) {
    const merchant = await this.getOwnedMerchant(userId);
    const shop = await this.prisma.shop.findUnique({ where: { id: shopId } });
    if (!shop || shop.merchantId !== merchant.id) {
      throw new ForbiddenException('You do not own this shop');
    }
    return this.prisma.shop.update({ where: { id: shopId }, data: dto });
  }
}