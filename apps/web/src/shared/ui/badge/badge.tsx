import { ERP_COLORS as C } from "@/constants/theme";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "primary" | "success" | "muted" | "error" | "warning";
}

const variants = {
  default: { bg: C.grayBg, color: C.grayText, border: C.grayBorder },
  primary: { bg: "#EEF2FF", color: C.primary, border: "#C7D2FE" },
  success: { bg: C.greenBg, color: C.greenText, border: C.greenBorder },
  muted: { bg: C.tableHead, color: C.mutedText, border: C.divider },
  error: { bg: C.dangerBg, color: C.danger, border: "#FECACA" },
  warning: { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
};

export function Badge({ children, variant = "default" }: BadgeProps) {
  const v = variants[variant];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 8px",
        borderRadius: "6px",
        fontSize: "12px",
        fontWeight: 500,
        backgroundColor: v.bg,
        color: v.color,
        border: `1px solid ${v.border}`,
      }}
    >
      {children}
    </span>
  );
}
