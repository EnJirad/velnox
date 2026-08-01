import { IsIn, IsInt, IsOptional, Min } from 'class-validator';

export class UpdateSubscriptionDto {
  @IsOptional()
  @IsIn(['WEEKLY', 'BI_WEEKLY', 'MONTHLY', 'CUSTOM'])
  frequency?: 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY' | 'CUSTOM';

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  customIntervalDays?: number;
}
