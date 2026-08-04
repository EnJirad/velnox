import { IsIn, IsOptional, IsString } from 'class-validator';

export class CheckoutDto {
  @IsOptional()
  @IsString()
  @IsIn(['promptpay', 'card', 'cod'])
  paymentMethod?: 'promptpay' | 'card' | 'cod';
}
