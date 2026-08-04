import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProductVelRepeatPlanDto {
  @IsString()
  planCode!: string;

  @IsIn(['WEEKLY', 'BI_WEEKLY', 'MONTHLY'])
  frequency!: 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY';

  @IsInt()
  @Min(1)
  totalUnits!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  unitsPerDelivery?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  discountPercent?: number;

  @IsOptional()
  @IsBoolean()
  freeShipping?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class CreateProductDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  categoryId!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsInt()
  @Min(0)
  stock!: number;

  /** Optional seller-defined SKU */
  @IsOptional()
  @IsString()
  sellerSku?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];

  /** เปิดขายแบบ VelRepeat pack ควบคู่การขายปกติ */
  @IsOptional()
  @IsBoolean()
  velRepeatEnabled?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVelRepeatPlanDto)
  velRepeatPlans?: ProductVelRepeatPlanDto[];
}