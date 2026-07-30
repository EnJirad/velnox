import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Product, ProductStatus } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: { categoryId?: string; shopId?: string; status?: ProductStatus }) {
    return this.prisma.product.findMany({
      where: {
        ...(query?.categoryId && { categoryId: query.categoryId }),
        ...(query?.shopId && { shopId: query.shopId }),
        status: query?.status || ProductStatus.ACTIVE,
      },
      include: {
        images: true,
        shop: true,
        category: true,
      },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        shop: true,
        category: true,
        inventory: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        images: true,
        shop: true,
        category: true,
        inventory: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }

    return product;
  }
}
