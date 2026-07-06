"use client";

import { Permission } from "@repo/shared";
import { Pencil, Trash2 } from "lucide-react";

import { ERP_COLORS as C } from "@/constants/theme";
import type { DataTableColumn } from "@/shared/data-table";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Can } from "@/shared/ui/can";
import { StatusToggle } from "@/shared/ui/status-toggle";

import type { Discount } from "../types/discount.types";

interface DiscountTableActions {
  onEdit: (discount: Discount) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
}

function formatDate(value: string | null) {
  if (!value) return "Sin fecha";
  return new Intl.DateTimeFormat("es-DO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function joinNames(items: { name: string }[]) {
  if (items.length === 0) return "Ninguno";
  return (
    items
      .slice(0, 3)
      .map((item) => item.name)
      .join(", ") + (items.length > 3 ? ` +${items.length - 3}` : "")
  );
}

export function getDiscountsTableColumns(
  actions: DiscountTableActions,
): DataTableColumn<Discount>[] {
  return [
    {
      id: "name",
      header: "Descuento",
      align: "left",
      cell: (discount) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <span style={{ fontWeight: 700 }}>{discount.name}</span>
          {discount.description ? (
            <span style={{ fontSize: "12px", color: C.headText }}>
              {discount.description}
            </span>
          ) : null}
        </div>
      ),
    },
    {
      id: "percentage",
      header: "Porcentaje",
      cell: (discount) => (
        <Badge variant="primary">{discount.percentage.toFixed(2)}%</Badge>
      ),
    },
    {
      id: "validity",
      header: "Vigencia",
      cell: (discount) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
          <span style={{ fontWeight: 500 }}>
            {formatDate(discount.startDate)}
          </span>
          <span style={{ fontSize: "12px", color: C.headText }}>
            Hasta {formatDate(discount.endDate)}
          </span>
        </div>
      ),
    },
    {
      id: "scope",
      header: "Alcance",
      align: "left",
      cell: (discount) => (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            maxWidth: "360px",
          }}
        >
          <span style={{ fontSize: "13px", color: C.bodyText }}>
            Productos: {discount.products.length} | Categorías:{" "}
            {discount.categories.length}
          </span>
          <span style={{ fontSize: "12px", color: C.headText }}>
            Excluidos: {joinNames(discount.excludedProducts)}
          </span>
        </div>
      ),
    },
    {
      id: "status",
      header: "Estado",
      cell: (discount) => (
        <Can permission={Permission.DISCOUNTS_UPDATE}>
          <StatusToggle
            isActive={discount.isActive}
            onToggle={() =>
              actions.onToggleStatus(discount.id, discount.isActive)
            }
          />
        </Can>
      ),
    },
    {
      id: "actions",
      header: "Acciones",
      cell: (discount) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
          }}
        >
          <Can permission={Permission.DISCOUNTS_UPDATE}>
            <Button
              variant="icon"
              onClick={() => actions.onEdit(discount)}
              title="Editar"
              style={{ width: "34px", height: "34px", borderRadius: "7px" }}
              className="hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
              <Pencil style={{ width: "14px", height: "14px" }} />
            </Button>
          </Can>
          <Can permission={Permission.DISCOUNTS_DELETE}>
            <Button
              variant="icon"
              onClick={() => actions.onDelete(discount.id)}
              title="Eliminar"
              style={{ width: "34px", height: "34px", borderRadius: "7px" }}
              className="hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 style={{ width: "14px", height: "14px" }} />
            </Button>
          </Can>
        </div>
      ),
    },
  ];
}
