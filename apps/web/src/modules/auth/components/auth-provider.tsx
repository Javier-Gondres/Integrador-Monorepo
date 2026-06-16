"use client";

import { useEffect, useRef } from "react";

import { restoreSession } from "../services/restore-session";
import { useAuthStore } from "../store/auth-store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) {
      return;
    }

    initialized.current = true;

    const { accessToken, setAuthReady, clearAuth } = useAuthStore.getState();

    if (accessToken) {
      setAuthReady(true);
      return;
    }

    void restoreSession()
      .catch(() => {
        clearAuth();
      })
      .finally(() => {
        setAuthReady(true);
      });
  }, []);

  return <>{children}</>;
}
