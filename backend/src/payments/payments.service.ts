import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { createPromptPayQrDataUrl } from './promptpay-qr.util';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

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
      message:
        'สแกน QR ด้วยแอปธนาคาร ยอดจะขึ้นอัตโนมัติ จากนั้นกดยืนยันการโอน แล้วอัปโหลดสลิป',
    };
  }

  /** ลูกค้าอัปโหลดสลิปหลังโอน (เก็บ URL จาก Cloudinary) */
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
      message: 'อัปโหลดสลิปแล้ว รอเจ้าหน้าที่ตรวจสอบ',
    };
  }
}

function maskId(id: string): string {
  const d = id.replace(/\D/g, '');
  if (d.length <= 4) return '****';
  return `${d.slice(0, 3)}****${d.slice(-3)}`;
}
