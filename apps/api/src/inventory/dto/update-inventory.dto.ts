import { Type } from "class-transformer";
import { IsNumber, IsOptional, Min } from "class-validator";

/**
 * La cantidad (`quantity`) NO se edita directamente: cambia mediante
 * InventoryMovement (compras, ventas, transferencias, mermas). Aquí solo se
 * actualiza la cantidad mínima de reposición.
 */
export class UpdateInventoryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 3 },
    { message: "La cantidad mínima debe ser un número" },
  )
  @Min(0, { message: "La cantidad mínima no puede ser negativa" })
  minimumQuantity?: number;
}
