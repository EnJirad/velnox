import { IsEnum } from 'class-validator';

export class AdminUpdateShopStatusDto {
  @IsEnum(['ACTIVE', 'INACTIVE', 'SUSPENDED'] as const)
  status!: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}