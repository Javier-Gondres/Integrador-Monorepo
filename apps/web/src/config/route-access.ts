import { Permission, type PermissionCode } from "@repo/shared";

import {
  canAccessNav,
  DASHBOARD_NAV_ITEMS,
  isNavSection,
  type NavAccess,
  type NavFilterContext,
  type NavLink,
} from "./nav";

export type RouteAccessRule = {
  /** Patrón exacto o regex probado contra `pathname`. */
  match: string | RegExp;
  access: NavAccess;
};

/** Rutas adicionales no listadas en el sidebar. */
const EXTRA_ROUTE_RULES: RouteAccessRule[] = [
  {
    match: /^\/cajas(\/[^/]+)?$/,
    access: { type: "permission", permission: Permission.CASH_READ },
  },
  {
    match: /^\/companies\/[^/]+\/branch(\/.*)?$/,
    access: { type: "permission", permission: Permission.BRANCHES_READ },
  },
];

function navLinkToRule(link: NavLink): RouteAccessRule {
  if (link.dynamicSlug) {
    return {
      match: /^\/companies\/[^/]+\/branch(\/.*)?$/,
      access: link.access,
    };
  }

  return { match: link.href, access: link.access };
}

/** Reglas ordenadas: las más específicas (regex) primero, luego paths exactos. */
export const ROUTE_ACCESS_RULES: RouteAccessRule[] = [
  ...EXTRA_ROUTE_RULES,
  ...DASHBOARD_NAV_ITEMS.filter(
    (item): item is NavLink => !isNavSection(item) && !item.dynamicSlug,
  ).map(navLinkToRule),
];

function rulePriority(rule: RouteAccessRule): number {
  if (rule.match instanceof RegExp) {
    return 100 + rule.match.source.length;
  }
  return rule.match.length;
}

const SORTED_ROUTE_RULES = [...ROUTE_ACCESS_RULES].sort(
  (a, b) => rulePriority(b) - rulePriority(a),
);

export function resolveRouteAccess(pathname: string): NavAccess | null {
  for (const rule of SORTED_ROUTE_RULES) {
    if (typeof rule.match === "string") {
      if (pathname === rule.match || pathname.startsWith(`${rule.match}/`)) {
        return rule.access;
      }
      continue;
    }

    if (rule.match.test(pathname)) {
      return rule.access;
    }
  }

  return null;
}

export function canAccessRoute(
  pathname: string,
  ctx: NavFilterContext,
): boolean {
  if (pathname === "/dashboard") {
    return true;
  }

  const access = resolveRouteAccess(pathname);
  if (!access) {
    return true;
  }

  return canAccessNav(access, ctx);
}

export function getRequiredPermission(pathname: string): PermissionCode | null {
  const access = resolveRouteAccess(pathname);
  if (access?.type === "permission") {
    return access.permission;
  }
  return null;
}
