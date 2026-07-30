"use client";

import {
  ChevronDown,
  ChevronRight,
  Grid2x2,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  DASHBOARD_NAV_ITEMS,
  filterNavItems,
  isNavSection,
  type NavLink,
} from "@/config/nav";
import { useAuth, usePermissions } from "@/modules/auth";

import { isNavLinkActive } from "./is-nav-link-active";

interface GroupedNavSection {
  title: string;
  links: NavLink[];
}

export function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { can, isSuperAdmin } = usePermissions();
  const [isOpen, setIsOpen] = useState(false);

  // Grouped items state for accordion collapse/expand
  const [collapsedSections, setCollapsedSections] = useState<
    Record<string, boolean>
  >({});

  // Close sidebar on route change in mobile
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const { groupedSections, navHrefs } = useMemo(() => {
    const items = filterNavItems(DASHBOARD_NAV_ITEMS, {
      can,
      isSuperAdmin,
      roleName: user?.role?.name,
      hasTenant: Boolean(user?.companyId),
      companySlug: user?.companySlug ?? null,
    });

    const groups: GroupedNavSection[] = [];
    let currentGroup: GroupedNavSection | null = null;
    const hrefs: string[] = [];

    items.forEach((item) => {
      if (isNavSection(item)) {
        if (currentGroup) {
          groups.push(currentGroup);
        }
        currentGroup = { title: item.section, links: [] };
      } else if (currentGroup) {
        currentGroup.links.push(item);
        hrefs.push(item.href);
      }
    });

    if (currentGroup) {
      groups.push(currentGroup);
    }

    return { groupedSections: groups, navHrefs: hrefs };
  }, [can, isSuperAdmin, user?.role?.name, user?.companyId, user?.companySlug]);

  // Keep section expanded if active route is inside it, without infinite re-render loop
  useEffect(() => {
    setCollapsedSections((prev) => {
      let changed = false;
      const next = { ...prev };

      groupedSections.forEach((section) => {
        const hasActiveChild = section.links.some((link) =>
          isNavLinkActive(pathname, link.href, navHrefs),
        );
        if (hasActiveChild && prev[section.title] === true) {
          next[section.title] = false;
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [pathname, groupedSections, navHrefs]);

  const toggleSection = (title: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const fullName = user ? `${user.firstName} ${user.lastName}` : "Usuario";

  const renderNav = (isMobile = false) => (
    <div className="flex flex-col h-full w-full">
      {/* Header Logo */}
      <div className="sidebar-logo flex items-center justify-between p-4 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="sidebar-logo-icon">
            <Grid2x2 size={16} color="#fff" />
          </div>
          <div>
            <p className="sidebar-logo-name text-white font-bold text-sm">
              Mi ERP
            </p>
            <p className="sidebar-logo-sub text-xs text-slate-400">
              Bienvenido al ERP
            </p>
          </div>
        </div>
        {isMobile && (
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav list with Scrollbar in PC and Mobile */}
      <nav className="sidebar-nav flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
        {groupedSections.map((group) => {
          const isCollapsed = collapsedSections[group.title] ?? false;
          const hasActiveChild = group.links.some((link) =>
            isNavLinkActive(pathname, link.href, navHrefs),
          );

          return (
            <div key={group.title} className="space-y-1">
              <button
                type="button"
                onClick={() => toggleSection(group.title)}
                className={`w-full flex items-center justify-between px-3 py-2 text-[11px] font-bold tracking-wider uppercase rounded-lg transition-colors ${
                  hasActiveChild
                    ? "text-indigo-400 bg-slate-800/40"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
                }`}
              >
                <span>{group.title}</span>
                {isCollapsed ? (
                  <ChevronRight size={14} className="shrink-0" />
                ) : (
                  <ChevronDown size={14} className="shrink-0" />
                )}
              </button>

              {!isCollapsed && (
                <div className="pl-1 space-y-1">
                  {group.links.map((link) => {
                    const Icon = link.icon;
                    const active = isNavLinkActive(
                      pathname,
                      link.href,
                      navHrefs,
                    );

                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                          active
                            ? "bg-indigo-600/30 text-white border border-indigo-500/30 shadow-sm"
                            : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                        }`}
                        onClick={() => isMobile && setIsOpen(false)}
                      >
                        <Icon size={18} className="shrink-0" />
                        <span className="truncate">{link.label}</span>
                        {active && (
                          <span className="ml-auto w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User & Logout section */}
      <div className="sidebar-bottom p-3 border-t border-slate-800 space-y-2 mt-auto shrink-0">
        <div className="user-card flex items-center gap-3 p-2 rounded-xl bg-slate-800/40">
          <div className="avatar w-8 h-8 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0">
            AD
          </div>
          <div className="min-w-0 flex-1">
            <p className="user-name text-white font-bold text-xs truncate">
              {fullName}
            </p>
            <p className="user-role text-[11px] text-slate-400 truncate">
              {user?.role ? user.role.name : "Rol"}
            </p>
          </div>
        </div>
        <button
          className="logout-btn flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
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
      {/* Top Mobile Bar */}
      <div className="flex md:hidden items-center justify-between bg-slate-900 px-4 py-3 border-b border-slate-800 text-white w-full sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="sidebar-logo-icon !w-7 !h-7 !rounded-lg">
            <Grid2x2 size={14} color="#fff" />
          </div>
          <span className="font-bold text-sm">Mi ERP</span>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile Drawer Overlay (Slide from Left) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          <aside className="relative flex flex-col w-72 max-w-[85vw] h-full bg-slate-900 text-slate-200 z-10 overflow-hidden shadow-2xl animate-in slide-in-from-left duration-200">
            {renderNav(true)}
          </aside>
        </div>
      )}

      {/* Desktop Sidebar with Scroll */}
      <aside className="sidebar hidden md:flex min-w-[260px] w-[260px] max-h-screen h-screen bg-slate-900 text-slate-200 border-r border-slate-800 sticky top-0 overflow-hidden">
        {renderNav(false)}
      </aside>
    </>
  );
}
