import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UpdateMerchantStatusDto } from './dto/update-merchant-status.dto';

const SETTINGS_ID = 'default';

@Injectable()
export class MerchantsService {
  constructor(private readonly prisma: PrismaService) {}

  async apply(userId: string) {
    const existing = await this.prisma.merchant.findUnique({ where: { userId } });
    if (existing) {
      throw new ConflictException('A merchant application already exists for this user');
    }

    const settings = await this.prisma.platformSettings.findUnique({
      where: { id: SETTINGS_ID },
    });
    const autoApprove = settings?.autoApproveMerchants === true;

    const merchant = await this.prisma.merchant.create({
      data: {
        userId,
        status: autoApprove ? 'APPROVED' : 'PENDING',
        approvedAt: autoApprove ? new Date() : null,
      },
    });

    if (autoApprove) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { role: 'MERCHANT' },
      });
    }

    return merchant;
  }

  async findMine(userId: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { userId },
      include: { shops: true },
    });
    if (!merchant) {
      throw new NotFoundException('No merchant application found for this account');
    }
    return merchant;
  }

  findAll() {
    return this.prisma.merchant.findMany({
      include: { user: { select: { id: true, name: true, email: true } }, shops: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, dto: UpdateMerchantStatusDto) {
    const merchant = await this.prisma.merchant.findUnique({ where: { id } });
    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    const updated = await this.prisma.merchant.update({
      where: { id },
      data: {
        status: dto.status,
        approvedAt: dto.status === 'APPROVED' ? new Date() : merchant.approvedAt,
      },
    });

    await this.prisma.user.update({
      where: { id: merchant.userId },
      data: { role: dto.status === 'APPROVED' ? 'MERCHANT' : 'CUSTOMER' },
    });

    return updated;
  }
}
