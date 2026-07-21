"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { getErrorMessage } from "@/lib/api/errors";
import { getSession } from "@/modules/auth/api/get-session";
import { AUTH_ROUTES } from "@/modules/auth/constants";
import { useAuthStore } from "@/modules/auth/store/auth-store";

type CreateCompanyResponse = {
  company: { id: string; name: string };
  accessToken: string;
};

export function CompanyOnboardingScreen() {
  const router = useRouter();
  const isAuthReady = useAuthStore((state) => state.isAuthReady);
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setUser = useAuthStore((state) => state.setUser);
  const [name, setName] = useState("");
  const [rnc, setRnc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthReady) return;
    if (!accessToken) {
      router.replace(AUTH_ROUTES.login);
      return;
    }
    if (user?.isSuperAdmin) {
      router.replace(AUTH_ROUTES.platformDashboard);
      return;
    }
    if (user?.companyId) {
      router.replace(AUTH_ROUTES.dashboard);
    }
  }, [accessToken, isAuthReady, router, user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await apiFetch<CreateCompanyResponse>(
        ENDPOINTS.companies.root,
        {
          method: "POST",
          body: JSON.stringify({ name, rnc: rnc || undefined }),
        },
      );
      setAccessToken(result.accessToken);
      const session = await getSession();
      setUser(session.user);
      toast.success("Empresa creada correctamente");
      router.replace(AUTH_ROUTES.dashboard);
    } catch (error) {
      toast.error(getErrorMessage(error, "No se pudo crear la empresa"));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isAuthReady || !accessToken || user?.companyId || user?.isSuperAdmin) {
    return null;
  }

  return (
    <main style={{ minHeight: "100vh", padding: 40 }}>
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <p style={{ color: "#6b7280", marginBottom: 8 }}>Onboarding</p>
        <h1 style={{ fontSize: 28, marginBottom: 12 }}>Crea tu empresa</h1>
        <p style={{ color: "#4b5563", marginBottom: 24 }}>
          Tu cuenta fue creada por el administrador de plataforma. Crea la
          empresa para convertirte automáticamente en OWNER.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
          <label style={{ display: "grid", gap: 6 }}>
            Nombre de la empresa
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              style={{
                padding: 12,
                border: "1px solid #d1d5db",
                borderRadius: 8,
              }}
            />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            RNC
            <input
              value={rnc}
              onChange={(event) => setRnc(event.target.value)}
              style={{
                padding: 12,
                border: "1px solid #d1d5db",
                borderRadius: 8,
              }}
            />
          </label>
          <button
            disabled={isSubmitting}
            type="submit"
            style={{
              padding: 12,
              borderRadius: 8,
              border: 0,
              background: "#111827",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            {isSubmitting ? "Creando..." : "Crear empresa"}
          </button>
        </form>
      </div>
    </main>
  );
}
