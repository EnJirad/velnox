import { IsBoolean, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class UpdatePlatformSettingsDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  platformName?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  commissionPercent?: number;

  @IsOptional()
  @IsBoolean()
  autoApproveMerchants?: boolean;

  @IsOptional()
  @IsBoolean()
  requireProductReview?: boolean;

  @IsOptional()
  @IsBoolean()
  autoApproveProducts?: boolean;

  @IsOptional()
  @IsBoolean()
  paymentCreditCard?: boolean;

  @IsOptional()
  @IsBoolean()
  paymentPromptPay?: boolean;

  @IsOptional()
  @IsBoolean()
  paymentBankTransfer?: boolean;

  @IsOptional()
  @IsBoolean()
  paymentCod?: boolean;
}
