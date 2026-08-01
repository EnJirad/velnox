import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { MerchantsService } from './merchants.service';
import { UpdateMerchantStatusDto } from './dto/update-merchant-status.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthenticatedRequestUser } from '../auth/types/authenticated-request-user';

@Controller('merchants')
export class MerchantsController {
  constructor(private readonly merchantsService: MerchantsService) {}

  @Post('apply')
  apply(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.merchantsService.apply(user.userId);
  }

  @Get('me')
  findMine(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.merchantsService.findMine(user.userId);
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get()
  findAll() {
    return this.merchantsService.findAll();
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateMerchantStatusDto) {
    return this.merchantsService.updateStatus(id, dto);
  }
}
