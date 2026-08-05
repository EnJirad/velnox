import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CheckoutDto } from './dto/checkout.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedRequestUser } from '../auth/types/authenticated-request-user';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  checkout(@CurrentUser() user: AuthenticatedRequestUser, @Body() dto: CheckoutDto) {
    return this.ordersService.createFromCart(
      user.userId,
      dto.paymentMethod,
      dto.shippingAddress,
    );
  }

  @Get('me')
  findMine(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.ordersService.findMine(user.userId);
  }

  @Roles('MERCHANT')
  @Get('merchant')
  findForMerchant(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.ordersService.findForMerchant(user.userId);
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get('admin/:id')
  findAdminOne(@Param('id') id: string) {
    return this.ordersService.findAdminById(id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthenticatedRequestUser, @Param('id') id: string) {
    return this.ordersService.findOneForUser(user.userId, id);
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto);
  }
}
