import {
  Permission,
  type PermissionCode,
  TenantRole,
  type TenantRoleName,
} from "@repo/shared";
import {
  ArrowLeftRight,
  Box,
  Building2,
  ClipboardEdit,
  History,
  LayoutDashboard,
  type LucideIcon,
  MapPin,
  PackageSearch,
  Percent,
  ReceiptText,
  RotateCcw,
  ShelvingUnit,
  Shield,
  ShoppingCart,
  Tag,
  Trash2,
  Truck,
  UserCog,
  Users,
} from "lucide-react";

/**
 * Reglas de acceso para ítems de navegación tenant.
 *
 * - `permission`: RBAC empresarial vía JWT (`can()`). `isSuperAdmin` NO hace bypass.
 * - `role`: pantallas de administración de empresa (equivalente a `@RequireCompanyOwnerOrPlatformAdmin`).
 *   Super Admin sí ve estos ítems (paridad con el API).
 * - `platform`: rutas `/platform/*` — solo Super Admin (`isSuperAdmin`).
 * - `public`: visible para cualquier usuario autenticado con tenant activo.
 */
export type NavAccess =
  | { type: "public" }
  | { type: "permission"; permission: PermissionCode }
  | { type: "role"; role: TenantRoleName }
  | { type: "platform" };

export type NavSection = {
  section: string;
};

export type NavLink = {
  label: string;
  href: string;
  icon: LucideIcon;
  access: NavAccess;
  /** Si true, `href` puede contener `[slug]` y se sustituye con `companySlug`. */
  dynamicSlug?: boolean;
};

export type NavItem = NavSection | NavLink;

export type NavFilterContext = {
  can: (permission: PermissionCode) => boolean;
  isSuperAdmin: boolean;
  roleName: string | null | undefined;
  /** Usuario con membresía tenant (`companyId` en JWT). */
  hasTenant: boolean;
  companySlug?: string | null;
};

export type DashboardQuickLink = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  tone: "blue" | "emerald" | "violet" | "amber";
  access: NavAccess;
};

export const DASHBOARD_NAV_ITEMS: NavItem[] = [
  { section: "General" },
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    access: { type: "public" },
  },
  { section: "Catálogo" },
  {
    label: "Productos",
    icon: Box,
    href: "/products",
    access: { type: "permission", permission: Permission.PRODUCTS_READ },
  },
  {
    label: "Clientes",
    icon: Users,
    href: "/customers",
    access: { type: "permission", permission: Permission.CUSTOMERS_READ },
  },
  {
    label: "Categorías",
    icon: Tag,
    href: "/categories",
    access: { type: "permission", permission: Permission.CATEGORIES_READ },
  },
  {
    label: "Descuentos",
    icon: Percent,
    href: "/discounts",
    access: { type: "permission", permission: Permission.DISCOUNTS_READ },
  },
  { section: "Inventarios" },
  {
    label: "Stock",
    icon: ShelvingUnit,
    href: "/inventories",
    access: { type: "permission", permission: Permission.INVENTORY_READ },
  },
  {
    label: "Transferencias",
    icon: ArrowLeftRight,
    href: "/transferencias",
    access: { type: "permission", permission: Permission.INVENTORY_READ },
  },
  {
    label: "Mermas",
    icon: Trash2,
    href: "/mermas",
    access: { type: "permission", permission: Permission.INVENTORY_READ },
  },
  {
    label: "Movimientos",
    icon: History,
    href: "/inventory-movements",
    access: { type: "permission", permission: Permission.INVENTORY_READ },
  },
  {
    label: "Ajustes",
    icon: ClipboardEdit,
    href: "/inventory-adjustments",
    access: { type: "permission", permission: Permission.INVENTORY_READ },
  },
  { section: "Operación" },
  {
    label: "Cajas",
    icon: LayoutDashboard,
    href: "/cajas",
    access: { type: "permission", permission: Permission.CASH_READ },
  },
  {
    label: "Devoluciones",
    icon: RotateCcw,
    href: "/returns",
    access: { type: "permission", permission: Permission.SALES_READ },
  },
  { section: "Compras" },
  {
    label: "Historial de compras",
    icon: ReceiptText,
    href: "/purchase-history",
    access: { type: "permission", permission: Permission.PURCHASES_READ },
  },
  {
    label: "Órdenes de compra",
    icon: ShoppingCart,
    href: "/purchase-orders",
    access: { type: "permission", permission: Permission.PURCHASES_CREATE },
  },
  { section: "Recursos" },
  {
    label: "Empleados",
    icon: Users,
    href: "/employees",
    access: { type: "permission", permission: Permission.EMPLOYEES_READ },
  },
  {
    label: "Proveedores",
    icon: Truck,
    href: "/suppliers",
    access: { type: "permission", permission: Permission.SUPPLIERS_READ },
  },
  {
    label: "Catálogo de proveedores",
    icon: PackageSearch,
    href: "/supplier-catalog",
    access: { type: "permission", permission: Permission.SUPPLIERS_READ },
  },
  { section: "Administración" },
  {
    label: "Usuarios",
    icon: UserCog,
    href: "/users",
    access: { type: "permission", permission: Permission.USERS_READ },
  },
  {
    label: "Empresa",
    icon: Building2,
    href: "/companies",
    access: { type: "role", role: TenantRole.OWNER },
  },
  {
    label: "Sucursales",
    icon: MapPin,
    href: "/companies/[slug]/branch",
    dynamicSlug: true,
    access: { type: "permission", permission: Permission.BRANCHES_READ },
  },
  { section: "Plataforma" },
  {
    label: "Admin SaaS",
    icon: Shield,
    href: "/platform/dashboard",
    access: { type: "platform" },
  },
];

export const DASHBOARD_QUICK_LINKS: DashboardQuickLink[] = [
  {
    title: "Productos",
    description: "Registra tu catálogo y prepara la base operativa del ERP.",
    href: "/products",
    icon: Box,
    tone: "blue",
    access: { type: "permission", permission: Permission.PRODUCTS_READ },
  },
  {
    title: "Categorías",
    description:
      "Organiza los productos por familias y estructura el catálogo.",
    href: "/categories",
    icon: Tag,
    tone: "emerald",
    access: { type: "permission", permission: Permission.CATEGORIES_READ },
  },
  {
    title: "Empleados",
    description: "Da de alta al equipo que va a operar el sistema.",
    href: "/employees",
    icon: Users,
    tone: "violet",
    access: { type: "permission", permission: Permission.EMPLOYEES_READ },
  },
  {
    title: "Proveedores",
    description: "Centraliza los contactos que abastecen la operación.",
    href: "/suppliers",
    icon: Truck,
    tone: "amber",
    access: { type: "permission", permission: Permission.SUPPLIERS_READ },
  },
  {
    title: "Stock",
    description: "Asigna productos a las diferentes sucursales de la empresa.",
    href: "/inventories",
    icon: ShelvingUnit,
    tone: "blue",
    access: { type: "permission", permission: Permission.INVENTORY_READ },
  },
  {
    title: "Movimientos de inventario",
    description: "Consulta el historial de los inventarios.",
    href: "/inventory-movements",
    icon: History,
    tone: "emerald",
    access: { type: "permission", permission: Permission.INVENTORY_READ },
  },
];

export function isNavSection(item: NavItem): item is NavSection {
  return "section" in item;
}

export function canAccessNav(
  access: NavAccess,
  ctx: NavFilterContext,
): boolean {
  if (access.type === "platform") {
    return ctx.isSuperAdmin;
  }

  if (!ctx.hasTenant) {
    return false;
  }

  switch (access.type) {
    case "public":
      return true;
    case "permission":
      return ctx.can(access.permission);
    case "role":
      return ctx.roleName === access.role || ctx.isSuperAdmin;
    default:
      return false;
  }
}

function resolveNavHref(link: NavLink, ctx: NavFilterContext): string | null {
  if (link.dynamicSlug) {
    if (!ctx.companySlug) {
      return null;
    }
    return link.href.replace("[slug]", ctx.companySlug);
  }

  return link.href;
}

/** Filtra ítems de sidebar y elimina secciones vacías. */
export function filterNavItems(
  items: NavItem[],
  ctx: NavFilterContext,
): NavItem[] {
  const result: NavItem[] = [];
  let index = 0;

  while (index < items.length) {
    const item = items[index];
    if (!item) {
      index++;
      continue;
    }

    if (isNavSection(item)) {
      const visibleLinks: NavLink[] = [];
      index++;

      while (index < items.length && !isNavSection(items[index]!)) {
        const link = items[index] as NavLink;
        if (canAccessNav(link.access, ctx)) {
          const href = resolveNavHref(link, ctx);
          if (href) {
            visibleLinks.push({ ...link, href });
          }
        }
        index++;
      }

      if (visibleLinks.length > 0) {
        result.push(item);
        result.push(...visibleLinks);
      }

      continue;
    }

    const link = item;
    if (canAccessNav(link.access, ctx)) {
      const href = resolveNavHref(link, ctx);
      if (href) {
        result.push({ ...link, href });
      }
    }
    index++;
  }

  return result;
}

export function filterQuickLinks(
  links: DashboardQuickLink[],
  ctx: NavFilterContext,
): DashboardQuickLink[] {
  return links.filter((link) => canAccessNav(link.access, ctx));
}
