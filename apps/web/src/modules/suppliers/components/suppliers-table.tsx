"use client";

import { Permission } from "@repo/shared";
import { Pencil, Trash2 } from "lucide-react";

import type { DataTableColumn } from "@/shared/data-table";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Can } from "@/shared/ui/can";

import type { Supplier } from "../types/supplier.types";

interface SupplierTableActions {
  onEdit: (supplier: Supplier) => void;
  onDelete: (id: string) => void;
}

export function getSuppliersTableColumns(
  actions: SupplierTableActions,
): DataTableColumn<Supplier>[] {
  return [
    {
      id: "name",
      header: "Nombre",
      align: "left",
      cell: (row) => <span style={{ fontWeight: 600 }}>{row.name}</span>,
    },
    {
      id: "contactName",
      header: "Contacto",
      align: "center",
      cell: (row) => row.contactName ?? "—",
    },
    {
      id: "email",
      header: "Email",
      align: "center",
      cell: (row) => row.email ?? "—",
    },
    {
      id: "rnc",
      header: "RNC",
      align: "center",
      cell: (row) => row.rnc ?? "—",
    },
    {
      id: "phone",
      header: "Teléfono",
      align: "center",
      cell: (row) => row.phone ?? "—",
    },
    {
      id: "status",
      header: "Estado",
      cell: (row) => (
        <Badge variant={row.isActive ? "success" : "muted"}>
          {row.isActive ? "Activo" : "Inactivo"}
        </Badge>
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
          <Can permission={Permission.SUPPLIERS_UPDATE}>
            <Button
              variant="icon"
              onClick={() => actions.onEdit(row)}
              title="Editar"
              style={{ width: "34px", height: "34px", borderRadius: "7px" }}
              className="hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
              <Pencil style={{ width: "14px", height: "14px" }} />
            </Button>
          </Can>
          <Can permission={Permission.SUPPLIERS_DELETE}>
            <Button
              variant="icon"
              onClick={() => actions.onDelete(row.id)}
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
