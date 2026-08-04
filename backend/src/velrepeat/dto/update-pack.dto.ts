import { IsIn, IsOptional } from 'class-validator';

export class UpdatePackDto {
  @IsOptional()
  @IsIn(['WEEKLY', 'BI_WEEKLY', 'MONTHLY'])
  frequency?: 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY';
}