"use client";

import { useQuery } from "@tanstack/react-query";
import { Banknote, UserCheck, X } from "lucide-react";
import { useState } from "react";

import { ERP_COLORS as C } from "@/constants/theme";
import { getEmployees } from "@/modules/employees/api/get-employees";
import { Button } from "@/shared/ui/button";

import type { AbrirTurnoPayload, Caja } from "../types/caja.types";

interface Props {
  caja: Caja;
  onConfirm: (payload: AbrirTurnoPayload) => void;
  onClose: () => void;
  loading?: boolean;
  branchId?: string;
}

export function AbrirTurnoModal({
  caja,
  onConfirm,
  onClose,
  loading,
  branchId,
}: Props) {
  const [empleadoId, setEmpleadoId] = useState("");
  const [montoApertura, setMontoApertura] = useState("");

  const { data: employeesData } = useQuery({
    queryKey: ["employees", branchId],
    queryFn: () => getEmployees({ branchId, take: 100 }),
  });

  const employees = employeesData?.items || [];
  const canSubmit =
    empleadoId.trim().length > 0 && Number(montoApertura) >= 0 && !loading;

  function handleSubmit() {
    if (!canSubmit) return;
    const emp = employees.find((e) => e.id === empleadoId);
    if (!emp) return;
    onConfirm({
      cajaId: caja.id,
      empleadoId: emp.id,
      empleadoNombre: `${emp.user.firstName} ${emp.user.lastName}`,
      montoApertura: Number(montoApertura),
    });
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
          maxWidth: 460,
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
              Apertura de turno
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

        {/* body */}
        <div
          style={{
            padding: "24px 28px",
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          {/* Selector empleado */}
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
              <UserCheck size={15} />
              Cajero asignado
            </label>
            <select
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
              value={empleadoId}
              onChange={(e) => setEmpleadoId(e.target.value)}
            >
              <option value="">Seleccione un empleado...</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.user.firstName} {emp.user.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Monto apertura */}
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
              Monto de apertura (RD$)
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
              value={montoApertura}
              onChange={(e) => setMontoApertura(e.target.value)}
            />
          </div>
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
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {loading ? "Abriendo…" : "Abrir turno"}
          </Button>
        </div>
      </div>
    </div>
  );
}
