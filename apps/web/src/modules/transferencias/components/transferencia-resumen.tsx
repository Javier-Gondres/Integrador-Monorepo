import { ArrowRight, Info } from "lucide-react";

import { ERP_COLORS as C } from "@/constants/theme";

import type { ItemEnCarrito } from "../types/transferencia.types";

interface Props {
  origenNombre: string;
  destinoNombre: string;
  items: ItemEnCarrito[];
}

export function TransferenciaResumen({
  origenNombre,
  destinoNombre,
  items,
}: Props) {
  return (
    <div
      style={{
        background: C.pageBg,
        border: `1px solid ${C.cardBorder}`,
        borderRadius: 12,
        padding: "14px 18px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <Info size={16} color={C.mutedText} style={{ flexShrink: 0 }} />
      <span
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: C.mutedText,
          flexShrink: 0,
        }}
      >
        Resumen:
      </span>

      <Chip label={origenNombre} />

      <ArrowRight size={14} color={C.mutedText} />

      <Chip
        label={`${items.length} producto${items.length !== 1 ? "s" : ""} (${items.reduce((a, b) => a + b.cantidad, 0)} items)`}
        accent
      />

      <ArrowRight size={14} color={C.mutedText} />

      <Chip label={destinoNombre} />
    </div>
  );
}

function Chip({ label, accent }: { label: string; accent?: boolean }) {
  return (
    <span
      style={{
        fontSize: 13,
        fontWeight: 600,
        padding: "4px 12px",
        borderRadius: 6,
        background: accent ? C.primary : "#fff",
        color: accent ? "#fff" : C.bodyText,
        border: `1px solid ${accent ? C.primary : C.cardBorder}`,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}
