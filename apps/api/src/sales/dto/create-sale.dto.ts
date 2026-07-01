import { NcfType, PaymentMethod } from '@repo/db';
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

export class CreateSaleItemDto {
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

export class CreateSalePaymentDto {
  @IsEnum(PaymentMethod, { message: 'El método de pago no es válido' })
  method!: PaymentMethod;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El monto debe ser un número' })
  @Min(0.01, { message: 'El monto del pago debe ser mayor a cero' })
  amount!: number;
}

export class CreateSaleDto {
  @IsOptional()
  @IsString({ message: 'El id de la sucursal debe ser texto' })
  branchId?: string;

  @IsOptional()
  @IsString({ message: 'El id del cliente debe ser texto' })
  customerId?: string;

  @IsOptional()
  @IsString({ message: 'El id de la reserva debe ser texto' })
  reservationId?: string;

  @IsOptional()
  @IsEnum(NcfType, { message: 'El tipo de comprobante no es válido' })
  ncfType?: NcfType;

  @IsArray({ message: 'Los productos deben ser una lista' })
  @ArrayMinSize(1, { message: 'La venta debe tener al menos un producto' })
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items!: CreateSaleItemDto[];

  @IsOptional()
  @IsArray({ message: 'Los pagos deben ser una lista' })
  @ValidateNested({ each: true })
  @Type(() => CreateSalePaymentDto)
  payments?: CreateSalePaymentDto[];

  @IsOptional()
  @IsArray({ message: 'Las notas de crédito deben ser una lista' })
  @IsString({ each: true, message: 'Cada nota de crédito debe ser texto' })
  creditNoteIds?: string[];
}
