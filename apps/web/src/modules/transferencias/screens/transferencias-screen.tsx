"use client";

import { AlertTriangle, Send } from "lucide-react";
import { useState } from "react";

import { ERP_COLORS as C } from "@/constants/theme";
import { Permission } from "@/modules/auth";
import { PageHeader, SucursalPanel } from "@/shared/ui";
import { Can } from "@/shared/ui/can";

import { TransferenciaArrow } from "../components/transferencia-arrow";
import { TransferenciaItemsForm } from "../components/transferencia-items-form";
import { TransferenciaResumen } from "../components/transferencia-resumen";
import { TransferenciasHistorial } from "../components/transferencias-historial";
import { useTransferencias } from "../hooks/use-transferencias";
import type {
  CrearTransferenciaPayload,
  ItemEnCarrito,
} from "../types/transferencia.types";

export function TransferenciasScreen() {
  // form state
  const [origenId, setOrigenId] = useState("");
  const [destinoId, setDestinoId] = useState("");
  const [items, setItems] = useState<ItemEnCarrito[]>([]);
  const [notas, setNotas] = useState("");

  const {
    transferencias,
    total,
    currentPage,
    totalPages,
    rowsPerPage,
    statusFilter,
    loading,
    fetching,
    isCreating,
    isMutating,
    sucursales,
    productos,
    fetchStock,
    crearTransferencia,
    despacharTransferencia,
    completarTransferencia,
    cancelarTransferencia,
    refetch,
    onPageChange,
    onRowsPerPageChange,
    onStatusFilterChange,
  } = useTransferencias(origenId);

  const isMisma = !!origenId && origenId === destinoId;

  const canSubmit =
    !!origenId && !!destinoId && !isMisma && items.length > 0 && !isCreating;

  function handleReset() {
    setOrigenId("");
    setDestinoId("");
    setItems([]);
    setNotas("");
  }

  async function handleSubmit() {
    if (!canSubmit) return;
    const payload: CrearTransferenciaPayload = {
      fromBranchId: origenId,
      toBranchId: destinoId,
      notes: notas.trim() || undefined,
      items: items.map((i) => ({
        productId: i.productId,
        quantity: i.cantidad,
      })),
    };

    try {
      await crearTransferencia(payload);
      handleReset();
    } catch {
      // El toast de error lo maneja la mutación en useTransferencias.
    }
  }

  const showResumen = items.length > 0 && !!origenId && !!destinoId && !isMisma;
  const origenObj = sucursales.find((s) => s.id === origenId);
  const destinoObj = sucursales.find((s) => s.id === destinoId);

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: C.pageBg,
        fontFamily: "inherit",
      }}
    >
      <PageHeader
        breadcrumb="Inventario / Transferencias"
        title="Transferencia de Productos"
      />

      <div className="page-container">
        {/* ── formulario de transferencia (solo con permiso de transferir) ── */}
        <Can permission={Permission.INVENTORY_TRANSFER}>
          <div className="transferencia-panels">
            <SucursalPanel
              role="origen"
              sucursales={sucursales}
              selectedId={origenId}
              onSelect={(id) => {
                setOrigenId(id);
                setItems([]);
              }}
              disabledId={destinoId}
            />

            <TransferenciaArrow />

            <SucursalPanel
              role="destino"
              sucursales={sucursales}
              selectedId={destinoId}
              onSelect={setDestinoId}
              disabledId={origenId}
            />
          </div>

          {isMisma && (
            <Banner color="amber">
              El origen y destino no pueden ser la misma sucursal.
            </Banner>
          )}

          <TransferenciaItemsForm
            origenId={origenId}
            productos={productos}
            items={items}
            notas={notas}
            onItemsChange={setItems}
            onNotasChange={setNotas}
            fetchStock={fetchStock}
          />

          {showResumen && origenObj && destinoObj && (
            <TransferenciaResumen
              origenNombre={origenObj.name}
              destinoNombre={destinoObj.name}
              items={items}
            />
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 12,
            }}
          >
            <button
              onClick={handleReset}
              style={secondaryBtn}
              disabled={isCreating}
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              style={{
                ...primaryBtn,
                opacity: canSubmit ? 1 : 0.5,
                cursor: canSubmit ? "pointer" : "not-allowed",
              }}
            >
              <Send size={16} />
              {isCreating ? "Registrando…" : "Crear Transferencia"}
            </button>
          </div>
        </Can>

        {/* ── historial ──────────────────────────────────────────────────── */}
        <div style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 16 }}>
            <p
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: C.mutedText,
                margin: "0 0 4px",
              }}
            >
              Historial
            </p>
            <h2
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: C.bodyText,
                margin: 0,
              }}
            >
              Transferencias registradas
            </h2>
          </div>

          <TransferenciasHistorial
            transferencias={transferencias}
            total={total}
            currentPage={currentPage}
            totalPages={totalPages}
            rowsPerPage={rowsPerPage}
            loading={loading}
            fetching={fetching}
            statusFilter={statusFilter}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
            onStatusFilterChange={onStatusFilterChange}
            onRefresh={() => void refetch()}
            onDispatch={despacharTransferencia}
            onComplete={completarTransferencia}
            onCancel={cancelarTransferencia}
            isMutating={isMutating}
          />
        </div>
      </div>
    </main>
  );
}

// ── Banner ────────────────────────────────────────────────────────────────────
function Banner({
  children,
  color,
}: {
  children: React.ReactNode;
  color: "amber" | "red";
}) {
  const styles = {
    amber: { bg: "#fef3c7", border: "#fcd34d", text: "#92400e" },
    red: { bg: C.dangerBg, border: "#fecaca", text: C.danger },
  }[color];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "12px 16px",
        borderRadius: 10,
        background: styles.bg,
        border: `1px solid ${styles.border}`,
        fontSize: 14,
        fontWeight: 500,
        color: styles.text,
      }}
    >
      <AlertTriangle size={16} style={{ flexShrink: 0 }} />
      {children}
    </div>
  );
}

// ── button styles ─────────────────────────────────────────────────────────────
const primaryBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 24px",
  borderRadius: 8,
  background: C.primary,
  color: "#fff",
  fontWeight: 600,
  fontSize: 15,
  border: "none",
  fontFamily: "inherit",
};

const secondaryBtn: React.CSSProperties = {
  padding: "10px 20px",
  borderRadius: 8,
  background: "#fff",
  color: C.bodyText,
  fontWeight: 600,
  fontSize: 15,
  border: `1px solid ${C.cardBorder}`,
  cursor: "pointer",
  fontFamily: "inherit",
};
