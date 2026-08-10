"use client";

import { format, isValid, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { AlertTriangle, PackageSearch } from "lucide-react";
import type { ReactNode } from "react";

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
      <span className="wrap-break-word text-sm text-slate-600">
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
      <span className="wrap-break-word text-sm text-slate-600">
        Stock actual:{" "}
        <span className="font-semibold text-slate-900">{currentStock}</span>.
        Mínimo requerido:{" "}
        <span className="font-semibold text-slate-900">{minimumStock}</span>.
      </span>
    );
  }

  return null;
}

interface AlertSummaryCardProps {
  icon: ReactNode;
  label: string;
  count: number | string;
  description: string;
  accent: string;
}

function AlertSummaryCard({
  icon,
  label,
  count,
  description,
  accent,
}: AlertSummaryCardProps) {
  return (
    <div className="min-w-0 rounded-[18px] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] sm:p-5">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white sm:h-10.5 sm:w-10.5"
          style={{ background: accent }}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <div className="wrap-break-word text-xs font-bold uppercase tracking-[0.08em] text-primary">
            {label}
          </div>
          <div className="my-1 text-2xl font-bold text-slate-900 sm:text-[32px]">
            {count}
          </div>
          <div className="wrap-break-word text-[13px] text-slate-500">
            {description}
          </div>
        </div>
      </div>
    </div>
  );
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
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <AlertTriangle className="h-3 w-3 shrink-0" /> Merma recurrente
              </span>
            </Badge>
          );
        }

        return (
          <Badge variant="error">
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <PackageSearch className="h-3 w-3 shrink-0" /> Stock mínimo
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
        <div className="min-w-0">
          <div className="wrap-break-word font-semibold text-slate-900">
            {row.product.name}
          </div>
          <div className="wrap-break-word text-xs text-slate-500">
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
    <section className="mb-5 min-w-0">
      <div className="mb-4 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-[repeat(2,minmax(0,280px))]">
        <AlertSummaryCard
          icon={<AlertTriangle className="h-4.5 w-4.5" />}
          label="Merma recurrente"
          count={isLoading ? "…" : recurringWasteAlerts.length}
          description="Productos con mermas recurrentes"
          accent="linear-gradient(135deg, #f59e0b, #fbbf24)"
        />
        <AlertSummaryCard
          icon={<PackageSearch className="h-4.5 w-4.5" />}
          label="Inventario mínimo"
          count={isLoading ? "…" : lowStockAlerts.length}
          description="Productos con inventario bajo al mínimo"
          accent="linear-gradient(135deg, #ef4444, #f87171)"
        />
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
