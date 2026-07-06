import { InventoryAdjustmentReason } from '@repo/db';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateWasteDto {
  @IsNotEmpty({ message: 'El id de la sucursal no puede estar vacio' })
  @IsString({ message: 'El id de la sucursal debe ser texto' })
  branchId!: string;

  @IsString()
  productId!: string;

  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 3 },
    { message: 'La cantidad debe ser un número' },
  )
  @Min(0.001, { message: 'La cantidad debe ser mayor a cero' })
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
