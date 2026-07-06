"use client";

import { Grid2x2, LogOut, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

import { PLATFORM_NAV_ITEMS, TENANT_NAV_LINK } from "@/config/platform-nav";
import { useAuth, usePermissions } from "@/modules/auth";

import { isNavLinkActive } from "./is-nav-link-active";

type PlatformNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export function PlatformSidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { isSuperAdmin } = usePermissions();

  const { navItems, navHrefs } = useMemo(() => {
    const items: PlatformNavItem[] = [...PLATFORM_NAV_ITEMS];
    if (user?.companyId) {
      items.push(TENANT_NAV_LINK);
    }
    return {
      navItems: items,
      navHrefs: items.map((item) => item.href),
    };
  }, [user?.companyId]);

  const fullName = user ? `${user.firstName} ${user.lastName}` : "Super Admin";

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Grid2x2 size={16} color="#fff" />
        </div>
        <div>
          <p className="sidebar-logo-name">Mi ERP</p>
          <p className="sidebar-logo-sub">Plataforma SaaS</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <p className="sidebar-section">Administración</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isNavLinkActive(pathname, item.href, navHrefs);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item${active ? " active" : ""}`}
            >
              <Icon size={16} />
              <span>{item.label}</span>
              {active ? <span className="active-dot" /> : null}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <div className="user-card">
          <div className="avatar">SA</div>
          <div>
            <p className="user-name">{fullName}</p>
            <p className="user-role">
              {isSuperAdmin ? "Super Admin" : "Plataforma"}
            </p>
          </div>
        </div>
        <button className="logout-btn" onClick={() => logout()}>
          <LogOut size={14} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
