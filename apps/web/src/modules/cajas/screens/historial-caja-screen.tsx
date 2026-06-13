"use client";

import { Calendar, AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { ERP_COLORS as C } from "@/constants/theme";
import { PageHeader } from "@/shared/ui";
import { DataTable, DataTableToolbar } from "@/shared/data-table";
import type { DataTableColumn } from "@/shared/data-table";

import { useHistorialCaja } from "../hooks/use-historial-caja";
import { formatCurrency } from "../utils/format";
import type { TurnoHistorial } from "../types/caja.types";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const day = d.getDate().toString().padStart(2, "0");
  const month = d.toLocaleString("es", { month: "short" });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const h = d.getHours() % 12 || 12;
  const m = d.getMinutes().toString().padStart(2, "0");
  const ampm = d.getHours() < 12 ? "a. m." : "p. m.";
  return `${h}:${m} ${ampm}`;
}

const COLUMNS: DataTableColumn<TurnoHistorial>[] = [
  {
    id: "fecha",
    header: "Fecha y Hora",
    align: "left",
    cell: (turno) => (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Calendar size={14} color={C.mutedText} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: C.bodyText }}>
            {formatDate(turno.abiertoEn)}
          </div>
          <div style={{ fontSize: 12, color: C.mutedText }}>
            {formatTime(turno.abiertoEn)}
            {turno.cerradoEn
              ? ` — ${formatTime(turno.cerradoEn)}`
              : " — Abierto"}
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "cajero",
    header: "Cajero",
    align: "left",
    cell: (turno) => (
      <span style={{ fontSize: 14, fontWeight: 500, color: C.bodyText }}>
        {turno.empleadoNombre}
      </span>
    ),
  },
  {
    id: "apertura",
    header: "Apertura",
    align: "right",
    cell: (turno) => (
      <span style={{ fontWeight: 500, color: C.bodyText }}>
        {formatCurrency(turno.montoApertura)}
      </span>
    ),
  },
  {
    id: "ventas",
    header: "Ventas",
    align: "right",
    cell: (turno) => (
      <span style={{ fontWeight: 700, color: C.primary }}>
        {formatCurrency(turno.totalVentas)}
      </span>
    ),
  },
  {
    id: "efectivo-tarjeta",
    header: "Efectivo / Tarjeta",
    align: "right",
    cell: (turno) => (
      <div>
        <div style={{ fontSize: 13, color: C.bodyText, fontWeight: 500 }}>
          E: {formatCurrency(turno.totalEfectivo)}
        </div>
        <div style={{ fontSize: 12, color: C.mutedText }}>
          T: {formatCurrency(turno.totalTarjeta)}
        </div>
      </div>
    ),
  },
  {
    id: "cierre",
    header: "Cierre",
    align: "right",
    cell: (turno) => {
      const isOpen = turno.cerradoEn === null;
      return isOpen ? (
        <span
          style={{
            fontSize: 11,
            color: C.greenText,
            fontWeight: 700,
            background: C.greenBg,
            padding: "3px 8px",
            borderRadius: 12,
          }}
        >
          EN CURSO
        </span>
      ) : (
        <span style={{ fontWeight: 500, color: C.bodyText }}>
          {formatCurrency(turno.montoCierre!)}
        </span>
      );
    },
  },
  {
    id: "diferencia",
    header: "Diferencia",
    align: "right",
    cell: (turno) => {
      const isOpen = turno.cerradoEn === null;
      const dif = turno.diferencia ?? 0;
      return isOpen ? (
        <span style={{ color: C.mutedText }}>—</span>
      ) : (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "4px 10px",
            borderRadius: 12,
            fontSize: 12,
            fontWeight: 600,
            background: dif < 0 ? C.dangerBg : dif > 0 ? C.greenBg : "#f0f9ff",
            color: dif < 0 ? C.danger : dif > 0 ? C.greenText : "#0369a1",
          }}
        >
          {dif !== 0 && <AlertTriangle size={11} />}
          {dif === 0 ? "Exacto" : formatCurrency(Math.abs(dif))}
        </span>
      );
    },
  },
];

export function HistorialCajaScreen({ cajaId }: { cajaId: string }) {
  const {
    historial,
    total,
    totalPages,
    currentPage,
    rowsPerPage,
    loading,
    fetching,
    refetch,
    onPageChange,
    onRowsPerPageChange,
  } = useHistorialCaja(cajaId);

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: C.pageBg,
        fontFamily: "inherit",
      }}
    >
      {/* nav bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "20px 40px 0",
        }}
      >
        <Link
          href="/cajas"
          title="Volver a Cajas"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 34,
            height: 34,
            borderRadius: 8,
            background: C.cardBg,
            border: `1px solid ${C.cardBorder}`,
            color: C.bodyText,
            textDecoration: "none",
            flexShrink: 0,
          }}
          className="hover:border-blue-400 hover:text-blue-500 transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>
        <div style={{ flex: 1 }}>
          <PageHeader
            breadcrumb="Cajas / Historial"
            title="Historial de Turnos"
          />
        </div>
      </div>

      {/* content */}
      <div
        style={{
          padding: "20px 40px 40px",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        <DataTableToolbar
          searchPlaceholder="Buscar cajero..."
          searchValue=""
          onSearchChange={() => {}}
          onRefresh={() => void refetch()}
          refreshing={fetching}
          createLabel=""
          onCreate={() => {}}
        />

        <DataTable
          title="Historial de Turnos"
          columns={COLUMNS}
          data={historial}
          loading={loading}
          loadingMessage="Cargando historial..."
          emptyMessage="Esta caja aún no tiene un historial de aperturas o cierres."
          total={total}
          getRowKey={(t) => t.id}
          pagination={{
            total,
            currentPage,
            totalPages,
            rowsPerPage,
            loading: fetching,
          }}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      </div>
    </main>
  );
}
