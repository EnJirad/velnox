import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  private async getOrCreateCart(userId: string) {
    const cart = await this.prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
      include: { items: { include: { product: { include: { images: true } } } } },
    });
    return cart;
  }

  findMine(userId: string) {
    return this.getOrCreateCart(userId);
  }

  async addItem(userId: string, dto: AddCartItemDto) {
    const cart = await this.getOrCreateCart(userId);
    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product || product.status !== 'ACTIVE') {
      throw new NotFoundException('Product not found');
    }
    if (product.stock < dto.quantity) {
      throw new BadRequestException('Not enough stock available');
    }

    const existing = await this.prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId: dto.productId },
    });

    if (existing) {
      await this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: Math.min(existing.quantity + dto.quantity, product.stock) },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: dto.productId,
          quantity: dto.quantity,
          price: product.price,
        },
      });
    }

    return this.getOrCreateCart(userId);
  }

  async updateItem(userId: string, itemId: string, dto: UpdateCartItemDto) {
    const cart = await this.getOrCreateCart(userId);
    const item = await this.prisma.cartItem.findUnique({ where: { id: itemId } });
    if (!item || item.cartId !== cart.id) {
      throw new NotFoundException('Cart item not found');
    }
    await this.prisma.cartItem.update({ where: { id: itemId }, data: { quantity: dto.quantity } });
    return this.getOrCreateCart(userId);
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.getOrCreateCart(userId);
    const item = await this.prisma.cartItem.findUnique({ where: { id: itemId } });
    if (!item || item.cartId !== cart.id) {
      throw new NotFoundException('Cart item not found');
    }
    await this.prisma.cartItem.delete({ where: { id: itemId } });
    return this.getOrCreateCart(userId);
  }

  async clear(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return this.getOrCreateCart(userId);
  }
}
