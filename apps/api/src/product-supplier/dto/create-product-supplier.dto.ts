import { IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateProductSupplierDto {
  @IsString({ message: 'productId debe ser texto' })
  @MinLength(1, { message: 'productId es requerido' })
  productId!: string;

  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'lastCost debe ser un número con hasta 2 decimales' },
  )
  @Min(0, { message: 'lastCost no puede ser negativo' })
  lastCost?: number;
}
