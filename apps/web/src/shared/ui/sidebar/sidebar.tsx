"use client";

import { Grid2x2, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

import {
  DASHBOARD_NAV_ITEMS,
  filterNavItems,
  isNavSection,
} from "@/config/nav";
import { useAuth, usePermissions } from "@/modules/auth";

export function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { can, isSuperAdmin } = usePermissions();

  const navItems = useMemo(
    () =>
      filterNavItems(DASHBOARD_NAV_ITEMS, {
        can,
        isSuperAdmin,
        roleName: user?.role?.name,
        hasTenant: Boolean(user?.companyId),
        companySlug: user?.companySlug ?? null,
      }),
    [can, isSuperAdmin, user?.role?.name, user?.companyId, user?.companySlug],
  );

  const fullName = user ? `${user.firstName} ${user.lastName}` : "Usuario";

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Grid2x2 size={16} color="#fff" />
        </div>
        <div>
          <p className="sidebar-logo-name">Mi ERP</p>
          <p className="sidebar-logo-sub">Bienvenido al ERP</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item, i) => {
          if (isNavSection(item)) {
            return (
              <p key={`section-${item.section}-${i}`} className="sidebar-section">
                {item.section}
              </p>
            );
          }

          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item${active ? " active" : ""}`}
            >
              <Icon size={16} />
              <span>{item.label}</span>
              {active && <span className="active-dot" />}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <div className="user-card">
          <div className="avatar">AD</div>
          <div>
            <p className="user-name">{fullName}</p>
            <p className="user-role">{user?.role ? user.role.name : "Rol"}</p>
          </div>
        </div>
        <button className="logout-btn" onClick={() => logout()}>
          <LogOut size={14} />
          <span>Cerrar Sesión</span>
        </button>
        <p className="sb-footer"></p>
      </div>
    </aside>
  );
}
