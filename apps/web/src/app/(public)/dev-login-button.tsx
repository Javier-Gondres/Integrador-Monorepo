"use client";

import { useRouter } from "next/navigation";

import { useAuth } from "@/modules/auth";
import { DEV_TEST_USER } from "@/modules/auth/constants";

import styles from "./page.module.css";

export function DevLoginButton() {
  const router = useRouter();
  const { isAuthenticated, login, logout, isLoggingIn, isLoggingOut } =
    useAuth();

  async function handleDevLogin() {
    await login(DEV_TEST_USER);
    router.push("/products");
  }

  async function handleLogout() {
    await logout();
  }

  if (isAuthenticated) {
    return (
      <div className={styles.authBox}>
        <p className={styles.authHint}>
          Sesión activa. Las peticiones al API usan tu token de acceso.
        </p>
        <button
          type="button"
          className={styles.authSecondary}
          disabled={isLoggingOut}
          onClick={handleLogout}
        >
          {isLoggingOut ? "Cerrando…" : "Cerrar sesión"}
        </button>
      </div>
    );
  }

  return (
    <div className={styles.authBox}>
      <p className={styles.authHint}>
        Inicia sesión con el usuario del seed (
        <code>{DEV_TEST_USER.email}</code>). Requiere API en marcha y seed
        aplicado.
      </p>
      <button
        type="button"
        className={styles.authPrimary}
        disabled={isLoggingIn}
        onClick={handleDevLogin}
      >
        {isLoggingIn
          ? "Iniciando sesión…"
          : "Iniciar sesión (usuario demo)"}
      </button>
    </div>
  );
}
