"use client";

import { Pencil } from "lucide-react";

import { ERP_COLORS as C } from "@/constants/theme";
import type { DataTableColumn } from "@/shared/data-table";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { StatusToggle } from "@/shared/ui/status-toggle";

import type { PlatformCompany } from "../types/platform.types";

interface PlatformCompaniesTableActions {
  onToggleStatus: (id: string, isActive: boolean) => void;
  onEdit: (company: PlatformCompany) => void;
}

export function getPlatformCompaniesTableColumns(
  actions: PlatformCompaniesTableActions,
): DataTableColumn<PlatformCompany>[] {
  return [
    {
      id: "name",
      header: "Empresa",
      align: "left",
      cell: (row) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
          <span style={{ fontWeight: 600 }}>{row.name}</span>
          <span style={{ fontSize: "12px", color: C.mutedText }}>
            {row.slug}
          </span>
        </div>
      ),
    },
    {
      id: "owner",
      header: "Owner",
      align: "left",
      cell: (row) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
          <span style={{ fontSize: "13px" }}>{row.ownerName ?? "—"}</span>
          <span style={{ fontSize: "12px", color: C.mutedText }}>
            {row.ownerEmail ?? "Sin owner"}
          </span>
        </div>
      ),
    },
    {
      id: "rnc",
      header: "RNC",
      cell: (row) => row.rnc ?? "—",
    },
    {
      id: "status",
      header: "Estado",
      cell: (row) => (
        <StatusToggle
          isActive={row.isActive}
          onToggle={() => actions.onToggleStatus(row.id, row.isActive)}
        />
      ),
    },
    {
      id: "badge",
      header: "Tenant",
      cell: (row) => (
        <Badge variant={row.isActive ? "success" : "muted"}>
          {row.isActive ? "Operativa" : "Suspendida"}
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
          }}
        >
          <Button
            variant="icon"
            onClick={() => actions.onEdit(row)}
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
