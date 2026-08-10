"use client";

import { Permission } from "@repo/shared";
import { Pencil, UserMinus } from "lucide-react";

import { ERP_COLORS as C } from "@/constants/theme";
import type { DataTableColumn } from "@/shared/data-table";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Can } from "@/shared/ui/can";

import type { CompanyMember } from "../types/company-member.types";

interface MemberTableActions {
  canEdit: (member: CompanyMember) => boolean;
  canRemove: (member: CompanyMember) => boolean;
  onEdit: (member: CompanyMember) => void;
  onRemove: (userId: string) => void;
}

export function getEmployeesTableColumns(
  actions: MemberTableActions,
): DataTableColumn<CompanyMember>[] {
  return [
    {
      id: "name",
      header: "Miembro",
      align: "left",
      cell: (row) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
          <span style={{ fontWeight: 600 }}>{row.fullName}</span>
          <span style={{ fontSize: "12px", color: C.mutedText }}>
            {row.email}
          </span>
        </div>
      ),
    },
    {
      id: "role",
      header: "Rol",
      align: "center",
      cell: (row) => <Badge variant="primary">{row.roleLabel}</Badge>,
    },
    {
      id: "branch",
      header: "Sucursal",
      align: "center",
      cell: (row) => row.branchName ?? "—",
    },
    {
      id: "position",
      header: "Puesto",
      align: "center",
      cell: (row) =>
        row.position ?? (
          <em style={{ color: C.mutedText, fontSize: "13px" }}>—</em>
        ),
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
          {actions.canEdit(row) && (
            <Can permission={Permission.USERS_UPDATE}>
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
          )}
          {actions.canRemove(row) && (
            <Can permission={Permission.USERS_REMOVE_MEMBERSHIP}>
              <Button
                variant="icon"
                onClick={() => actions.onRemove(row.userId)}
                title="Sacar de empresa"
                style={{ width: "34px", height: "34px", borderRadius: "7px" }}
                className="hover:border-amber-300 hover:text-amber-600 hover:bg-amber-50 transition-colors"
              >
                <UserMinus style={{ width: "14px", height: "14px" }} />
              </Button>
            </Can>
          )}
        </div>
      ),
    },
  ];
}
