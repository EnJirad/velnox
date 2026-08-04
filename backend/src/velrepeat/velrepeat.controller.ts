import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { VelRepeatService } from './velrepeat.service';
import { CreatePackDto } from './dto/create-pack.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedRequestUser } from '../auth/types/authenticated-request-user';

@Controller('velrepeat')
export class VelRepeatController {
  constructor(private readonly velRepeatService: VelRepeatService) {}

  /** ซื้อแพ็ก (จ่ายก้อนเดียว) */
  @Post('packs')
  purchasePack(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body() dto: CreatePackDto,
  ) {
    return this.velRepeatService.purchasePack(user.userId, dto);
  }

  /** แพ็กของฉัน (ลูกค้า) */
  @Get('packs')
  findMine(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.velRepeatService.findMine(user.userId);
  }

  /** Admin: สรุปแพ็กทั้งแพลตฟอร์ม */
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get('summary')
  platformSummary() {
    return this.velRepeatService.platformSummary();
  }

  /** Admin: รายการแพ็กทั้งหมด */
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get('admin/packs')
  listAllPacks(@Query('status') status?: string) {
    return this.velRepeatService.listAllPacks(status);
  }

  /** Merchant: สรุปแพ็กของร้าน */
  @Roles('MERCHANT')
  @Get('merchant/summary')
  merchantSummary(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.velRepeatService.merchantSummary(user.userId);
  }

  /** Merchant: รายการแพ็กของร้าน */
  @Roles('MERCHANT')
  @Get('merchant/packs')
  listMerchantPacks(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Query('status') status?: string,
  ) {
    return this.velRepeatService.listMerchantPacks(user.userId, status);
  }

  @Get('packs/:id/history')
  history(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id') id: string,
  ) {
    return this.velRepeatService.history(user.userId, id);
  }

  @Patch('packs/:id/pause')
  pause(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id') id: string,
  ) {
    return this.velRepeatService.pause(user.userId, id);
  }

  @Patch('packs/:id/resume')
  resume(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id') id: string,
  ) {
    return this.velRepeatService.resume(user.userId, id);
  }

  @Patch('packs/:id/cancel')
  cancel(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id') id: string,
  ) {
    return this.velRepeatService.cancel(user.userId, id);
  }
}
