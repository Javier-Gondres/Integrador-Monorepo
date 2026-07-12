import React from "react";

import styles from "./dashboard-kpis.module.css";

interface KPIProps {
  title: string;
  value: number;
  subtitle?: string;
  colorType: "sales" | "receivables" | "payables";
  isLoading?: boolean;
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
  }).format(val);
};

export function KPICard({
  title,
  value,
  subtitle,
  colorType,
  isLoading,
}: KPIProps) {
  if (isLoading) {
    return (
      <div className={`${styles.card} ${styles.skeletonCard}`}>
        <div className={styles.skeletonTitle}></div>
        <div className={styles.skeletonValue}></div>
        <div className={styles.skeletonSubtitle}></div>
      </div>
    );
  }

  const themeClass = styles[colorType];

  return (
    <div className={`${styles.card} ${themeClass}`}>
      <div className={styles.cardHeader}>
        <span className={styles.title}>{title}</span>
        <div className={styles.iconWrapper}>
          {colorType === "sales" && (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className={styles.icon}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5h.007m-.008 11.25h.008M3.75 15.75a3 3 0 00-3-3H12a3 3 0 003 3V15.75m-15 0a3 3 0 013-3h12a3 3 0 013 3V15.75"
              />
            </svg>
          )}
          {colorType === "receivables" && (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className={styles.icon}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v12m-3-2.818l.879.879a3 3 0 004.243 0L17.25 10.5M3 12h18"
              />
            </svg>
          )}
          {colorType === "payables" && (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className={styles.icon}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          )}
        </div>
      </div>
      <div className={styles.value}>{formatCurrency(value)}</div>
      {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
    </div>
  );
}

interface KPIGridProps {
  data?: {
    salesToday: number;
    salesYesterday: number;
    receivablesBalance: number;
    payablesBalance: number;
  };
  isLoading: boolean;
}

export function KPIGrid({ data, isLoading }: KPIGridProps) {
  const salesDiff = data ? data.salesToday - data.salesYesterday : 0;
  const salesPercentStr =
    data && data.salesYesterday > 0
      ? `${salesDiff >= 0 ? "+" : ""}${((salesDiff / data.salesYesterday) * 100).toFixed(0)}% vs ayer`
      : "Sin ventas ayer";

  return (
    <div className={styles.grid}>
      <KPICard
        title="Ventas del Día"
        value={data?.salesToday ?? 0}
        subtitle={salesPercentStr}
        colorType="sales"
        isLoading={isLoading}
      />
      <KPICard
        title="Cuentas por Cobrar Pendientes"
        value={data?.receivablesBalance ?? 0}
        subtitle="Saldo pendiente total de clientes"
        colorType="receivables"
        isLoading={isLoading}
      />
      <KPICard
        title="Cuentas por Pagar Pendientes"
        value={data?.payablesBalance ?? 0}
        subtitle="Saldo pendiente a proveedores"
        colorType="payables"
        isLoading={isLoading}
      />
    </div>
  );
}
