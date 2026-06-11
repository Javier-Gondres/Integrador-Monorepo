import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class QueryInventoryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "page debe ser un entero" })
  @Min(1, { message: "page debe ser al menos 1" })
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "take debe ser un entero" })
  @Min(1, { message: "take debe ser al menos 1" })
  @Max(50, { message: "take no puede ser mayor a 50" })
  take?: number;

  @IsOptional()
  @IsString({ message: "search debe ser texto" })
  search?: string;

  @IsOptional()
  @IsString({ message: "branchId debe ser texto" })
  branchId?: string;
}

export type NormalizedQueryInventory = {
  page: number;
  take: number;
  search?: string;
};
