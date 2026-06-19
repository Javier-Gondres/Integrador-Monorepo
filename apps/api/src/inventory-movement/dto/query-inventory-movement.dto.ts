import { InventoryAdjustmentReason, InventoryMovementType } from '@repo/db';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class QueryInventoryMovementDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page debe ser un entero' })
  @Min(1, { message: 'page debe ser al menos 1' })
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'take debe ser un entero' })
  @Min(1, { message: 'take debe ser al menos 1' })
  @Max(50, { message: 'take no puede ser mayor a 50' })
  take?: number;

  @IsOptional()
  @IsString({ message: 'search debe ser texto' })
  search?: string;

  @IsOptional()
  @IsString({ message: 'branchId debe ser texto' })
  branchId?: string;

  @IsOptional()
  @IsEnum(InventoryMovementType, {
    message: 'type no es un tipo de movimiento válido',
  })
  type?: InventoryMovementType;

  @IsOptional()
  @IsEnum(InventoryAdjustmentReason, {
    message: 'adjustmentReason no es una razón de ajuste válida',
  })
  adjustmentReason?: InventoryAdjustmentReason;

  @IsOptional()
  @IsDateString({}, { message: 'dateFrom debe ser una fecha válida' })
  dateFrom?: string;

  @IsOptional()
  @IsDateString({}, { message: 'dateTo debe ser una fecha válida' })
  dateTo?: string;
}

export type NormalizedQueryInventoryMovement = {
  page: number;
  take: number;
  search?: string;
  type?: InventoryMovementType;
  adjustmentReason?: InventoryAdjustmentReason;
  dateFrom?: string;
  dateTo?: string;
};
