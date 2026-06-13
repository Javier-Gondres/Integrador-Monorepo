"use client";

import { AlertTriangle,Banknote, X } from "lucide-react";
import { useState } from "react";

import { ERP_COLORS as C } from "@/constants/theme";
import { Button } from "@/shared/ui/button";

import type { Caja, CerrarTurnoPayload } from "../types/caja.types";
import { formatCurrency } from "../utils/format";

interface Props {
  caja: Caja;
  onConfirm: (payload: CerrarTurnoPayload) => void;
  onClose: () => void;
  loading?: boolean;
}

export function CerrarTurnoModal({ caja, onConfirm, onClose, loading }: Props) {
  const turno = caja.turnoActivo!;
  const [montoCierre, setMontoCierre] = useState("");

  const diferencia =
    montoCierre !== ""
      ? Number(montoCierre) - (turno.montoApertura + turno.totalEfectivo)
      : null;

  const canSubmit = montoCierre !== "" && Number(montoCierre) >= 0 && !loading;

  function handleSubmit() {
    if (!canSubmit) return;
    onConfirm({ turnoId: turno.id, montoCierre: Number(montoCierre) });
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
    >
      <div
        style={{
          background: C.cardBg,
          borderRadius: 16,
          width: "100%",
          maxWidth: 500,
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          overflow: "hidden",
        }}
      >
        {/* header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            padding: "24px 28px 20px",
            borderBottom: `1px solid ${C.divider}`,
          }}
        >
          <div>
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: C.mutedText,
                margin: "0 0 4px",
              }}
            >
              Cierre de turno
            </p>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: C.bodyText,
                margin: 0,
              }}
            >
              {caja.nombre}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: C.mutedText,
              padding: 4,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
            }}
            className="hover:text-gray-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* resumen del turno */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
            padding: "20px 28px",
            background: C.tableHead,
            borderBottom: `1px solid ${C.divider}`,
          }}
        >
          {[
            { label: "Cajero", value: turno.empleadoNombre },
            {
              label: "Monto apertura",
              value: formatCurrency(turno.montoApertura),
            },
            {
              label: "Total ventas",
              value: formatCurrency(turno.totalVentas),
              accent: true,
            },
            {
              label: "Efectivo recibido",
              value: formatCurrency(turno.totalEfectivo),
            },
            {
              label: "Tarjeta recibida",
              value: formatCurrency(turno.totalTarjeta),
            },
          ].map(({ label, value, accent }) => (
            <div
              key={label}
              style={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              <span
                style={{ fontSize: 11, color: C.mutedText, fontWeight: 500 }}
              >
                {label}
              </span>
              <span
                style={{
                  fontSize: accent ? 17 : 14,
                  fontWeight: accent ? 700 : 500,
                  color: accent ? C.primary : C.bodyText,
                }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* body */}
        <div
          style={{
            padding: "20px 28px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                fontWeight: 500,
                color: C.headText,
              }}
            >
              <Banknote size={15} />
              Efectivo contado en caja (RD$)
            </label>
            <input
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 8,
                border: `1px solid ${C.inputBorder}`,
                fontSize: 14,
                color: C.bodyText,
                background: C.tableHead,
                outline: "none",
                boxSizing: "border-box",
              }}
              type="number"
              min={0}
              placeholder="0.00"
              value={montoCierre}
              onChange={(e) => setMontoCierre(e.target.value)}
            />
          </div>

          {diferencia !== null && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "10px 14px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                background:
                  diferencia < 0
                    ? C.dangerBg
                    : diferencia > 0
                      ? C.greenBg
                      : "#f0f9ff",
                color:
                  diferencia < 0
                    ? C.danger
                    : diferencia > 0
                      ? C.greenText
                      : "#0369a1",
                border: `1px solid ${
                  diferencia < 0
                    ? "#fecaca"
                    : diferencia > 0
                      ? C.greenBorder
                      : "#bae6fd"
                }`,
              }}
            >
              {diferencia !== 0 && <AlertTriangle size={14} />}
              {diferencia === 0
                ? "✓ Cuadre exacto"
                : diferencia > 0
                  ? `Sobrante: ${formatCurrency(diferencia)}`
                  : `Faltante: ${formatCurrency(Math.abs(diferencia))}`}
            </div>
          )}
        </div>

        {/* footer */}
        <div
          style={{
            padding: "16px 28px 24px",
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            borderTop: `1px solid ${C.divider}`,
          }}
        >
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              backgroundColor: C.danger,
              border: `1px solid ${C.danger}`,
              color: "#fff",
            }}
          >
            {loading ? "Cerrando…" : "Cerrar turno"}
          </Button>
        </div>
      </div>
    </div>
  );
}
