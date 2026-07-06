"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuthStore } from "../store/auth-store";
import { getPostLoginRoute } from "../utils/post-login-route";

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthReady = useAuthStore((state) => state.isAuthReady);
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (isAuthReady && accessToken) {
      router.replace(getPostLoginRoute(user));
    }
  }, [accessToken, isAuthReady, router, user]);

  if (!isAuthReady || accessToken) {
    return null;
  }

  return <>{children}</>;
}
