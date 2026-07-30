import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { MerchantStatus } from '@prisma/client';

@Injectable()
export class MerchantsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.merchant.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        shops: true,
      },
    });
  }

  async findOne(id: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id },
      include: {
        user: true,
        shops: true,
      },
    });
    if (!merchant) throw new NotFoundException('Merchant not found');
    return merchant;
  }

  async findByUserId(userId: string) {
    return this.prisma.merchant.findUnique({
      where: { userId },
      include: {
        shops: true,
      },
    });
  }

  async updateStatus(id: string, status: MerchantStatus) {
    return this.prisma.merchant.update({
      where: { id },
      data: {
        status,
        ...(status === MerchantStatus.APPROVED && { approvedAt: new Date() }),
      },
    });
  }
}
