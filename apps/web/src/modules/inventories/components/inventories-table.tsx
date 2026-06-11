import { Pencil } from "lucide-react";

import { ERP_COLORS as C } from "@/constants/theme";
import type { DataTableColumn } from "@/shared/data-table";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

import { LOW_STOCK_THRESHOLD } from "../constants";
import type { Inventory } from "../types/inventory.types";
import { formatCurrency } from "../utils/format-currency";

interface InventoryTableActions {
  onEdit: (inventory: Inventory) => void;
}

export function getInventoriesTableColumns(
  actions: InventoryTableActions,
): DataTableColumn<Inventory>[] {
  return [
    {
      id: "code",
      header: "Código",
      cell: (inv) => (
        <span
          style={{ color: C.mutedText, fontVariantNumeric: "tabular-nums" }}
        >
          {inv.code}
        </span>
      ),
    },
    {
      id: "name",
      header: "Nombre",
      align: "left",
      cell: (inv) => <span style={{ fontWeight: 600 }}>{inv.name}</span>,
    },
    {
      id: "quantity",
      header: "Cantidad",
      cell: (inv) => {
        const low = inv.quantity <= LOW_STOCK_THRESHOLD;
        return (
          <span
            style={{
              fontWeight: 600,
              fontVariantNumeric: "tabular-nums",
              color: low ? C.danger : C.bodyText,
            }}
          >
            {inv.quantity}
          </span>
        );
      },
    },
    {
      id: "price",
      header: "Precio",
      cell: (inv) => (
        <span style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
          {formatCurrency(inv.price)}
        </span>
      ),
    },
    {
      id: "status",
      header: "Estado",
      cell: (inv) =>
        inv.isActive ? (
          <Badge variant="success">Activo</Badge>
        ) : (
          <Badge variant="muted">Inactivo</Badge>
        ),
    },
    {
      id: "actions",
      header: "Acciones",
      cell: (inv) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
          }}
        >
          <Button
            variant="icon"
            onClick={() => actions.onEdit(inv)}
            title="Editar"
            style={{ width: "34px", height: "34px", borderRadius: "7px" }}
            className="hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            <Pencil style={{ width: "14px", height: "14px" }} />
          </Button>
        </div>
      ),
    },
  ];
}
