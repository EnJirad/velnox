import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';

@Injectable()
export class ShopsService {
  constructor(private readonly prisma: PrismaService) {}

  /** รายการร้านทั้งหมด (VelCenter / public) พร้อมจำนวนสินค้า */
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

  /** รายละเอียดร้าน + สินค้าทั้งหมดของร้าน (ทุกสถานะ ยกเว้น ARCHIVED) */
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