import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedRequestUser } from '../auth/types/authenticated-request-user';

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

  /** POST /api/payments/orders/:orderId/slip  body: { slipUrl } */
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
}
