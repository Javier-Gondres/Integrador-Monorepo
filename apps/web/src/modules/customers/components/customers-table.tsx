"use client";

import { Permission } from "@repo/shared";
import { Pencil, Trash2 } from "lucide-react";

import { ERP_COLORS as C } from "@/constants/theme";
import type { DataTableColumn } from "@/shared/data-table";
import { Button } from "@/shared/ui/button";
import { Can } from "@/shared/ui/can";
import { StatusToggle } from "@/shared/ui/status-toggle";

import type { Customer } from "../types/customer.types";
import { formatCedulaMask } from "../utils/customer-formatters";

interface CustomerTableActions {
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
}

export function getCustomersTableColumns(
  actions: CustomerTableActions,
): DataTableColumn<Customer>[] {
  return [
    {
      id: "name",
      header: "Cliente",
      align: "left",
      cell: (customer) => (
        <span style={{ fontWeight: 600 }}>{customer.fullName}</span>
      ),
    },
    {
      id: "email",
      header: "Email",
      cell: (customer) => (
        <span style={{ color: C.mutedText }}>{customer.email ?? "-"}</span>
      ),
    },
    {
      id: "phone",
      header: "Teléfono",
      cell: (customer) => (
        <span style={{ color: C.mutedText }}>{customer.phone ?? "-"}</span>
      ),
    },
    {
      id: "cedula",
      header: "Cédula",
      cell: (customer) => (
        <span style={{ color: C.mutedText }}>
          {customer.cedula ? formatCedulaMask(customer.cedula) : "-"}
        </span>
      ),
    },
    {
      id: "status",
      header: "Estado",
      cell: (customer) => (
        <Can permission={Permission.CUSTOMERS_UPDATE}>
          <StatusToggle
            isActive={customer.isActive}
            onToggle={() =>
              actions.onToggleStatus(customer.id, customer.isActive)
            }
          />
        </Can>
      ),
    },
    {
      id: "actions",
      header: "",
      align: "right",
      cell: (customer) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "8px",
          }}
        >
          <Can permission={Permission.CUSTOMERS_UPDATE}>
            <Button
              variant="icon"
              onClick={() => actions.onEdit(customer)}
              title="Editar"
              style={{ width: "34px", height: "34px", borderRadius: "7px" }}
              className="hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
              <Pencil style={{ width: "14px", height: "14px" }} />
            </Button>
          </Can>
          <Can permission={Permission.CUSTOMERS_DELETE}>
            <Button
              variant="icon"
              onClick={() => actions.onDelete(customer.id)}
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
