import { IsIn, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ShippingAddressDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @MinLength(8)
  phone!: string;

  @IsString()
  @MinLength(3)
  addressLine!: string;

  /** จังหวัด */
  @IsString()
  @MinLength(1)
  province!: string;

  @IsString()
  @MinLength(4)
  postalCode!: string;

  @IsOptional()
  @IsString()
  country?: string;
}

export class CheckoutDto {
  @IsOptional()
  @IsString()
  @IsIn(['promptpay', 'card', 'cod'])
  paymentMethod?: 'promptpay' | 'card' | 'cod';

  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress!: ShippingAddressDto;
}
