import type { SaleStatus } from "@/modules/sales/types/sale.types";

type BadgeVariant = "default" | "primary" | "success" | "muted";

const STATUS_META: Record<
  SaleStatus,
  { label: string; variant: BadgeVariant }
> = {
  COMPLETED: { label: "Completada", variant: "success" },
  PENDING: { label: "Pendiente", variant: "primary" },
  CANCELLED: { label: "Cancelada", variant: "muted" },
};

export function saleStatusMeta(status: SaleStatus) {
  return STATUS_META[status] ?? { label: status, variant: "default" as const };
}

/** Opciones para el filtro de estado (incluye "Todos" como cadena vacía). */
export const SALE_STATUS_OPTIONS: { value: SaleStatus; label: string }[] = [
  { value: "COMPLETED", label: "Completada" },
  { value: "PENDING", label: "Pendiente" },
  { value: "CANCELLED", label: "Cancelada" },
];
