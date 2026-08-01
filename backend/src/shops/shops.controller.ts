import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ShopsService } from './shops.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedRequestUser } from '../auth/types/authenticated-request-user';

@Controller('shops')
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @Public()
  @Get()
  findAll() {
    return this.shopsService.findAll();
  }

  @Get('me')
  @Roles('MERCHANT')
  findMine(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.shopsService.findMine(user.userId);
  }

  @Public()
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.shopsService.findById(id);
  }

  @Roles('MERCHANT')
  @Post()
  create(@CurrentUser() user: AuthenticatedRequestUser, @Body() dto: CreateShopDto) {
    return this.shopsService.createForUser(user.userId, dto);
  }

  @Roles('MERCHANT')
  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id') id: string,
    @Body() dto: UpdateShopDto,
  ) {
    return this.shopsService.updateOwned(user.userId, id, dto);
  }
}
