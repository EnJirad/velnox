import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { SetProductStatusDto } from './dto/set-product-status.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedRequestUser } from '../auth/types/authenticated-request-user';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get()
  findAll(@Query() query: QueryProductsDto) {
    return this.productsService.findAll(query);
  }

  @Roles('MERCHANT')
  @Get('me')
  findMine(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.productsService.findMine(user.userId);
  }

  @Public()
  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Roles('MERCHANT')
  @Post()
  create(@CurrentUser() user: AuthenticatedRequestUser, @Body() dto: CreateProductDto) {
    return this.productsService.createForUser(user.userId, dto);
  }

  @Roles('MERCHANT')
  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.updateOwned(user.userId, id, dto);
  }

  @Roles('MERCHANT')
  @Delete(':id')
  remove(@CurrentUser() user: AuthenticatedRequestUser, @Param('id') id: string) {
    return this.productsService.removeOwned(user.userId, id);
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Patch(':id/status')
  setStatus(@Param('id') id: string, @Body() dto: SetProductStatusDto) {
    return this.productsService.setStatus(id, dto.status);
  }
}
