import { IsIn } from 'class-validator';

export class UpdateMerchantStatusDto {
  @IsIn(['APPROVED', 'REJECTED', 'SUSPENDED', 'PENDING'])
  status!: 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'PENDING';
}
