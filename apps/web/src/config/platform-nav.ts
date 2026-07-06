import { Building2, LayoutDashboard } from "lucide-react";

export const PLATFORM_NAV_ITEMS = [
  {
    label: "Panel plataforma",
    href: "/platform/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Empresas",
    href: "/platform/companies",
    icon: Building2,
  },
] as const;

export const TENANT_NAV_LINK = {
  label: "ERP tenant",
  href: "/dashboard",
  icon: LayoutDashboard,
} as const;
