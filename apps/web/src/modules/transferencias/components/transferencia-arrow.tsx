import { ArrowRight } from "lucide-react";

import { ERP_COLORS as C } from "@/constants/theme";

export function TransferenciaArrow() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: C.pageBg,
        borderTop: `1px solid ${C.cardBorder}`,
        borderBottom: `1px solid ${C.cardBorder}`,
        padding: "0 18px",
        gap: 6,
        minWidth: 72,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: C.cardBg,
          border: `1px solid ${C.cardBorder}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ArrowRight size={16} color={C.mutedText} />
      </div>
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: C.mutedText,
        }}
      >
        Mover
      </span>
    </div>
  );
}
