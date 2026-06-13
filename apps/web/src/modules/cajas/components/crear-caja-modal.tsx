"use client";

import { LayoutGrid, X } from "lucide-react";
import { useState } from "react";

import { ERP_COLORS as C } from "@/constants/theme";
import { Button } from "@/shared/ui/button";

interface Props {
  onConfirm: (name: string) => void;
  onClose: () => void;
  loading?: boolean;
}

export function CrearCajaModal({ onConfirm, onClose, loading }: Props) {
  const [name, setName] = useState("");
  const canSubmit = name.trim().length > 0 && !loading;

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
          maxWidth: 420,
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
              Configuración
            </p>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: C.bodyText,
                margin: 0,
              }}
            >
              Crear Nueva Caja
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
        <div style={{ padding: "24px 28px" }}>
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
              <LayoutGrid size={15} />
              Nombre de la caja
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
              placeholder="Ej. Caja Principal, Caja 02..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
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
          <Button
            onClick={() => canSubmit && onConfirm(name.trim())}
            disabled={!canSubmit}
          >
            {loading ? "Creando…" : "Crear Caja"}
          </Button>
        </div>
      </div>
    </div>
  );
}
