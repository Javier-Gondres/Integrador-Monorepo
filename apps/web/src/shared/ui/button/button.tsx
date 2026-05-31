import { ERP_COLORS as C } from "@/constants/theme";

type ButtonVariant = "primary" | "secondary" | "ghost" | "icon";
type ButtonSize = "sm" | "md";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: { height: "32px", padding: "0 12px", fontSize: "13px" },
  md: { height: "40px", padding: "0 20px", fontSize: "14px" },
};

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    backgroundColor: C.primary,
    border: "none",
    color: "#fff",
    fontWeight: 600,
  },
  secondary: {
    backgroundColor: C.cardBg,
    border: `1px solid ${C.cardBorder}`,
    color: C.headText,
    fontWeight: 600,
  },
  ghost: {
    backgroundColor: "transparent",
    border: "none",
    color: C.headText,
    fontWeight: 500,
  },
  icon: {
    width: "40px",
    height: "40px",
    padding: 0,
    backgroundColor: C.cardBg,
    border: `1px solid ${C.cardBorder}`,
    color: C.headText,
  },
};

export function Button({
  variant = "primary",
  size = "md",
  style,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        borderRadius: variant === "icon" ? "8px" : "8px",
        cursor: props.disabled ? "not-allowed" : "pointer",
        opacity: props.disabled ? 0.7 : 1,
        ...sizeStyles[variant === "icon" ? "md" : size],
        ...variantStyles[variant],
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}
