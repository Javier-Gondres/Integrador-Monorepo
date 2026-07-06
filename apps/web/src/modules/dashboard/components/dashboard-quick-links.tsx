"use client";

import { ArrowRight, CircleCheckBig } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { DASHBOARD_QUICK_LINKS, filterQuickLinks } from "@/config/nav";
import { useAuth, usePermissions } from "@/modules/auth";

import styles from "../screens/dashboard-screen.module.css";

function useFilteredQuickLinks() {
  const { user } = useAuth();
  const { can, isSuperAdmin } = usePermissions();

  return useMemo(
    () =>
      filterQuickLinks(DASHBOARD_QUICK_LINKS, {
        can,
        isSuperAdmin,
        roleName: user?.role?.name,
        hasTenant: Boolean(user?.companyId),
      }),
    [can, isSuperAdmin, user?.role?.name, user?.companyId],
  );
}

export function DashboardHeroActions() {
  const quickLinks = useFilteredQuickLinks();
  const primaryLink = quickLinks[0];
  const secondaryLink = quickLinks[1];

  if (!primaryLink && !secondaryLink) {
    return null;
  }

  return (
    <div className={styles.heroActions}>
      {primaryLink && (
        <Link href={primaryLink.href} className={styles.primaryAction}>
          Abrir {primaryLink.title.toLowerCase()}
          <ArrowRight size={16} />
        </Link>
      )}
      {secondaryLink && (
        <Link href={secondaryLink.href} className={styles.secondaryAction}>
          Revisar {secondaryLink.title.toLowerCase()}
        </Link>
      )}
    </div>
  );
}

export function DashboardQuickLinksSection() {
  const quickLinks = useFilteredQuickLinks();

  if (quickLinks.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.sectionKicker}>Atajo rápido</p>
          <h2 className={styles.sectionTitle}>Accesos directos al catálogo</h2>
        </div>
      </div>

      <div className={styles.quickGrid}>
        {quickLinks.map((module) => {
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
  );
}
