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

  @IsOptional()
  @IsString()
  @MaxLength(20)
  promptPayId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  bankAccountName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  bankAccountNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  bankName?: string;
}
