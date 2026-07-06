import { Store } from "lucide-react";

import { ERP_COLORS as C } from "@/constants/theme";

export interface Sucursal {
  id: string;
  name: string;
  address?: string | null;
}

export interface SucursalPanelProps {
  role: "origen" | "destino";
  sucursales: Sucursal[];
  selectedId: string;
  onSelect: (id: string) => void;
  disabledId?: string;
}

export function SucursalPanel({
  role,
  sucursales,
  selectedId,
  onSelect,
  disabledId,
}: SucursalPanelProps) {
  const selected = sucursales.find((s) => s.id === selectedId);
  const isOrigen = role === "origen";

  return (
    <div
      style={{
        flex: 1,
        background: C.cardBg,
        border: `1px solid ${C.cardBorder}`,
        borderRadius: 16,
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Store size={16} color={C.mutedText} />
        <p
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: C.mutedText,
            margin: 0,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {isOrigen ? "Sucursal Origen" : "Sucursal Destino"}
        </p>
      </div>

      <select
        value={selectedId}
        onChange={(e) => onSelect(e.target.value)}
        style={{
          width: "100%",
          padding: "10px 14px",
          borderRadius: 8,
          border: `1px solid ${C.cardBorder}`,
          fontSize: 14,
          color: C.bodyText,
          background: C.pageBg,
          outline: "none",
          cursor: "pointer",
        }}
      >
        <option value="">Seleccionar sucursal…</option>
        {sucursales.map((s) => (
          <option key={s.id} value={s.id} disabled={s.id === disabledId}>
            {s.name}
          </option>
        ))}
      </select>

      {selected ? (
        <div style={{ marginTop: "auto" }}>
          <p
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: C.bodyText,
              margin: "0 0 4px",
            }}
          >
            {selected.name}
          </p>
          {selected.address && (
            <p style={{ fontSize: 13, color: C.mutedText, margin: 0 }}>
              {selected.address}
            </p>
          )}
        </div>
      ) : (
        <div style={{ marginTop: "auto" }}>
          <p
            style={{
              fontSize: 13,
              color: C.mutedText,
              margin: 0,
              fontStyle: "italic",
            }}
          >
            Selecciona una sucursal
          </p>
        </div>
      )}
    </div>
  );
}
