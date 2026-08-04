import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';

const SETTINGS_ID = 'default';

function slugify(input: string): string {
  return input
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\u0E00-\u0E7F\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/** Platform SKU: VLX-P- + base36 timestamp + 2 random chars */
function generateSku(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.floor(Math.random() * 1296)
    .toString(36)
    .toUpperCase()
    .padStart(2, '0');
  return `VLX-P-${ts}${rand}`;
}

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryProductsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where = {
      status: 'ACTIVE' as const,
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.shopId ? { shopId: query.shopId } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' as const } },
              { sku: { contains: query.search, mode: 'insensitive' as const } },
              { sellerSku: { contains: query.search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const orderBy =
      query.sort === 'price_asc'
        ? { price: 'asc' as const }
        : query.sort === 'price_desc'
          ? { price: 'desc' as const }
          : { createdAt: 'desc' as const };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: { images: true, category: true, shop: true },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /** Admin: ดูสินค้าทุกสถานะ รวม DRAFT */
  async findAllForAdmin() {
    return this.prisma.product.findMany({
      include: { images: true, category: true, shop: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: { images: true, category: true, shop: true },
    });
    if (!product || product.status !== 'ACTIVE') {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  private async getOwnedShopId(userId: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { userId },
      include: { shops: true },
    });
    if (!merchant || merchant.shops.length === 0) {
      throw new ForbiddenException('You do not have a shop yet');
    }
    return merchant.shops[0].id;
  }

  private async resolveNewProductStatus(): Promise<'ACTIVE' | 'DRAFT'> {
    const settings = await this.prisma.platformSettings.findUnique({
      where: { id: SETTINGS_ID },
    });
    // autoApproveProducts ชนะ requireProductReview
    if (settings?.autoApproveProducts === true) return 'ACTIVE';
    if (settings?.requireProductReview === true) return 'DRAFT';
    return 'ACTIVE';
  }

  private async ensureUniqueSku(): Promise<string> {
    let sku = generateSku();
    for (let i = 0; i < 5; i++) {
      const exists = await this.prisma.product.findUnique({ where: { sku } });
      if (!exists) return sku;
      sku = generateSku();
    }
    return generateSku();
  }

  async createForUser(userId: string, dto: CreateProductDto) {
    const shopId = await this.getOwnedShopId(userId);
    const baseSlug = slugify(dto.name);
    const slug = `\( {baseSlug}- \){Date.now().toString(36)}`;
    const status = await this.resolveNewProductStatus();
    const sku = await this.ensureUniqueSku();

    return this.prisma.product.create({
      data: {
        shopId,
        categoryId: dto.categoryId,
        name: dto.name,
        slug,
        sku,
        sellerSku: dto.sellerSku?.trim() || null,
        description: dto.description,
        price: dto.price,
        stock: dto.stock,
        status,
        images: dto.imageUrls
          ? {
              create: dto.imageUrls.map((url, index) => ({
                url,
                publicId: url,
                sortOrder: index,
              })),
            }
          : undefined,
      },
      include: { images: true },
    });
  }

  async findMine(userId: string) {
    const shopId = await this.getOwnedShopId(userId);
    return this.prisma.product.findMany({
      where: { shopId },
      include: { images: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateOwned(userId: string, productId: string, dto: UpdateProductDto) {
    const shopId = await this.getOwnedShopId(userId);
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.shopId !== shopId) {
      throw new ForbiddenException('You do not own this product');
    }

    const data: {
      name?: string;
      description?: string;
      price?: number;
      stock?: number;
      status?: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
      sellerSku?: string | null;
    } = {};

    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.price !== undefined) data.price = dto.price;
    if (dto.stock !== undefined) data.stock = dto.stock;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.sellerSku !== undefined) {
      data.sellerSku = dto.sellerSku?.trim() || null;
    }
    // sku ไม่ให้แก้จาก client

    return this.prisma.product.update({ where: { id: productId }, data });
  }

  async removeOwned(userId: string, productId: string) {
    const shopId = await this.getOwnedShopId(userId);
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.shopId !== shopId) {
      throw new ForbiddenException('You do not own this product');
    }
    await this.prisma.product.update({ where: { id: productId }, data: { status: 'ARCHIVED' } });
    return { success: true };
  }

  async setStatus(productId: string, status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED') {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return this.prisma.product.update({ where: { id: productId }, data: { status } });
  }
}