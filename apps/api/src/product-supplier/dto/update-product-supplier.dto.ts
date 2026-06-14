import { IsBoolean, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateProductSupplierDto {
  @IsOptional()
  @IsBoolean({ message: 'isPreferred debe ser un booleano' })
  isPreferred?: boolean;

  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'lastCost debe ser un número con hasta 2 decimales' },
  )
  @Min(0, { message: 'lastCost no puede ser negativo' })
  lastCost?: number;
}
