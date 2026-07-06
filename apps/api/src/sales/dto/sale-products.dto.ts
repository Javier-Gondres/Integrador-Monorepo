import { IsOptional, IsString } from 'class-validator';

/** Parámetros del catálogo de productos disponibles para facturar. */
export class SaleProductsDto {
  @IsOptional()
  @IsString({ message: 'branchId debe ser texto' })
  branchId?: string;

  @IsOptional()
  @IsString({ message: 'search debe ser texto' })
  search?: string;

  @IsOptional()
  @IsString({ message: 'categoryId debe ser texto' })
  categoryId?: string;
}

/** Parámetros para consultar la caja/turno abierto del cajero. */
export class CurrentShiftDto {
  @IsOptional()
  @IsString({ message: 'branchId debe ser texto' })
  branchId?: string;
}

/** Parámetros para consultar las notas de crédito de un cliente. */
export class CustomerCreditNotesDto {
  @IsString({ message: 'customerId debe ser texto' })
  customerId!: string;
}
