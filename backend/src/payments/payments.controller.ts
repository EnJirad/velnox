import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedRequestUser } from '../auth/types/authenticated-request-user';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('orders/:orderId/promptpay-qr')
  getPromptPayQr(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('orderId') orderId: string,
  ) {
    return this.paymentsService.getPromptPayQrForOrder(orderId, user.userId);
  }

  @Post('orders/:orderId/slip')
  submitSlip(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('orderId') orderId: string,
    @Body() body: { slipUrl?: string },
  ) {
    return this.paymentsService.submitSlip(
      orderId,
      user.userId,
      body?.slipUrl ?? '',
    );
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get('admin/pending-slips')
  listPendingSlips() {
    return this.paymentsService.listPendingSlips();
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Patch('admin/orders/:orderId/approve')
  approve(@Param('orderId') orderId: string) {
    return this.paymentsService.approvePayment(orderId);
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Patch('admin/orders/:orderId/reject-slip')
  rejectSlip(
    @Param('orderId') orderId: string,
    @Body() body: { reason?: string },
  ) {
    return this.paymentsService.rejectSlip(orderId, body?.reason);
  }
}
