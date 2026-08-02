import { IsIn } from 'class-validator';

export class UpdateUserStatusDto {
  @IsIn(['ACTIVE', 'INACTIVE', 'BANNED'])
  status!: 'ACTIVE' | 'INACTIVE' | 'BANNED';
}
