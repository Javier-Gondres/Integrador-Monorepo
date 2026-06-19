import { InventoryAdjustmentReason } from '@repo/db';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  NotEquals,
} from 'class-validator';

const ALLOWED_REASONS = [
  InventoryAdjustmentReason.COUNT_DIFFERENCE,
  InventoryAdjustmentReason.OTHER,
] as const;

export class CreateInventoryAdjustmentDto {
  @IsString({ message: 'branchId debe ser texto' })
  @IsNotEmpty({ message: 'branchId es obligatorio' })
  branchId!: string;

  @IsString({ message: 'productId debe ser texto' })
  @IsNotEmpty({ message: 'productId es obligatorio' })
  productId!: string;

  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 3 },
    { message: 'quantity debe ser un número' },
  )
  @NotEquals(0, { message: 'quantity no puede ser 0' })
  quantity!: number;

  @IsIn(ALLOWED_REASONS, {
    message: 'adjustmentReason debe ser COUNT_DIFFERENCE u OTHER',
  })
  adjustmentReason!: InventoryAdjustmentReason;

  @IsOptional()
  @IsString({ message: 'notes debe ser texto' })
  notes?: string;
}
