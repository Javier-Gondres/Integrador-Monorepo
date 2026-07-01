import { ReturnReason } from '@repo/db';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateReturnItemDto {
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
}

export class CreateReturnDto {
  @IsNotEmpty({ message: 'El id de la venta no puede estar vacio' })
  @IsString({ message: 'El id de la venta debe ser texto' })
  saleId!: string;

  @IsEnum(ReturnReason, { message: 'El motivo de la devolución no es válido' })
  reason!: ReturnReason;

  @IsOptional()
  @IsString({ message: 'Las notas deben ser texto' })
  notes?: string;

  @IsArray({ message: 'Los productos deben ser una lista' })
  @ArrayMinSize(1, { message: 'La devolución debe tener al menos un producto' })
  @ValidateNested({ each: true })
  @Type(() => CreateReturnItemDto)
  items!: CreateReturnItemDto[];
}
