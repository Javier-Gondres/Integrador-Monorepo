"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { AUTH_ROUTES } from "../constants";
import { useAuthStore } from "../store/auth-store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthReady = useAuthStore((state) => state.isAuthReady);
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (isAuthReady && !accessToken) {
      router.replace(AUTH_ROUTES.login);
    }
  }, [isAuthReady, accessToken, router]);

  if (!isAuthReady || !accessToken) {
    return null;
  }

  return <>{children}</>;
}
