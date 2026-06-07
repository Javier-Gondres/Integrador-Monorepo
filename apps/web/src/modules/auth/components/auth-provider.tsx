"use client";

import { useEffect, useRef } from "react";

import { getSession, refreshToken } from "../api/get-session";
import { useAuthStore } from "../store/auth-store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) {
      return;
    }

    initialized.current = true;

    const { accessToken, setAccessToken, setUser, clearAuth } =
      useAuthStore.getState();

    if (accessToken) {
      return;
    }

    void refreshToken()
      .then(({ accessToken: token }) => {
        setAccessToken(token);
        return getSession();
      })
      .then((session) => {
        setUser(session.user);
      })
      .catch(() => {
        clearAuth();
      });
  }, []);

  return <>{children}</>;
}
