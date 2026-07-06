"use client";

import { Permission } from "@repo/shared";
import { Pencil, Trash2 } from "lucide-react";

import { ERP_COLORS as C } from "@/constants/theme";
import type { DataTableColumn } from "@/shared/data-table";
import { Button } from "@/shared/ui/button";
import { Can } from "@/shared/ui/can";
import { StatusToggle } from "@/shared/ui/status-toggle";

import type { Product } from "../types/product.types";

interface ProductTableActions {
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
}

export function getProductsTableColumns(
  actions: ProductTableActions,
): DataTableColumn<Product>[] {
  return [
    {
      id: "code",
      header: "Código",
      cell: (p) => (
        <span style={{ fontSize: "13px", color: C.headText }}>{p.code}</span>
      ),
    },
    {
      id: "name",
      header: "Nombre",
      align: "left",
      cell: (p) => <span style={{ fontWeight: 600 }}>{p.name}</span>,
    },
    {
      id: "description",
      header: "Descripción",
      align: "center",
      cell: (p) => (
        <div
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: "280px",
            color: C.headText,
          }}
        >
          {p.description || (
            <em style={{ color: C.mutedText, fontSize: "13px" }}>
              Sin descripción
            </em>
          )}
        </div>
      ),
    },
    {
      id: "price",
      header: "Precio",
      cell: (p) => (
        <span style={{ fontWeight: 500 }}>
          ${p.price.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      id: "status",
      header: "Estado",
      cell: (p) => (
        <Can permission={Permission.PRODUCTS_UPDATE}>
          <StatusToggle
            isActive={p.isActive}
            onToggle={() => actions.onToggleStatus(p.id, p.isActive)}
          />
        </Can>
      ),
    },
    {
      id: "actions",
      header: "Acciones",
      cell: (p) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
          }}
        >
          <Can permission={Permission.PRODUCTS_UPDATE}>
            <Button
              variant="icon"
              onClick={() => actions.onEdit(p)}
              title="Editar"
              style={{ width: "34px", height: "34px", borderRadius: "7px" }}
              className="hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
              <Pencil style={{ width: "14px", height: "14px" }} />
            </Button>
          </Can>
          <Can permission={Permission.PRODUCTS_DELETE}>
            <Button
              variant="icon"
              onClick={() => actions.onDelete(p.id)}
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
