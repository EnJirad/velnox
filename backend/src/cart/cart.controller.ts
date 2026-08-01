import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedRequestUser } from '../auth/types/authenticated-request-user';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  findMine(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.cartService.findMine(user.userId);
  }

  @Post('items')
  addItem(@CurrentUser() user: AuthenticatedRequestUser, @Body() dto: AddCartItemDto) {
    return this.cartService.addItem(user.userId, dto);
  }

  @Patch('items/:itemId')
  updateItem(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(user.userId, itemId, dto);
  }

  @Delete('items/:itemId')
  removeItem(@CurrentUser() user: AuthenticatedRequestUser, @Param('itemId') itemId: string) {
    return this.cartService.removeItem(user.userId, itemId);
  }

  @Delete()
  clear(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.cartService.clear(user.userId);
  }
}
