import { IsIn, IsInt, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsIn(['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED'])
  status?: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
}
