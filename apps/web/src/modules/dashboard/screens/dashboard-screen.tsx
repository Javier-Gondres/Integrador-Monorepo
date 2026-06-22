import {
  DashboardHeroActions,
  DashboardQuickLinksSection,
} from "../components/dashboard-quick-links";
import styles from "./dashboard-screen.module.css";

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

          <DashboardHeroActions />
        </div>
      </section>

      <DashboardQuickLinksSection />
    </main>
  );
}
