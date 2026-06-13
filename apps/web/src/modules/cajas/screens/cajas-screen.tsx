"use client";

import { useQuery } from "@tanstack/react-query";
import { Clock3, DollarSign, LayoutGrid, Plus, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

import { ERP_COLORS as C } from "@/constants/theme";
import { getBranchesForSelect } from "@/modules/employees/api/get-branches";
import { PageHeader } from "@/shared/ui";
import { Button } from "@/shared/ui/button";

import { AbrirTurnoModal } from "../components/abrir-turno-modal";
import { CajaCard } from "../components/caja-card";
import { CerrarTurnoModal } from "../components/cerrar-turno-modal";
import { CrearCajaModal } from "../components/crear-caja-modal";
import { useCajas } from "../hooks/use-cajas";
import type { Caja } from "../types/caja.types";
import { formatCurrency } from "../utils/format";

type ModalState =
  | { type: "abrir"; caja: Caja }
  | { type: "cerrar"; caja: Caja }
  | { type: "crear" }
  | null;

export function CajasScreen() {
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");

  const { data: branches = [] } = useQuery({
    queryKey: ["branches-select"],
    queryFn: getBranchesForSelect,
  });

  useEffect(() => {
    const firstBranch = branches[0];
    if (firstBranch && !selectedBranchId) {
      setSelectedBranchId(firstBranch.id);
    }
  }, [branches, selectedBranchId]);

  const { cajas, loading, abrirTurno, cerrarTurno, crearCaja } =
    useCajas(selectedBranchId);
  const [modal, setModal] = useState<ModalState>(null);

  const cajasAbiertas = cajas.filter((c) => !!c.turnoActivo).length;
  const totalVentasHoy = cajas.reduce(
    (acc, c) => acc + (c.turnoActivo?.totalVentas ?? 0),
    0,
  );
  const totalEfectivoHoy = cajas.reduce(
    (acc, c) => acc + (c.turnoActivo?.totalEfectivo ?? 0),
    0,
  );

  function handleConfirmAbrir(payload: Parameters<typeof abrirTurno>[0]) {
    abrirTurno(payload);
    setModal(null);
  }

  function handleConfirmCerrar(payload: Parameters<typeof cerrarTurno>[0]) {
    cerrarTurno(payload);
    setModal(null);
  }

  function handleConfirmCrear(name: string) {
    crearCaja({ name, branchId: selectedBranchId });
    setModal(null);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: C.pageBg,
        fontFamily: "inherit",
      }}
    >
      <PageHeader breadcrumb="Cajas" title="Cajas" />

      <div
        style={{
          padding: "32px 40px",
          display: "flex",
          flexDirection: "column",
          gap: 28,
        }}
      >
        {/* ── selector de sucursal ─────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: C.headText }}>
            Sucursal:
          </span>
          <select
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: `1px solid ${C.inputBorder}`,
              fontSize: 13,
              backgroundColor: C.cardBg,
              color: C.bodyText,
              minWidth: 200,
              outline: "none",
            }}
          >
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* ── KPI bar ─────────────────────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
          }}
        >
          {[
            {
              icon: <LayoutGrid size={18} />,
              label: "Cajas abiertas",
              value: `${cajasAbiertas} / ${cajas.length}`,
              tone: "#10b981",
            },
            {
              icon: <TrendingUp size={18} />,
              label: "Ventas del día",
              value: formatCurrency(totalVentasHoy),
              tone: C.primary,
            },
            {
              icon: <DollarSign size={18} />,
              label: "Efectivo en cajas",
              value: formatCurrency(totalEfectivoHoy),
              tone: "#8b5cf6",
            },
            {
              icon: <Clock3 size={18} />,
              label: "Total cajas",
              value: String(cajas.length),
              tone: "#f59e0b",
            },
          ].map(({ icon, label, value, tone }) => (
            <div
              key={label}
              style={{
                background: C.cardBg,
                borderRadius: 12,
                padding: "20px 22px",
                border: `1px solid ${C.cardBorder}`,
                boxShadow: C.cardShadow,
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: `${tone}18`,
                  color: tone,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {icon}
              </div>
              <div>
                <p
                  style={{
                    fontSize: 11,
                    color: C.mutedText,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    margin: "0 0 4px",
                  }}
                >
                  {label}
                </p>
                <p
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: C.bodyText,
                    margin: 0,
                  }}
                >
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── section header ───────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: C.mutedText,
                margin: "0 0 4px",
              }}
            >
              Operación
            </p>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: C.bodyText,
                margin: 0,
              }}
            >
              Estado de cajas
            </h2>
          </div>
          <Button onClick={() => setModal({ type: "crear" })}>
            <Plus size={16} />
            Nueva Caja
          </Button>
        </div>

        {/* ── cards grid ───────────────────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 20,
          }}
        >
          {cajas.map((caja) => (
            <CajaCard
              key={caja.id}
              caja={caja}
              onAbrir={(c) => setModal({ type: "abrir", caja: c })}
              onCerrar={(c) => setModal({ type: "cerrar", caja: c })}
            />
          ))}
          {!loading && cajas.length === 0 && (
            <div
              style={{
                gridColumn: "1 / -1",
                padding: "48px",
                textAlign: "center",
                background: C.cardBg,
                borderRadius: 16,
                border: `1px dashed ${C.cardBorder}`,
                color: C.mutedText,
                fontSize: 14,
              }}
            >
              No hay cajas registradas para esta sucursal.
            </div>
          )}
        </div>
      </div>

      {/* ── modals ───────────────────────────────────────────────────────── */}
      {modal?.type === "abrir" && (
        <AbrirTurnoModal
          caja={modal.caja}
          branchId={selectedBranchId}
          onConfirm={handleConfirmAbrir}
          onClose={() => setModal(null)}
          loading={loading}
        />
      )}

      {modal?.type === "cerrar" && (
        <CerrarTurnoModal
          caja={modal.caja}
          onConfirm={(payload) =>
            handleConfirmCerrar({ ...payload, cajaId: modal.caja.id })
          }
          onClose={() => setModal(null)}
          loading={loading}
        />
      )}

      {modal?.type === "crear" && (
        <CrearCajaModal
          onConfirm={handleConfirmCrear}
          onClose={() => setModal(null)}
          loading={loading}
        />
      )}
    </main>
  );
}
