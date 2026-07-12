"use client";

import React, { useState } from "react";

import { useBranches } from "@/modules/branches/hooks/use-branches";

import { DashboardCharts } from "../components/dashboard-charts";
import { KPIGrid } from "../components/dashboard-kpis";
import { DashboardQuickLinksSection } from "../components/dashboard-quick-links";
import { RecentMovementsList } from "../components/recent-movements";
import { useDashboardSummary } from "../hooks/use-dashboard";
import styles from "./dashboard-screen.module.css";

interface BranchOption {
  id: string;
  name: string;
}

export function DashboardScreen() {
  const [selectedBranch, setSelectedBranch] = useState<string>("todas");
  const [selectedDays, setSelectedDays] = useState<number>(7);

  const { data: branchesData } = useBranches();
  const {
    data: summaryData,
    isLoading,
    isFetching,
  } = useDashboardSummary(selectedBranch, selectedDays);

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
            {isFetching && (
              <span className={styles.syncing}>Actualizando...</span>
            )}
          </div>
        </div>
      </section>

      {/* 2. ANALYTICS CONTENT AREA */}
      <div className={styles.analyticsSection}>
        {/* KPI Grid */}
        <KPIGrid data={summaryData?.kpis} isLoading={isLoading} />

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
