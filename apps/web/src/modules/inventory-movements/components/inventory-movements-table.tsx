import { ERP_COLORS as C } from "@/constants/theme";
import type { DataTableColumn } from "@/shared/data-table";
import { Badge } from "@/shared/ui/badge";

import {
  ADJUSTMENT_REASON_LABELS,
  MOVEMENT_DIRECTION,
  MOVEMENT_TYPE_LABELS,
  type MovementDirection,
} from "../constants";
import type { InventoryMovement } from "../types/inventory-movement.types";
import { formatDateTime } from "../utils/format-datetime";

const directionBadgeVariant: Record<
  MovementDirection,
  "success" | "default" | "muted"
> = {
  in: "success",
  out: "default",
  neutral: "muted",
};

const directionColor: Record<MovementDirection, string> = {
  in: C.greenText,
  out: C.danger,
  neutral: C.bodyText,
};

const directionPrefix: Record<MovementDirection, string> = {
  in: "+",
  out: "−",
  neutral: "",
};

export function getInventoryMovementsTableColumns(): DataTableColumn<InventoryMovement>[] {
  return [
    {
      id: "createdAt",
      header: "Fecha",
      align: "left",
      cell: (m) => (
        <span style={{ color: C.mutedText, whiteSpace: "nowrap" }}>
          {formatDateTime(m.createdAt)}
        </span>
      ),
    },
    {
      id: "product",
      header: "Producto",
      align: "left",
      cell: (m) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontWeight: 600 }}>{m.productName}</span>
          <span
            style={{
              fontSize: "12px",
              color: C.mutedText,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {m.productCode}
          </span>
        </div>
      ),
    },
    {
      id: "type",
      header: "Tipo",
      cell: (m) => (
        <Badge variant={directionBadgeVariant[MOVEMENT_DIRECTION[m.type]]}>
          {MOVEMENT_TYPE_LABELS[m.type]}
        </Badge>
      ),
    },
    {
      id: "quantity",
      header: "Cantidad",
      cell: (m) => {
        const dir = MOVEMENT_DIRECTION[m.type];
        return (
          <span
            style={{
              fontWeight: 600,
              fontVariantNumeric: "tabular-nums",
              color: directionColor[dir],
            }}
          >
            {directionPrefix[dir]}
            {m.quantity}
          </span>
        );
      },
    },
    {
      id: "reference",
      header: "Referencia",
      cell: (m) => (
        <span style={{ color: C.mutedText }}>{m.referenceNumber ?? "—"}</span>
      ),
    },
    {
      id: "reason",
      header: "Motivo",
      cell: (m) => (
        <span style={{ color: C.mutedText }}>
          {m.adjustmentReason
            ? ADJUSTMENT_REASON_LABELS[m.adjustmentReason]
            : "—"}
        </span>
      ),
    },
    {
      id: "performedBy",
      header: "Realizado por",
      align: "left",
      cell: (m) => <span>{m.performedBy ?? "Sistema"}</span>,
    },
  ];
}
