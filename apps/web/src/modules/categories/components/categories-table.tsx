"use client";

import { Permission } from "@repo/shared";
import { Pencil, Trash2 } from "lucide-react";

import { ERP_COLORS as C } from "@/constants/theme";
import type { DataTableColumn } from "@/shared/data-table";
import { Button } from "@/shared/ui/button";
import { Can } from "@/shared/ui/can";
import { StatusToggle } from "@/shared/ui/status-toggle";

import type { Category } from "../types/category.types";

interface CategoryTableActions {
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
}

export function getCategoriesTableColumns(
  actions: CategoryTableActions,
): DataTableColumn<Category>[] {
  return [
    {
      id: "name",
      header: "Nombre",
      align: "left",
      cell: (cat) => <span style={{ fontWeight: 600 }}>{cat.name}</span>,
    },
    {
      id: "description",
      header: "Descripción",
      align: "center",
      cell: (cat) => (
        <div
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: "320px",
            color: C.headText,
          }}
        >
          {cat.description || (
            <em style={{ color: C.mutedText, fontSize: "13px" }}>
              Sin descripción
            </em>
          )}
        </div>
      ),
    },
    {
      id: "status",
      header: "Estado",
      cell: (cat) => (
        <Can permission={Permission.CATEGORIES_UPDATE}>
          <StatusToggle
            isActive={cat.isActive}
            onToggle={() => actions.onToggleStatus(cat.id, cat.isActive)}
          />
        </Can>
      ),
    },
    {
      id: "actions",
      header: "Acciones",
      cell: (cat) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
          }}
        >
          <Can permission={Permission.CATEGORIES_UPDATE}>
            <Button
              variant="icon"
              onClick={() => actions.onEdit(cat)}
              title="Editar"
              style={{ width: "34px", height: "34px", borderRadius: "7px" }}
              className="hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
              <Pencil style={{ width: "14px", height: "14px" }} />
            </Button>
          </Can>
          <Can permission={Permission.CATEGORIES_DELETE}>
            <Button
              variant="icon"
              onClick={() => actions.onDelete(cat.id)}
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
