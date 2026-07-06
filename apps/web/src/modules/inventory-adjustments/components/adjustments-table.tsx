import { ERP_COLORS as C } from "@/constants/theme";
import type { DataTableColumn } from "@/shared/data-table";
import { Badge } from "@/shared/ui/badge";

import { ADJUSTMENT_REASON_LABELS } from "../constants";
import type { Adjustment } from "../types/inventory-adjustment.types";

export function getAdjustmentsTableColumns(): DataTableColumn<Adjustment>[] {
  return [
    {
      id: "product",
      header: "Producto",
      align: "left",
      cell: (a) => <span style={{ fontWeight: 600 }}>{a.productName}</span>,
    },
    {
      id: "adjustmentReason",
      header: "Razón de ajuste",
      cell: (a) => (
        <Badge variant="default">
          {ADJUSTMENT_REASON_LABELS[a.adjustmentReason]}
        </Badge>
      ),
    },
    {
      id: "quantity",
      header: "Cantidad afectada",
      cell: (a) => (
        <span
          style={{
            fontWeight: 600,
            fontVariantNumeric: "tabular-nums",
            color: a.quantity >= 0 ? C.greenText : C.danger,
          }}
        >
          {a.quantity > 0 ? "+" : ""}
          {a.quantity}
        </span>
      ),
    },
    {
      id: "notes",
      header: "Notas",
      align: "left",
      cell: (a) => (
        <div
          style={{
            minWidth: "260px",
            maxWidth: "420px",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            color: a.notes ? C.bodyText : C.mutedText,
          }}
        >
          {a.notes ?? "—"}
        </div>
      ),
    },
  ];
}
