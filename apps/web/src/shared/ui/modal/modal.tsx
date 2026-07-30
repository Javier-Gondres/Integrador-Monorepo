import { X } from "lucide-react";

import { ERP_COLORS as C } from "@/constants/theme";

interface ModalProps {
  title: string;
  description: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({
  title,
  description,
  onClose,
  children,
  maxWidth = "480px",
}: ModalProps) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: "16px",
      }}
    >
      <div
        style={{
          backgroundColor: C.cardBg,
          width: "100%",
          maxWidth,
          borderRadius: "12px",
          border: `1px solid ${C.cardBorder}`,
          boxShadow: "0 20px 60px rgba(0,0,0,.15)",
          display: "flex",
          flexDirection: "column",
          maxHeight: "90vh",
          overflow: "hidden",
          margin: "auto 8px",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: `1px solid ${C.divider}`,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div>
            <h3
              style={{
                margin: "0 0 4px",
                fontSize: "17px",
                fontWeight: 700,
                color: C.bodyText,
              }}
            >
              {title}
            </h3>
            <p style={{ margin: 0, fontSize: "13px", color: C.headText }}>
              {description}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: "30px",
              height: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "6px",
              border: "none",
              backgroundColor: "transparent",
              color: C.headText,
              cursor: "pointer",
            }}
          >
            <X style={{ width: "16px", height: "16px" }} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
