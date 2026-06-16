import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreatePurchaseItemDto {
  @IsNotEmpty({ message: 'El id del producto no puede estar vacio' })
  @IsString({ message: 'El id del producto debe ser texto' })
  productId!: string;

  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 3 },
    { message: 'La cantidad debe ser un número' },
  )
  @Min(0.001, { message: 'La cantidad debe ser mayor a cero' })
  quantity!: number;

  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El costo unitario debe ser un número' },
  )
  @Min(0, { message: 'El costo unitario no puede ser negativo' })
  unitCost!: number;
}

export class CreatePurchaseDto {
  @IsNotEmpty({ message: 'El id de la sucursal no puede estar vacio' })
  @IsString({ message: 'El id de la sucursal debe ser texto' })
  branchId!: string;

  @IsNotEmpty({ message: 'El id del proveedor no puede estar vacio' })
  @IsString({ message: 'El id del proveedor debe ser texto' })
  supplierId!: string;

  @IsOptional()
  @IsString({ message: 'El número de factura debe ser texto' })
  invoiceNumber?: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de factura debe ser una fecha válida' },
  )
  invoiceDate?: string;

  @IsArray({ message: 'Los productos deben ser una lista' })
  @ArrayMinSize(1, { message: 'La orden debe tener al menos un producto' })
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseItemDto)
  items!: CreatePurchaseItemDto[];
}
