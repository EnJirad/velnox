import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPlatformStats() {
    const [
      activeUsers,
      activeMerchants,
      pendingMerchants,
      activeProducts,
      openOrders,
      paidOrders,
      velrepeatActive,
      velrepeatPaused,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: 'CUSTOMER', status: 'ACTIVE' } }),
      this.prisma.merchant.count({ where: { status: 'APPROVED' } }),
      this.prisma.merchant.count({ where: { status: 'PENDING' } }),
      this.prisma.product.count({ where: { status: 'ACTIVE' } }),
      this.prisma.order.count({ where: { status: { notIn: ['DELIVERED', 'CANCELLED'] } } }),
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: { paymentStatus: 'PAID' },
      }),
      this.prisma.velRepeatSubscription.count({ where: { status: 'ACTIVE' } }),
      this.prisma.velRepeatSubscription.count({ where: { status: 'PAUSED' } }),
    ]);

    return {
      gmv: Number(paidOrders._sum.total ?? 0),
      activeUsers,
      activeMerchants,
      pendingMerchants,
      pendingProducts: activeProducts,
      openOrders,
      velrepeatActive,
      velrepeatPaused,
    };
  }

  async getRevenueChart() {
    const since = new Date();
    since.setMonth(since.getMonth() - 5);
    since.setDate(1);
    since.setHours(0, 0, 0, 0);

    const orders = await this.prisma.order.findMany({
      where: {
        paymentStatus: 'PAID',
        createdAt: { gte: since },
      },
      select: { total: true, createdAt: true },
    });

    const monthLabels = [
      'ม.ค.',
      'ก.พ.',
      'มี.ค.',
      'เม.ย.',
      'พ.ค.',
      'มิ.ย.',
      'ก.ค.',
      'ส.ค.',
      'ก.ย.',
      'ต.ค.',
      'พ.ย.',
      'ธ.ค.',
    ];
    const buckets = new Map<string, number>();

    for (let i = 0; i < 6; i++) {
      const d = new Date(since);
      d.setMonth(since.getMonth() + i);
      const key = d.getFullYear() + '-' + d.getMonth();
      buckets.set(key, 0);
    }

    for (const order of orders) {
      const d = new Date(order.createdAt);
      const key = d.getFullYear() + '-' + d.getMonth();
      if (buckets.has(key)) {
        buckets.set(key, (buckets.get(key) ?? 0) + Number(order.total));
      }
    }

    return [...buckets.entries()].map(([key, amount]) => {
      const monthIndex = Number(key.split('-')[1]);
      return {
        month: monthLabels[monthIndex] ?? key,
        amount: Math.round((amount / 1_000_000) * 100) / 100,
      };
    });
  }

  async getRecentOrders() {
    return this.prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });
  }

  async getMerchantDashboard(userId: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { userId },
      include: { shops: true },
    });

    if (!merchant || merchant.shops.length === 0) {
      return {
        revenueToday: 0,
        revenueYesterday: 0,
        ordersToday: 0,
        ordersYesterday: 0,
        pendingOrders: 0,
        lowStockCount: 0,
        productCount: 0,
        salesLast7Days: [] as { date: string; label: string; amount: number }[],
        recentItems: [] as {
          id: string;
          orderNumber: string;
          productName: string;
          quantity: number;
          amount: number;
          status: string;
          createdAt: Date;
        }[],
        notifications: [] as {
          id: string;
          orderId: string;
          orderNumber: string;
          productName: string;
          quantity: number;
          amount: number;
          status: string;
          createdAt: Date;
        }[],
      };
    }

    const shopIds = merchant.shops.map((s) => s.id);
    const now = new Date();
    const startToday = new Date(now);
    startToday.setHours(0, 0, 0, 0);
    const startYesterday = new Date(startToday);
    startYesterday.setDate(startYesterday.getDate() - 1);
    const start7 = new Date(startToday);
    start7.setDate(start7.getDate() - 6);

    const items = await this.prisma.orderItem.findMany({
      where: { merchantId: merchant.id },
      include: {
        order: true,
        product: { include: { images: true } },
      },
      orderBy: { order: { createdAt: 'desc' } },
    });

    const products = await this.prisma.product.findMany({
      where: { shopId: { in: shopIds }, status: { not: 'ARCHIVED' } },
    });

    const isCountable = (status: string) => status !== 'CANCELLED';

    const sumForDay = (dayStart: Date) => {
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      return items
        .filter((i) => {
          const d = new Date(i.order.createdAt);
          return d >= dayStart && d < dayEnd && isCountable(i.order.status);
        })
        .reduce((s, i) => s + Number(i.price) * i.quantity, 0);
    };

    const countOrdersForDay = (dayStart: Date) => {
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      return new Set(
        items
          .filter((i) => {
            const d = new Date(i.order.createdAt);
            return d >= dayStart && d < dayEnd && isCountable(i.order.status);
          })
          .map((i) => i.orderId),
      ).size;
    };

    const dayLabels = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
    const salesLast7Days: { date: string; label: string; amount: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start7);
      d.setDate(start7.getDate() + i);
      salesLast7Days.push({
        date: d.toISOString().slice(0, 10),
        label: dayLabels[d.getDay()],
        amount: sumForDay(d),
      });
    }

    const pendingOrders = new Set(
      items
        .filter((i) => ['PENDING', 'CONFIRMED', 'PROCESSING'].includes(i.order.status))
        .map((i) => i.orderId),
    ).size;

    const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 10).length;

    const notifications = items.slice(0, 20).map((i) => ({
      id: i.id,
      orderId: i.orderId,
      orderNumber: i.order.orderNumber,
      productName: i.product.name,
      quantity: i.quantity,
      amount: Number(i.price) * i.quantity,
      status: i.order.status,
      createdAt: i.order.createdAt,
    }));

    const recentItems = items.slice(0, 8).map((i) => ({
      id: i.id,
      orderNumber: i.order.orderNumber,
      productName: i.product.name,
      quantity: i.quantity,
      amount: Number(i.price) * i.quantity,
      status: i.order.status,
      createdAt: i.order.createdAt,
    }));

    return {
      revenueToday: sumForDay(startToday),
      revenueYesterday: sumForDay(startYesterday),
      ordersToday: countOrdersForDay(startToday),
      ordersYesterday: countOrdersForDay(startYesterday),
      pendingOrders,
      lowStockCount,
      productCount: products.length,
      salesLast7Days,
      recentItems,
      notifications,
    };
  }

  async getMerchantAnalytics(userId: string, fromIso?: string, toIso?: string) {
    const merchant = await this.prisma.merchant.findUnique({ where: { userId } });
    if (!merchant) {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        avgOrderValue: 0,
        series: [] as { date: string; amount: number }[],
        topProducts: [] as { productId: string; name: string; qty: number; revenue: number }[],
      };
    }

    const to = toIso ? new Date(toIso) : new Date();
    to.setHours(23, 59, 59, 999);

    const from = fromIso ? new Date(fromIso) : new Date(to);
    if (!fromIso) {
      from.setDate(from.getDate() - 29);
    }
    from.setHours(0, 0, 0, 0);

    const items = await this.prisma.orderItem.findMany({
      where: {
        merchantId: merchant.id,
        order: {
          createdAt: { gte: from, lte: to },
          status: { not: 'CANCELLED' },
        },
      },
      include: { order: true, product: true },
    });

    const totalRevenue = items.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
    const orderIds = new Set(items.map((i) => i.orderId));
    const totalOrders = orderIds.size;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const byDay = new Map<string, number>();
    for (const i of items) {
      const key = new Date(i.order.createdAt).toISOString().slice(0, 10);
      byDay.set(key, (byDay.get(key) ?? 0) + Number(i.price) * i.quantity);
    }

    const series: { date: string; amount: number }[] = [];
    const cursor = new Date(from);
    while (cursor <= to) {
      const key = cursor.toISOString().slice(0, 10);
      series.push({ date: key, amount: byDay.get(key) ?? 0 });
      cursor.setDate(cursor.getDate() + 1);
    }

    const productMap = new Map<string, { name: string; qty: number; revenue: number }>();
    for (const i of items) {
      const cur = productMap.get(i.productId) ?? {
        name: i.product.name,
        qty: 0,
        revenue: 0,
      };
      cur.qty += i.quantity;
      cur.revenue += Number(i.price) * i.quantity;
      productMap.set(i.productId, cur);
    }

    const topProducts = [...productMap.entries()]
      .map(([productId, v]) => ({ productId, ...v }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10);

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      series,
      topProducts,
    };
  }
}