"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { getAccessToken } from "@/lib/api/access-token";
import { useLogin, useLogout } from "@/modules/auth";
import { DEV_TEST_USER } from "@/modules/auth/constants";

import styles from "./page.module.css";

export function DevLoginButton() {
  const router = useRouter();
  const [hasSession, setHasSession] = useState(false);
  const login = useLogin();
  const logout = useLogout();

  const refreshSession = useCallback(() => {
    setHasSession(Boolean(getAccessToken()));
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  function handleDevLogin() {
    login.mutate(DEV_TEST_USER, {
      onSuccess: () => {
        refreshSession();
        router.push("/products");
      },
    });
  }

  function handleLogout() {
    logout.mutate(undefined, {
      onSuccess: () => {
        refreshSession();
      },
    });
  }

  if (hasSession) {
    return (
      <div className={styles.authBox}>
        <p className={styles.authHint}>
          Sesión activa. Las peticiones al API usan tu token de acceso.
        </p>
        <button
          type="button"
          className={styles.authSecondary}
          disabled={logout.isPending}
          onClick={handleLogout}
        >
          {logout.isPending ? "Cerrando…" : "Cerrar sesión"}
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
        disabled={login.isPending}
        onClick={handleDevLogin}
      >
        {login.isPending
          ? "Iniciando sesión…"
          : "Iniciar sesión (usuario demo)"}
      </button>
    </div>
  );
}
