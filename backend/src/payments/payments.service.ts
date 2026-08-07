import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { createPromptPayQrDataUrl } from './promptpay-qr.util';

/** หน้าต่างชำระ PromptPay หลังสร้างออเดอร์ (ชั่วโมง) */
const PAYMENT_WINDOW_HOURS = 24;

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  private paymentWindow(createdAt: Date) {
    const expiresAt = new Date(
      createdAt.getTime() + PAYMENT_WINDOW_HOURS * 60 * 60 * 1000,
    );
    const now = Date.now();
    const remainingMs = Math.max(0, expiresAt.getTime() - now);
    return {
      expiresAt,
      remainingMs,
      expired: remainingMs <= 0,
      paymentWindowHours: PAYMENT_WINDOW_HOURS,
    };
  }

  async getPromptPayQrForOrder(orderId: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { payment: true },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.paymentStatus === 'PAID') {
      throw new BadRequestException('Order is already paid');
    }
    if (order.status === 'CANCELLED') {
      throw new BadRequestException('Order was cancelled');
    }

    const window = this.paymentWindow(order.createdAt);
    if (window.expired) {
      throw new BadRequestException(
        'หมดเวลาชำระเงินแล้ว (24 ชั่วโมงหลังสั่งซื้อ) กรุณาสั่งซื้อใหม่',
      );
    }

    const settings = await this.prisma.platformSettings.findUnique({
      where: { id: 'default' },
    });

    const promptPayId =
      (settings?.promptPayId && String(settings.promptPayId).trim()) ||
      process.env.PROMPTPAY_ID?.trim() ||
      '';

    if (!promptPayId) {
      throw new BadRequestException(
        'ยังไม่ได้ตั้งค่า PromptPay ID (VelCenter ตั้งค่า หรือ env PROMPTPAY_ID)',
      );
    }

    const amount = Number(order.total);
    if (!(amount > 0)) {
      throw new BadRequestException('Invalid order amount');
    }

    let qr: { payload: string; qrDataUrl: string };
    try {
      qr = await createPromptPayQrDataUrl(promptPayId, amount);
    } catch (e) {
      throw new BadRequestException(
        e instanceof Error ? e.message : 'สร้าง QR ไม่สำเร็จ',
      );
    }

    if (order.payment) {
      await this.prisma.payment.update({
        where: { id: order.payment.id },
        data: {
          method: 'PROMPTPAY_QR',
          amount: order.total,
          status: order.payment.status === 'PAID' ? 'PAID' : 'PENDING',
        },
      });
    } else {
      await this.prisma.payment.create({
        data: {
          orderId: order.id,
          method: 'PROMPTPAY_QR',
          amount: order.total,
          status: 'PENDING',
        },
      });
    }

    const payment = await this.prisma.payment.findUnique({
      where: { orderId: order.id },
    });

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount,
      currency: 'THB',
      promptPayIdMasked: maskId(promptPayId),
      bankAccountName: settings?.bankAccountName ?? null,
      bankName: settings?.bankName ?? null,
      qrDataUrl: qr.qrDataUrl,
      slipUrl: (payment as { slipUrl?: string | null } | null)?.slipUrl ?? null,
      createdAt: order.createdAt.toISOString(),
      expiresAt: window.expiresAt.toISOString(),
      paymentWindowHours: window.paymentWindowHours,
      message:
        'สแกน QR ด้วยแอปธนาคาร ยอดจะขึ้นอัตโนมัติ จากนั้นกดยืนยันการโอน แล้วอัปโหลดสลิป ภายใน 24 ชั่วโมง',
    };
  }

  async submitSlip(orderId: string, userId: string, slipUrl: string) {
    const url = slipUrl?.trim();
    if (!url || !/^https?:\/\//i.test(url)) {
      throw new BadRequestException('กรุณาแนบลิงก์รูปสลิปที่ถูกต้อง');
    }

    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { payment: true },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.paymentStatus === 'PAID') {
      throw new BadRequestException('Order is already paid');
    }
    if (order.status === 'CANCELLED') {
      throw new BadRequestException('Order was cancelled');
    }

    const window = this.paymentWindow(order.createdAt);
    if (window.expired) {
      throw new BadRequestException(
        'หมดเวลาชำระเงินแล้ว (24 ชั่วโมงหลังสั่งซื้อ) ไม่สามารถอัปโหลดสลิปได้',
      );
    }

    const data = {
      method: order.payment?.method || 'PROMPTPAY_QR',
      amount: order.total,
      status: 'PENDING' as const,
      slipUrl: url,
      slipUploadedAt: new Date(),
    };

    if (order.payment) {
      await this.prisma.payment.update({
        where: { id: order.payment.id },
        data,
      });
    } else {
      await this.prisma.payment.create({
        data: {
          orderId: order.id,
          ...data,
        },
      });
    }

    return {
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      slipUrl: url,
      expiresAt: window.expiresAt.toISOString(),
      message: 'อัปโหลดสลิปแล้ว รอเจ้าหน้าที่ตรวจสอบ',
    };
  }
}

function maskId(id: string): string {
  const d = id.replace(/\D/g, '');
  if (d.length <= 4) return '****';
  return `${d.slice(0, 3)}****${d.slice(-3)}`;
}
