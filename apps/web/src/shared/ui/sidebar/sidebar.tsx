"use client";

import {
  Box,
  ClipboardEdit,
  Grid2x2,
  History,
  LayoutDashboard,
  LogOut,
  PackageSearch,
  Percent,
  ReceiptText,
  RotateCcw,
  ShelvingUnit,
  ShoppingCart,
  Tag,
  Truck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/modules/auth";

const navItems = [
  { section: "General" },
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { section: "Operación" },
  { label: "Facturación", icon: ShoppingCart, href: "/sales" },
  { label: "Cajas", icon: LayoutDashboard, href: "/cajas" },
  { label: "Devoluciones", icon: RotateCcw, href: "/returns" },
  { section: "Catálogo" },
  { label: "Productos", icon: Box, href: "/products" },
  { label: "Clientes", icon: Users, href: "/customers" },
  { label: "Categorías", icon: Tag, href: "/categories" },
  { label: "Descuentos", icon: Percent, href: "/discounts" },
  { section: "Inventarios" },
  { label: "Stock", icon: ShelvingUnit, href: "/inventories" },
  { label: "Movimientos", icon: History, href: "/inventory-movements" },
  {
    label: "Ajustes",
    icon: ClipboardEdit,
    href: "/inventory-adjustments",
  },
  { section: "Finanzas" },
  {
    label: "Cuentas por Cobrar",
    icon: ReceiptText,
    href: "/accounts-receivable",
  },
  { label: "Compras", icon: ReceiptText, href: "/purchase-history" },
  { section: "Recursos" },
  { label: "Empleados", icon: Users, href: "/employees" },
  { label: "Proveedores", icon: Truck, href: "/suppliers" },
  {
    label: "Catálogo Proveedores",
    icon: PackageSearch,
    href: "/supplier-catalog",
  },
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
