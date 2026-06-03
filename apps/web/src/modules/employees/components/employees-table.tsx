import { Pencil, Trash2 } from "lucide-react";

import { ERP_COLORS as C } from "@/constants/theme";
import type { DataTableColumn } from "@/shared/data-table";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

import type { Employee } from "../types/employee.types";

interface EmployeeTableActions {
  onEdit: (employee: Employee) => void;
  onDelete: (id: string) => void;
}

export function getEmployeesTableColumns(
  actions: EmployeeTableActions,
): DataTableColumn<Employee>[] {
  return [
    {
      id: "name",
      header: "Empleado",
      align: "left",
      cell: (row) => <span style={{ fontWeight: 600 }}>{row.fullName}</span>,
    },
    {
      id: "email",
      header: "Email",
      align: "center",
      cell: (row) => (
        <span style={{ fontSize: "13px", color: C.primary }}>{row.userEmail}</span>
      ),
    },
    {
      id: "branch",
      header: "Sucursal",
      align: "center",
      cell: (row) => row.branchName,
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
          <Button
            variant="icon"
            onClick={() => actions.onEdit(row)}
            title="Editar"
            style={{ width: "34px", height: "34px", borderRadius: "7px" }}
            className="hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            <Pencil style={{ width: "14px", height: "14px" }} />
          </Button>
          <Button
            variant="icon"
            onClick={() => actions.onDelete(row.id)}
            title="Eliminar"
            style={{ width: "34px", height: "34px", borderRadius: "7px" }}
            className="hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 style={{ width: "14px", height: "14px" }} />
          </Button>
        </div>
      ),
    },
  ];
}
