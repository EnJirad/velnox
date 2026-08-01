import { IsIn } from 'class-validator';

export class SetProductStatusDto {
  @IsIn(['ACTIVE', 'INACTIVE', 'ARCHIVED'])
  status!: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
}
