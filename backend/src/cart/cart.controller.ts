import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CartService } from './cart.service';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@Request() req: any) {
    return this.cartService.getCart(req.user.id);
  }

  @Post('items')
  async addItem(@Request() req: any, @Body() data: { productId: string; quantity: number }) {
    return this.cartService.addItem(req.user.id, data.productId, data.quantity);
  }

  @Patch('items/:itemId')
  async updateItem(
    @Request() req: any,
    @Param('itemId') itemId: string,
    @Body() data: { quantity: number }
  ) {
    return this.cartService.updateItem(itemId, data.quantity);
  }

  @Delete('items/:itemId')
  async removeItem(@Param('itemId') itemId: string) {
    return this.cartService.removeItem(itemId);
  }

  @Delete()
  async clearCart(@Request() req: any) {
    return this.cartService.clearCart(req.user.id);
  }
}
