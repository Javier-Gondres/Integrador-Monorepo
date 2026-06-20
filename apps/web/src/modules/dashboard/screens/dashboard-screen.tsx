import {
  ArrowRight,
  CircleCheckBig,
  History,
  Package,
  PackageSearch,
  ReceiptText,
  ShelvingUnit,
  Tag,
  Truck,
  Users,
} from "lucide-react";
import Link from "next/link";

import styles from "./dashboard-screen.module.css";

const availableModules = [
  {
    title: "Productos",
    description: "Registra tu catálogo y prepara la base operativa del ERP.",
    href: "/products",
    icon: Package,
    tone: "blue",
  },
  {
    title: "Categorías",
    description:
      "Organiza los productos por familias y estructura el catálogo.",
    href: "/categories",
    icon: Tag,
    tone: "emerald",
  },
  {
    title: "Empleados",
    description: "Da de alta al equipo que va a operar el sistema.",
    href: "/employees",
    icon: Users,
    tone: "violet",
  },
  {
    title: "Proveedores",
    description: "Centraliza los contactos que abastecen la operación.",
    href: "/suppliers",
    icon: Truck,
    tone: "amber",
  },
  {
    title: "Catálogo de Proveedores",
    description: "Registra los suministros de los diferentes suplidores.",
    href: "/supplier-catalog",
    icon: PackageSearch,
    tone: "amber",
  },
  {
    title: "Stock",
    description: "Asigna productos a las diferentes sucursales de la empresa",
    href: "/inventories",
    icon: ShelvingUnit,
    tone: "red",
  },
  {
    title: "Movimientos de inventario",
    description: "Consulta el historial de los inventarios",
    href: "/inventories",
    icon: History,
    tone: "red",
  },
  {
    title: "Compras",
    description: "Realiza ordenes de compra y consulta compras recientes",
    href: "/purchase-history",
    icon: ReceiptText,
    tone: "red",
  },
  {
    title: "Ajustes de inventario",
    description: "corrige los numeros de los inventarios según los conteos",
    href: "/inventory-adjustments",
    icon: ReceiptText,
    tone: "red",
  },
];

export function DashboardScreen() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>Inicio / Dashboard</p>
          <h1 className={styles.title}>Punto de entrada del ERP</h1>
          <p className={styles.description}>
            Desde aquí puedes navegar a los módulos principales para registrar y
            administrar tu negocio.
          </p>

          <div className={styles.heroActions}>
            <Link href="/products" className={styles.primaryAction}>
              Abrir productos
              <ArrowRight size={16} />
            </Link>
            <Link href="/categories" className={styles.secondaryAction}>
              Revisar categorías
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionKicker}>Atajo rápido</p>
            <h2 className={styles.sectionTitle}>
              Accesos directos al catálogo
            </h2>
          </div>
        </div>

        <div className={styles.quickGrid}>
          {availableModules.map((module) => {
            const Icon = module.icon;

            return (
              <Link
                key={module.title}
                href={module.href}
                className={styles.quickCard}
              >
                <span className={styles.quickIcon}>
                  <Icon size={16} />
                </span>
                <span className={styles.quickText}>
                  <strong>{module.title}</strong>
                  <span>Ir al formulario de registro</span>
                </span>
                <CircleCheckBig size={16} className={styles.quickMark} />
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
