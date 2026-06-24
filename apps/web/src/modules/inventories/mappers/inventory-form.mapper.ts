import { DEFAULT_MINIMUM_QUANTITY } from "../constants";
import type { InventoryFormSchema } from "../schemas/inventory.schema";
import type {
  CreateInventoryValues,
  Inventory,
  InventoryProductOption,
  UpdateInventoryValues,
} from "../types/inventory.types";

export function mapInventoryToFormValues(
  inventory: Inventory | null,
): InventoryFormSchema {
  return {
    productId: inventory?.productId ?? "",
    quantity: inventory?.quantity ?? 0,
    minimumQuantity: inventory?.minimumQuantity ?? DEFAULT_MINIMUM_QUANTITY,
  };
}

/**
 * Opción de producto a partir de una fila de inventario (modo edición).
 * Usa el estado del producto (`productIsActive`), no el de la fila.
 */
export function mapInventoryToProductOption(
  inventory: Inventory | null,
): InventoryProductOption | null {
  if (!inventory) return null;
  return {
    id: inventory.productId,
    code: inventory.code,
    name: inventory.name,
    price: inventory.price,
    isActive: inventory.productIsActive,
  };
}

export function mapFormValuesToCreateDto(
  values: InventoryFormSchema,
  branchId: string,
): CreateInventoryValues {
  return {
    branchId,
    productId: values.productId,
    quantity: values.quantity,
    minimumQuantity: values.minimumQuantity,
  };
}

export function mapFormValuesToUpdateDto(
  values: InventoryFormSchema,
): UpdateInventoryValues {
  return {
    minimumQuantity: values.minimumQuantity,
  };
}
