"use client";

/** Provider de autenticación — reservado para contexto de sesión cuando exista login visual. */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
