import { Check, X } from "lucide-react";

import { ERP_COLORS as C } from "@/constants/theme";

interface StatusToggleProps {
  isActive: boolean;
  onToggle: () => void;
}

export function StatusToggle({ isActive, onToggle }: StatusToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "4px 12px",
        borderRadius: "9999px",
        fontSize: "12px",
        fontWeight: 500,
        cursor: "pointer",
        border: `1px solid ${isActive ? C.greenBorder : C.grayBorder}`,
        backgroundColor: isActive ? C.greenBg : C.grayBg,
        color: isActive ? C.greenText : C.grayText,
      }}
      title={isActive ? "Click para desactivar" : "Click para activar"}
    >
      {isActive ? (
        <>
          <Check style={{ width: "11px", height: "11px", strokeWidth: 3 }} />
          Activo
        </>
      ) : (
        <>
          <X style={{ width: "11px", height: "11px", strokeWidth: 3 }} />
          Inactivo
        </>
      )}
    </button>
  );
}
