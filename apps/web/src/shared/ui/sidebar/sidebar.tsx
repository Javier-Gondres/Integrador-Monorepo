"use client";

import {
  Box,
  Grid2x2,
  LayoutDashboard,
  LogOut,
  Percent,
  Tag,
  Truck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/modules/auth";
import { getUserInitials } from "@/modules/profile/utils/profile-formatters";

const navItems = [
  { section: "General" },
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { section: "Catálogo" },
  { label: "Productos", icon: Box, href: "/products" },
  { label: "Clientes", icon: Users, href: "/customers" },
  { label: "Categorías", icon: Tag, href: "/categories" },
  { label: "Descuentos", icon: Percent, href: "/discounts" },
  { section: "Operación" },
  { label: "Cajas", icon: LayoutDashboard, href: "/cajas" },
  { section: "Recursos" },
  { label: "Empleados", icon: Users, href: "/employees" },
  { label: "Proveedores", icon: Truck, href: "/suppliers" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const fullName = user ? `${user.firstName} ${user.lastName}` : "Usuario";
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Grid2x2 size={16} color="#fff" />
        </div>
        <div>
          <p className="sidebar-logo-name">Mi ERP</p>
          <p className="sidebar-logo-sub">Bienvenido al ERP</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {navItems.map((item, i) => {
          if ("section" in item) {
            return (
              <p key={i} className="sidebar-section">
                {item.section}
              </p>
            );
          }
          const Icon = item.icon!;
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href!}
              className={`nav-item${active ? " active" : ""}`}
            >
              <Icon size={16} />
              <span>{item.label}</span>
              {active && <span className="active-dot" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="sidebar-bottom">
        <Link href="/profile" className="user-card">
          <div className="avatar">{user ? getUserInitials(user) : "?"}</div>
          <div>
            <p className="user-name">{fullName}</p>
            <p className="user-role">{user?.role ? user.role.name : "Rol"}</p>
          </div>
        </Link>
        <button className="logout-btn" onClick={() => logout()}>
          <LogOut size={14} />
          <span>Cerrar Sesión</span>
        </button>
        <p className="sb-footer"></p>
      </div>
    </aside>
  );
}
