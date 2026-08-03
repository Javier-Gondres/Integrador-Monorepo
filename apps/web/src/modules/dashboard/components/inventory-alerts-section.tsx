"use client";

import { format, isValid, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { AlertTriangle, PackageSearch } from "lucide-react";

import type { DataTableColumn } from "@/shared/data-table";
import { DataTable } from "@/shared/data-table";
import { Badge } from "@/shared/ui/badge";

import { useRecurringWasteAlerts } from "../hooks/use-recurring-waste-alerts";
import type { InventoryAlert } from "../types/recurring-waste-alerts";

function formatDate(value?: string) {
  if (!value) {
    return "—";
  }

  const parsedDate = parseISO(value);
  if (!isValid(parsedDate)) {
    return "—";
  }

  return format(parsedDate, "dd/MM/yyyy", { locale: es });
}

function renderAlertDescription(alert: InventoryAlert) {
  if (alert.type === "RECURRING_WASTE") {
    const wasteCount = alert.wasteCount ?? 0;
    const periodDays = alert.periodDays ?? 7;

    return (
      <span className="text-sm text-slate-600">
        Se registraron{" "}
        <span className="font-semibold text-slate-900">{wasteCount}</span>{" "}
        mermas en los últimos{" "}
        <span className="font-semibold text-slate-900">{periodDays}</span> días
        para este producto en la sucursal{" "}
        <span className="font-semibold text-slate-900">
          {alert.branch.name}
        </span>
        .
      </span>
    );
  }

  if (alert.type === "LOW_STOCK") {
    const currentStock = alert.currentStock ?? "—";
    const minimumStock = alert.minimumStock ?? "—";

    return (
      <span className="text-sm text-slate-600">
        Stock actual:{" "}
        <span className="font-semibold text-slate-900">{currentStock}</span>.
        Mínimo requerido:{" "}
        <span className="font-semibold text-slate-900">{minimumStock}</span>.
      </span>
    );
  }

  return null;
}

export function InventoryAlertsSection() {
  const { data, isLoading } = useRecurringWasteAlerts();

  const recurringWasteAlerts = (data ?? []).filter(
    (alert) => alert.type === "RECURRING_WASTE",
  );
  const lowStockAlerts = (data ?? []).filter(
    (alert) => alert.type === "LOW_STOCK",
  );

  const columns: DataTableColumn<InventoryAlert>[] = [
    {
      id: "type",
      header: "Tipo de Alerta",
      align: "left",
      cell: (row) => {
        if (row.type === "RECURRING_WASTE") {
          return (
            <Badge variant="warning">
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <AlertTriangle size={12} /> Merma recurrente
              </span>
            </Badge>
          );
        }

        return (
          <Badge variant="error">
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <PackageSearch size={12} /> Stock mínimo
            </span>
          </Badge>
        );
      },
    },
    {
      id: "product",
      header: "Producto",
      align: "left",
      cell: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.product.name}</div>
          <div style={{ fontSize: "12px", color: "#667085" }}>
            {row.product.code}
          </div>
        </div>
      ),
    },
    {
      id: "company",
      header: "Empresa",
      align: "left",
      cell: (row) => row.company.name,
    },
    {
      id: "branch",
      header: "Sucursal",
      align: "left",
      cell: (row) => row.branch.name,
    },
    {
      id: "description",
      header: "Descripción",
      align: "left",
      cell: (row) => renderAlertDescription(row),
    },
    {
      id: "date",
      header: "Fecha",
      align: "left",
      cell: (row) => formatDate(row.latestDate ?? row.latestWasteDate),
    },
  ];

  return (
    <section style={{ marginBottom: "20px" }}>
      <div className="mb-4 flex flex-wrap gap-4">
        <div className="w-fit rounded-[18px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #f59e0b, #fbbf24)",
                color: "#fff",
              }}
            >
              <AlertTriangle size={18} />
            </div>
            <div>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#3c50e0",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Merma recurrente
              </div>
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: 700,
                  color: "#101828",
                  textAlign: "center",
                  margin: "8px 0",
                }}
              >
                {isLoading ? "…" : recurringWasteAlerts.length}
              </div>
              <div style={{ fontSize: "13px", color: "#667085" }}>
                Productos con mermas recurrentes
              </div>
            </div>
          </div>
        </div>

        <div className="w-fit rounded-[18px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #ef4444, #f87171)",
                color: "#fff",
              }}
            >
              <PackageSearch size={18} />
            </div>
            <div>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#2563eb",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Inventario mínimo
              </div>
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: 700,
                  color: "#101828",
                  textAlign: "center",
                  margin: "8px 0",
                }}
              >
                {isLoading ? "…" : lowStockAlerts.length}
              </div>
              <div style={{ fontSize: "13px", color: "#667085" }}>
                Productos con inventario bajo al mínimo
              </div>
            </div>
          </div>
        </div>
      </div>

      <DataTable
        title="Alertas de Inventario"
        columns={columns}
        data={data ?? []}
        loading={isLoading}
        loadingMessage="Cargando alertas..."
        emptyMessage="No hay alertas de inventario para mostrar."
        total={data?.length ?? 0}
        getRowKey={(row) => `${row.type}-${row.branch.id}-${row.product.id}`}
        pagination={{
          currentPage: 1,
          rowsPerPage: data?.length ?? 0,
          total: data?.length ?? 0,
          totalPages: 1,
        }}
        onPageChange={() => undefined}
        onRowsPerPageChange={() => undefined}
      />
    </section>
  );
}
