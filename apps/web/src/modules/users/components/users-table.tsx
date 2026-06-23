"use client";

import { Permission } from "@repo/shared";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Pencil, Trash2 } from "lucide-react";

import { ERP_COLORS as C } from "@/constants/theme";
import type { DataTableColumn } from "@/shared/data-table";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Can } from "@/shared/ui/can";
import { StatusToggle } from "@/shared/ui/status-toggle";

import type { User } from "../types/user.types";

interface UserTableActions {
  canManageRow: (user: User) => boolean;
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
}

function formatLastLogin(value: string | null) {
  if (!value) {
    return "Nunca";
  }

  return format(new Date(value), "d MMM yyyy, h:mm aaa", { locale: es });
}

export function getUsersTableColumns(
  actions: UserTableActions,
): DataTableColumn<User>[] {
  return [
    {
      id: "name",
      header: "Usuario",
      align: "left",
      cell: (user) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
          <span style={{ fontWeight: 600 }}>{user.fullName}</span>
          <span style={{ fontSize: "12px", color: C.mutedText }}>
            {user.email}
          </span>
        </div>
      ),
    },
    {
      id: "role",
      header: "Rol",
      cell: (user) => <Badge variant="primary">{user.roleLabel}</Badge>,
    },
    {
      id: "lastLogin",
      header: "Último acceso",
      cell: (user) => (
        <span style={{ fontSize: "13px", color: C.headText }}>
          {formatLastLogin(user.lastLoginAt)}
        </span>
      ),
    },
    {
      id: "status",
      header: "Estado",
      cell: (user) => {
        if (!actions.canManageRow(user)) {
          return (
            <Badge variant={user.isActive ? "success" : "muted"}>
              {user.isActive ? "Activo" : "Inactivo"}
            </Badge>
          );
        }

        if (user.isActive) {
          return (
            <Can permission={Permission.USERS_DEACTIVATE}>
              <StatusToggle
                isActive={user.isActive}
                onToggle={() => actions.onToggleStatus(user.id, user.isActive)}
              />
            </Can>
          );
        }

        return (
          <Can permission={Permission.USERS_ACTIVATE}>
            <StatusToggle
              isActive={user.isActive}
              onToggle={() => actions.onToggleStatus(user.id, user.isActive)}
            />
          </Can>
        );
      },
    },
    {
      id: "actions",
      header: "Acciones",
      cell: (user) => {
        if (!actions.canManageRow(user)) {
          return null;
        }

        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
            }}
          >
            <Can permission={Permission.USERS_UPDATE}>
              <Button
                variant="icon"
                onClick={() => actions.onEdit(user)}
                title="Editar"
                style={{ width: "34px", height: "34px", borderRadius: "7px" }}
                className="hover:border-blue-400 hover:text-blue-600 transition-colors"
              >
                <Pencil style={{ width: "14px", height: "14px" }} />
              </Button>
            </Can>
            <Can permission={Permission.USERS_DELETE}>
              <Button
                variant="icon"
                onClick={() => actions.onDelete(user.id)}
                title="Eliminar"
                style={{ width: "34px", height: "34px", borderRadius: "7px" }}
                className="hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 style={{ width: "14px", height: "14px" }} />
              </Button>
            </Can>
          </div>
        );
      },
    },
  ];
}
