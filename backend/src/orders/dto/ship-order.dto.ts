import { IsOptional, IsString, MinLength } from 'class-validator';

export class ShipOrderDto {
  @IsString()
  @MinLength(3)
  trackingNumber!: string;

  @IsOptional()
  @IsString()
  carrier?: string;
}
