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
  };
}

/** Construye la opción de producto a partir de una fila de inventario (modo edición). */
export function mapInventoryToProductOption(
  inventory: Inventory | null,
): InventoryProductOption | null {
  if (!inventory) return null;
  return {
    id: inventory.productId,
    code: inventory.code,
    name: inventory.name,
    price: inventory.price,
    isActive: inventory.isActive,
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
  };
}

export function mapFormValuesToUpdateDto(
  values: InventoryFormSchema,
): UpdateInventoryValues {
  return {
    quantity: values.quantity,
  };
}
