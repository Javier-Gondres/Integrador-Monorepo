"use client";

import { Permission } from "@repo/shared";
import {
  Clock,
  History,
  Lock,
  PlayCircle,
  StopCircle,
  User,
} from "lucide-react";
import Link from "next/link";

import { ERP_COLORS as C } from "@/constants/theme";
import { Can } from "@/shared/ui/can";

import type { Caja } from "../types/caja.types";
import { formatCurrency, formatElapsed } from "../utils/format";

interface Props {
  caja: Caja;
  onAbrir: (caja: Caja) => void;
  onCerrar: (caja: Caja) => void;
}

export function CajaCard({ caja, onAbrir, onCerrar }: Props) {
  const turno = caja.turnoActivo;
  const abierta = !!turno;

  return (
    <div
      style={{
        background: C.cardBg,
        borderRadius: 16,
        border: `1px solid ${C.cardBorder}`,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxShadow: C.cardShadow,
        borderTop: `4px solid ${abierta ? C.greenText : C.grayBorder}`,
      }}
    >
      {/* header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          padding: "20px 20px 16px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: C.mutedText,
            }}
          >
            {abierta ? "Turno activo" : "Sin turno"}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h3
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: C.bodyText,
                margin: 0,
              }}
            >
              {caja.nombre}
            </h3>
            <Link
              href={`/cajas/${caja.id}`}
              title="Ver historial"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 26,
                  height: 26,
                  borderRadius: 6,
                  background: C.pageBg,
                  color: C.mutedText,
                  border: `1px solid ${C.cardBorder}`,
                  flexShrink: 0,
                }}
                className="hover:border-blue-400 hover:text-blue-500 transition-colors"
              >
                <History size={13} />
              </Link>
          </div>
          {caja.descripcion && (
            <p style={{ fontSize: 12, color: C.mutedText, margin: 0 }}>
              {caja.descripcion}
            </p>
          )}
        </div>

        {/* status pill */}
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "4px 10px",
            borderRadius: 99,
            fontSize: 11,
            fontWeight: 600,
            background: abierta ? C.greenBg : C.grayBg,
            color: abierta ? C.greenText : C.grayText,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: abierta ? C.greenText : C.grayBorder,
              display: "inline-block",
            }}
          />
          {abierta ? "Abierta" : "Cerrada"}
        </span>
      </div>

      {/* turno info */}
      {abierta && turno ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 14,
            padding: "0 20px 16px",
          }}
        >
          {[
            {
              icon: <User size={13} />,
              label: "Cajero",
              value: turno.empleadoNombre,
              accent: false,
            },
            {
              icon: <Clock size={13} />,
              label: "Tiempo abierto",
              value: formatElapsed(turno.fechaApertura),
              accent: false,
            },
            {
              icon: null,
              label: "Apertura",
              value: formatCurrency(turno.montoApertura),
              accent: false,
            },
            {
              icon: null,
              label: "Ventas",
              value: formatCurrency(turno.totalVentas),
              accent: true,
            },
            {
              icon: null,
              label: "Efectivo",
              value: formatCurrency(turno.totalEfectivo),
              accent: false,
            },
            {
              icon: null,
              label: "Tarjeta",
              value: formatCurrency(turno.totalTarjeta),
              accent: false,
            },
          ].map(({ icon, label, value, accent }) => (
            <div
              key={label}
              style={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11,
                  color: C.mutedText,
                  fontWeight: 500,
                }}
              >
                {icon}
                {label}
              </span>
              <span
                style={{
                  fontSize: accent ? 16 : 14,
                  fontWeight: accent ? 700 : 500,
                  color: accent ? C.greenText : C.bodyText,
                }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            padding: "28px 20px",
            textAlign: "center",
          }}
        >
          <Lock size={28} color={C.mutedText} />
          <p style={{ margin: 0, fontSize: 13, color: C.grayText }}>
            Esta caja no tiene turno activo.
            <br />
            Ábrela para comenzar a operar.
          </p>
        </div>
      )}

      {/* footer */}
      <Can permission={Permission.CASH_CLOSE}>
        {abierta ? (
          <div
            style={{
              borderTop: `1px solid ${C.divider}`,
              padding: "14px 20px",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <button
              onClick={() => onCerrar(caja)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "9px 18px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                border: `1px solid #fecaca`,
                cursor: "pointer",
                background: C.dangerBg,
                color: C.danger,
              }}
              className="hover:bg-red-100 transition-colors"
            >
              <StopCircle size={15} />
              Cerrar turno
            </button>
          </div>
        ) : null}
      </Can>

      <Can permission={Permission.CASH_OPEN}>
        {!abierta ? (
          <div
            style={{
              borderTop: `1px solid ${C.divider}`,
              padding: "14px 20px",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <button
              onClick={() => onAbrir(caja)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "9px 18px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                background: C.greenText,
                color: "#fff",
              }}
              className="hover:opacity-90 transition-opacity"
            >
              <PlayCircle size={15} />
              Abrir turno
            </button>
          </div>
        ) : null}
      </Can>
    </div>
  );
}
