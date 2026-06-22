import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { InventoryAdjustmentReason } from '@repo/db';

export class CreateWasteDto {
  @IsString()
  productId!: string;

  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(1, { message: 'La cantidad debe ser al menos 1' })
  quantity!: number;

  @IsEnum(InventoryAdjustmentReason)
  adjustmentReason!: InventoryAdjustmentReason;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  referenceNumber?: string;
}
