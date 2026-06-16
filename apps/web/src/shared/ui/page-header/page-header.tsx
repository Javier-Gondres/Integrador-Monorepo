import { ERP_COLORS as C } from "@/constants/theme";

interface PageHeaderProps {
  breadcrumb: string;
  title: string;
}

export function PageHeader({ breadcrumb, title }: PageHeaderProps) {
  return (
    <div
      className="py-4 px-5 md:py-5 md:px-10"
      style={{
        backgroundColor: C.cardBg,
        borderBottom: `1px solid ${C.cardBorder}`,
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
