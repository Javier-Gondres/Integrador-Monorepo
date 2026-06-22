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

    const { accessToken, user, setAuthReady, clearAuth } =
      useAuthStore.getState();

    if (accessToken && user) {
      if (user.companyId && !user.companySlug) {
        void restoreSession()
          .catch(() => {
            clearAuth();
          })
          .finally(() => {
            setAuthReady(true);
          });
        return;
      }

      setAuthReady(true);
      return;
    }

    if (accessToken && !user) {
      void restoreSession()
        .catch(() => {
          clearAuth();
        })
        .finally(() => {
          setAuthReady(true);
        });
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
