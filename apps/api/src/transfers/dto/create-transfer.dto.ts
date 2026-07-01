import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateTransferItemDto {
  @IsString({ message: 'El ID del producto debe ser texto' })
  @IsNotEmpty({ message: 'El producto es requerido' })
  productId!: string;

  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 3 },
    { message: 'La cantidad debe ser un número' },
  )
  @Min(0.001, { message: 'La cantidad debe ser mayor a cero' })
  quantity!: number;
}

export class CreateTransferDto {
  @IsString({ message: 'La sucursal de origen debe ser texto' })
  @IsNotEmpty({ message: 'La sucursal de origen es requerida' })
  fromBranchId!: string;

  @IsString({ message: 'La sucursal de destino debe ser texto' })
  @IsNotEmpty({ message: 'La sucursal de destino es requerida' })
  toBranchId!: string;

  @IsOptional()
  @IsString({ message: 'Las notas deben ser texto' })
  notes?: string;

  @IsArray({ message: 'Debe proporcionar una lista de items' })
  @ArrayMinSize(1, {
    message: 'Debe agregar al menos un producto a la transferencia',
  })
  @ValidateNested({ each: true })
  @Type(() => CreateTransferItemDto)
  items!: CreateTransferItemDto[];
}
