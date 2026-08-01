import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateShopDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  bannerUrl?: string;
}
