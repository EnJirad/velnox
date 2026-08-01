import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateSubscriptionDto {
  @IsString()
  productId!: string;

  @IsIn(['WEEKLY', 'BI_WEEKLY', 'MONTHLY', 'CUSTOM'])
  frequency!: 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY' | 'CUSTOM';

  @IsInt()
  @Min(1)
  quantity!: number;

  // Required when frequency is CUSTOM: number of days between orders.
  @IsOptional()
  @IsInt()
  @Min(1)
  customIntervalDays?: number;
}
