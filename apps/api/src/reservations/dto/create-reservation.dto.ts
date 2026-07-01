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

export class CreateReservationItemDto {
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

export class CreateReservationDto {
  @IsOptional()
  @IsString({ message: 'El id de la sucursal debe ser texto' })
  branchId?: string;

  @IsOptional()
  @IsString({ message: 'El id del cliente debe ser texto' })
  customerId?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de expiración debe ser válida' })
  expiresAt?: string;

  @IsOptional()
  @IsString({ message: 'Las notas deben ser texto' })
  notes?: string;

  @IsArray({ message: 'Los productos deben ser una lista' })
  @ArrayMinSize(1, { message: 'La reserva debe tener al menos un producto' })
  @ValidateNested({ each: true })
  @Type(() => CreateReservationItemDto)
  items!: CreateReservationItemDto[];
}
