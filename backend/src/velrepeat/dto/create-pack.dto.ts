import { IsBoolean, IsIn, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePackDto {
  @IsString()
  productId!: string;

  /** e.g. WEEKLY_4, WEEKLY_8, MONTHLY_3 */
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

  /** ราคาต่อชิ้นในแพ็ก (หลังส่วนลด) */
  @IsNumber()
  @Min(0)
  unitPrice!: number;

  /** ยอดที่ลูกค้าจ่ายจริงทั้งแพ็ก */
  @IsNumber()
  @Min(0)
  packPrice!: number;

  @IsOptional()
  @IsBoolean()
  freeShipping?: boolean;

  /** อ้างอิง payment ก้อนเดียว (optional ตอนนี้) */
  @IsOptional()
  @IsString()
  prepaidPaymentId?: string;
}