"use client";

import React, { useState } from "react";
import { Permission } from "@repo/shared";

import { useBranches } from "@/modules/branches/hooks/use-branches";
import { Can } from "@/shared/ui/can";

import { DashboardCharts } from "../components/dashboard-charts";
import { KPIGrid } from "../components/dashboard-kpis";
import { DashboardQuickLinksSection } from "../components/dashboard-quick-links";
import { FinancialStatements } from "../components/financial-statements";
import { InventoryAlertsSection } from "../components/inventory-alerts-section";
import { RecentMovementsList } from "../components/recent-movements";
import { useDashboardSummary } from "../hooks/use-dashboard";
import styles from "./dashboard-screen.module.css";

interface BranchOption {
  id: string;
  name: string;
}

export function DashboardScreen() {
  const [selectedBranch, setSelectedBranch] = useState<string>("todas");
  const [filterMode, setFilterMode] = useState<"days" | "month">("days");
  const [selectedDays, setSelectedDays] = useState<number>(7);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  });

  const { data: branchesData } = useBranches();
  const {
    data: summaryData,
    isLoading,
    isFetching,
  } = useDashboardSummary(
    selectedBranch,
    filterMode === "days" ? selectedDays : 7,
    filterMode === "month" ? selectedMonth : undefined,
  );

  return (
    <main className={styles.page}>
      {/* 1. HERO SECTION WITH BRANCH FILTER */}
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>Inicio / Dashboard</p>
          <h1 className={styles.title}>Panel de Control Operativo</h1>
          <p className={styles.description}>
            Visualiza en tiempo real los indicadores clave del negocio, analiza
            la evolución de tus ingresos/gastos y haz seguimiento a las cuentas
            pendientes.
          </p>

          <div className={styles.filterSection}>
            <div className={styles.selectWrapper}>
              <label htmlFor="branch-select" className={styles.selectLabel}>
                Sucursal:
              </label>
              <select
                id="branch-select"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className={styles.select}
              >
                <option value="todas">Todas las Sucursales</option>
                {branchesData?.map((branch: BranchOption) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-[20px] px-4 py-2.5 shadow-sm text-sm">
              <span className="text-slate-500 font-semibold">Período:</span>
              <select
                value={filterMode}
                onChange={(e) =>
                  setFilterMode(e.target.value as "days" | "month")
                }
                className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="days">Días recientes</option>
                <option value="month">Mes específico</option>
              </select>

              {filterMode === "days" ? (
                <select
                  value={selectedDays}
                  onChange={(e) => setSelectedDays(Number(e.target.value))}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1 font-semibold text-slate-700 cursor-pointer focus:outline-none"
                >
                  <option value={7}>Últimos 7 días</option>
                  <option value={30}>Últimos 30 días</option>
                  <option value={90}>Últimos 90 días</option>
                  <option value={0}>Todo el histórico</option>
                </select>
              ) : (
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1 font-semibold text-slate-700 cursor-pointer focus:outline-none"
                />
              )}
            </div>

            {isFetching && (
              <span className={styles.syncing}>Actualizando...</span>
            )}
          </div>
        </div>
      </section>

      {/* 2. ANALYTICS CONTENT AREA */}
      <div className={styles.analyticsSection}>
        {/* Financial Statements */}
        <FinancialStatements
          comparisonData={summaryData?.charts.comparisonHistory ?? []}
          kpis={summaryData?.kpis}
          isLoading={isLoading}
        />

        {/* KPI Grid */}
        <KPIGrid data={summaryData?.kpis} isLoading={isLoading} />

        {/* Inventory Alerts (Protegido por permisos) */}
        <Can permission={Permission.INVENTORY_READ}>
          <InventoryAlertsSection />
        </Can>

        {/* Charts Section */}
        <DashboardCharts
          comparisonData={summaryData?.charts.comparisonHistory ?? []}
          categoryData={summaryData?.charts.categoriesDistribution ?? []}
          topProducts={summaryData?.charts.topProducts ?? []}
          isLoading={isLoading}
          onDaysChange={setSelectedDays}
          selectedDays={selectedDays}
        />

        {/* Recent Movements Feed */}
        <RecentMovementsList
          movements={summaryData?.recentMovements ?? []}
          isLoading={isLoading}
        />
      </div>

      {/* 3. HERO QUICK ACTIONS & LINKS */}
      <section className={styles.quickLinksSection}>
        <h2 className={styles.sectionTitle}>Navegación Rápida</h2>
        <DashboardQuickLinksSection />
      </section>
    </main>
  );
}
