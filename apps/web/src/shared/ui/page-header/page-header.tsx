import { ERP_COLORS as C } from "@/constants/theme";

interface PageHeaderProps {
  breadcrumb: string;
  title: string;
}

export function PageHeader({ breadcrumb, title }: PageHeaderProps) {
  return (
    <div
      style={{
        backgroundColor: C.cardBg,
        borderBottom: `1px solid ${C.cardBorder}`,
        padding: "20px 40px",
      }}
    >
      <p style={{ fontSize: "13px", color: C.mutedText, marginBottom: "4px" }}>
        Panel / <span style={{ color: C.primary }}>{breadcrumb}</span>
      </p>
      <h1
        style={{
          fontSize: "24px",
          fontWeight: 700,
          color: C.bodyText,
          margin: 0,
        }}
      >
        {title}
      </h1>
    </div>
  );
}
