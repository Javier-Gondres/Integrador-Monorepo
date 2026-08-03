"use client";

import { Grid2x2, LogOut, Menu, X, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { PLATFORM_NAV_ITEMS, TENANT_NAV_LINK } from "@/config/platform-nav";
import { useAuth, usePermissions } from "@/modules/auth";
import { getUserInitials } from "@/modules/profile/utils/profile-formatters";

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
  const [isOpen, setIsOpen] = useState(false);

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

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const renderNav = (isMobile = false) => (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div className="sidebar-logo flex shrink-0 items-center justify-between border-b border-slate-800 p-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="sidebar-logo-icon">
            <Grid2x2 size={16} color="#fff" />
          </div>
          <div className="min-w-0">
            <p className="sidebar-logo-name truncate text-sm font-bold text-white">
              Mi ERP
            </p>
            <p className="sidebar-logo-sub truncate text-xs text-slate-400">
              Plataforma SaaS
            </p>
          </div>
        </div>
        {isMobile ? (
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        ) : null}
      </div>

      <nav className="sidebar-nav scrollbar-thin flex-1 space-y-2 overflow-y-auto overscroll-contain p-3">
        <p className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Administración
        </p>
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isNavLinkActive(pathname, item.href, navHrefs);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-10 items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-all ${
                  active
                    ? "border border-indigo-500/30 bg-indigo-600/30 text-white shadow-sm"
                    : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                }`}
                onClick={() => isMobile && setIsOpen(false)}
              >
                <Icon size={18} className="shrink-0" />
                <span className="truncate">{item.label}</span>
                {active ? (
                  <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-indigo-400" />
                ) : null}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="sidebar-bottom mt-auto shrink-0 space-y-2 border-t border-slate-800 p-3">
        <div className="user-card flex items-center gap-3 rounded-xl bg-slate-800/40 p-2">
          <div className="avatar flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600/30 text-xs font-bold text-indigo-300">
            {user ? getUserInitials(user) : "SA"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="user-name truncate text-xs font-bold text-white">
              {fullName}
            </p>
            <p className="user-role truncate text-[11px] text-slate-400">
              {isSuperAdmin ? "Super Admin" : "Plataforma"}
            </p>
          </div>
        </div>
        <button
          className="logout-btn flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
          onClick={() => logout()}
        >
          <LogOut size={16} className="shrink-0" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="sticky top-0 z-40 flex w-full items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3 text-white lg:hidden">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="sidebar-logo-icon h-7! w-7! rounded-lg!">
            <Grid2x2 size={14} color="#fff" />
          </div>
          <span className="truncate text-sm font-bold">Mi ERP</span>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-expanded={isOpen}
          aria-controls="platform-mobile-sidebar"
          className="rounded-lg bg-slate-800 p-1.5 text-slate-200 transition-colors hover:bg-slate-700"
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          <aside
            id="platform-mobile-sidebar"
            className="relative z-10 flex h-dvh w-[min(20rem,88vw)] flex-col overflow-hidden bg-slate-900 text-slate-200 shadow-2xl animate-in slide-in-from-left duration-200"
          >
            {renderNav(true)}
          </aside>
        </div>
      ) : null}

      <aside className="sidebar sticky top-0 hidden h-dvh max-h-dvh w-65 min-w-65 overflow-hidden border-r border-slate-800 bg-slate-900 text-slate-200 lg:flex">
        {renderNav(false)}
      </aside>
    </>
  );
}
