import { IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class AdminUpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(['CUSTOMER', 'MERCHANT', 'ADMIN', 'SUPER_ADMIN'] as const)
  role?: 'CUSTOMER' | 'MERCHANT' | 'ADMIN' | 'SUPER_ADMIN';

  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE', 'BANNED'] as const)
  status?: 'ACTIVE' | 'INACTIVE' | 'BANNED';
}
