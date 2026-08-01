import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UpdateMerchantStatusDto } from './dto/update-merchant-status.dto';

@Injectable()
export class MerchantsService {
  constructor(private readonly prisma: PrismaService) {}

  async apply(userId: string) {
    const existing = await this.prisma.merchant.findUnique({ where: { userId } });
    if (existing) {
      throw new ConflictException('A merchant application already exists for this user');
    }
    return this.prisma.merchant.create({ data: { userId, status: 'PENDING' } });
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
    return this.prisma.merchant.update({
      where: { id },
      data: {
        status: dto.status,
        approvedAt: dto.status === 'APPROVED' ? new Date() : merchant.approvedAt,
      },
    });
  }
}
