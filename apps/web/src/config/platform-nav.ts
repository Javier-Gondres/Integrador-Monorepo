import { Building2, KeyRound, LayoutDashboard, Users } from "lucide-react";

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
  {
    label: "Usuarios",
    href: "/platform/users",
    icon: Users,
  },
  {
    label: "Permisos",
    href: "/platform/permissions",
    icon: KeyRound,
  },
] as const;

export const TENANT_NAV_LINK = {
  label: "ERP tenant",
  href: "/dashboard",
  icon: LayoutDashboard,
} as const;
