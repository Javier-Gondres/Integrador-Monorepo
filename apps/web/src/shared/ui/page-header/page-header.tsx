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
      }}
      className="px-4 py-4 sm:px-6 sm:py-5 md:px-10"
    >
      <p
        style={{ color: C.mutedText, marginBottom: "4px" }}
        className="text-[13px]"
      >
        Panel / <span style={{ color: C.primary }}>{breadcrumb}</span>
      </p>
      <h1
        style={{ color: C.bodyText, margin: 0 }}
        className="text-xl sm:text-2xl font-bold"
      >
        {title}
      </h1>
    </div>
  );
}
