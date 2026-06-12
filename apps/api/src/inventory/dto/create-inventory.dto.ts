import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateInventoryDto {
  @IsNotEmpty({ message: "El id de la sucursal no puede estar vacio" })
  @IsString({ message: "El id de la sucursal debe ser texto" })
  branchId!: string;

  @IsNotEmpty({ message: "El id del producto no puede estar vacio" })
  @IsString({ message: "El id del producto debe ser texto" })
  productId!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 3 },
    { message: "La cantidad debe ser un número" },
  )
  @Min(0, { message: "La cantidad no puede ser negativa" })
  quantity?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 3 },
    { message: "La cantidad mínima debe ser un número" },
  )
  @Min(0, { message: "La cantidad mínima no puede ser negativa" })
  minimumQuantity?: number;
}
