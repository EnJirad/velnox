import { Controller, Get, Param } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedRequestUser } from '../auth/types/authenticated-request-user';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /** GET /api/payments/orders/:orderId/promptpay-qr */
  @Get('orders/:orderId/promptpay-qr')
  getPromptPayQr(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('orderId') orderId: string,
  ) {
    return this.paymentsService.getPromptPayQrForOrder(orderId, user.userId);
  }
}
