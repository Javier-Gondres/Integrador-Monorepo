import { Eye } from "lucide-react";

import { ERP_COLORS as C } from "@/constants/theme";
import type { DataTableColumn } from "@/shared/data-table";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

import type { ReturnListItem } from "../types/return.types";
import { formatDate } from "../utils/format";

interface ReturnsTableActions {
  onViewDetails: (returnItem: ReturnListItem) => void;
}

function emptyCell(text: string) {
  return <em style={{ color: C.mutedText, fontSize: "13px" }}>{text}</em>;
}

export function getReturnsTableColumns(
  actions: ReturnsTableActions,
): DataTableColumn<ReturnListItem>[] {
  return [
    {
      id: "branch",
      header: "Sucursal",
      align: "left",
      cell: (row) => <span style={{ fontWeight: 600 }}>{row.branchName}</span>,
    },
    {
      id: "ncf",
      header: "NCF",
      align: "left",
      cell: (row) =>
        row.ncf ? (
          <span style={{ fontFamily: "monospace", color: C.bodyText }}>
            {row.ncf}
          </span>
        ) : (
          emptyCell("Sin NCF")
        ),
    },
    {
      id: "customer",
      header: "Cliente",
      align: "left",
      cell: (row) => row.customerName ?? emptyCell("Consumidor final"),
    },
    {
      id: "reason",
      header: "Motivo",
      align: "center",
      cell: (row) => <Badge variant="muted">{row.reasonLabel}</Badge>,
    },
    {
      id: "createdAt",
      header: "Fecha",
      align: "center",
      cell: (row) => (
        <span style={{ color: C.headText }}>{formatDate(row.createdAt)}</span>
      ),
    },
    {
      id: "actions",
      header: "Acciones",
      cell: (row) => (
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
            onClick={() => actions.onViewDetails(row)}
            title="Ver detalle"
            style={{ width: "34px", height: "34px", borderRadius: "7px" }}
            className="hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            <Eye style={{ width: "14px", height: "14px" }} />
          </Button>
        </div>
      ),
    },
  ];
}
