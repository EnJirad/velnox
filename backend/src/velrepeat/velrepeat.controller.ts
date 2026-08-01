import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { VelRepeatService } from './velrepeat.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedRequestUser } from '../auth/types/authenticated-request-user';

@Controller('velrepeat')
export class VelRepeatController {
  constructor(private readonly velRepeatService: VelRepeatService) {}

  @Post('subscriptions')
  subscribe(@CurrentUser() user: AuthenticatedRequestUser, @Body() dto: CreateSubscriptionDto) {
    return this.velRepeatService.subscribe(user.userId, dto);
  }

  @Get('subscriptions')
  findMine(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.velRepeatService.findMine(user.userId);
  }

  @Roles('MERCHANT', 'ADMIN', 'SUPER_ADMIN')
  @Get('summary')
  platformSummary() {
    return this.velRepeatService.platformSummary();
  }

  @Get('subscriptions/:id/history')
  history(@CurrentUser() user: AuthenticatedRequestUser, @Param('id') id: string) {
    return this.velRepeatService.history(user.userId, id);
  }

  @Patch('subscriptions/:id')
  update(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id') id: string,
    @Body() dto: UpdateSubscriptionDto,
  ) {
    return this.velRepeatService.update(user.userId, id, dto);
  }

  @Patch('subscriptions/:id/pause')
  pause(@CurrentUser() user: AuthenticatedRequestUser, @Param('id') id: string) {
    return this.velRepeatService.pause(user.userId, id);
  }

  @Patch('subscriptions/:id/resume')
  resume(@CurrentUser() user: AuthenticatedRequestUser, @Param('id') id: string) {
    return this.velRepeatService.resume(user.userId, id);
  }

  @Patch('subscriptions/:id/cancel')
  cancel(@CurrentUser() user: AuthenticatedRequestUser, @Param('id') id: string) {
    return this.velRepeatService.cancel(user.userId, id);
  }
}
