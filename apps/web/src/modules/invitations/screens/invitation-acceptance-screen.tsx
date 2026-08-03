"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { getErrorMessage } from "@/lib/api/errors";
import { getSession } from "@/modules/auth/api/get-session";
import { login as loginApi } from "@/modules/auth/api/login";
import { AUTH_ROUTES } from "@/modules/auth/constants";
import { useAuthStore } from "@/modules/auth/store/auth-store";
import { getRoleLabel } from "@/modules/users/utils/role-labels";

type InvitationRecipientFlow = "register" | "login" | "blocked";

type InvitationInfo = {
  email: string;
  company: { name: string; isActive: boolean };
  role: string;
  expiresAt: string;
  status: string;
  recipientFlow: InvitationRecipientFlow;
};

type AcceptResponse = {
  accessToken: string;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function InvitationAcceptanceScreen() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const token = params.token;
  const isAuthReady = useAuthStore((state) => state.isAuthReady);
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setUser = useAuthStore((state) => state.setUser);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [invitation, setInvitation] = useState<InvitationInfo | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    void apiFetch<InvitationInfo>(ENDPOINTS.invitations.byToken(token))
      .then(setInvitation)
      .catch((error) =>
        toast.error(getErrorMessage(error, "No se pudo cargar la invitación")),
      );
  }, [token]);

  async function acceptInvitation() {
    const result = await apiFetch<AcceptResponse>(
      ENDPOINTS.invitations.accept(token),
      { method: "POST" },
    );
    setAccessToken(result.accessToken);
    const session = await getSession();
    setUser(session.user);
    toast.success("Invitación aceptada");
    router.replace(AUTH_ROUTES.dashboard);
  }

  async function acceptExisting() {
    setIsSubmitting(true);
    try {
      await acceptInvitation();
    } catch (error) {
      toast.error(getErrorMessage(error, "No se pudo aceptar la invitación"));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function loginAndAccept(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!invitation) {
      return;
    }

    setIsSubmitting(true);
    try {
      const { accessToken: nextToken } = await loginApi({
        email: invitation.email,
        password,
      });
      setAccessToken(nextToken);
      await acceptInvitation();
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          "No se pudo iniciar sesión o aceptar la invitación",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!invitation) {
      return;
    }

    setIsSubmitting(true);
    try {
      await apiFetch(ENDPOINTS.invitations.register(token), {
        method: "POST",
        body: JSON.stringify({ firstName, lastName, password }),
      });
      const { accessToken: nextToken } = await loginApi({
        email: invitation.email,
        password,
      });
      setAccessToken(nextToken);
      const session = await getSession();
      setUser(session.user);
      toast.success("Cuenta creada e invitación aceptada");
      router.replace(AUTH_ROUTES.dashboard);
    } catch (error) {
      toast.error(getErrorMessage(error, "No se pudo completar el registro"));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!invitation || !isAuthReady) {
    return <main style={{ padding: 40 }}>Cargando invitación...</main>;
  }

  const invitationEmail = normalizeEmail(invitation.email);
  const sessionEmail = user?.email ? normalizeEmail(user.email) : undefined;

  const isBlocked =
    invitation.recipientFlow === "blocked" ||
    Boolean(accessToken && user?.companyId);
  const canAcceptWithSession =
    Boolean(accessToken) &&
    sessionEmail === invitationEmail &&
    !user?.companyId &&
    invitation.recipientFlow !== "blocked";
  const isWrongAccount =
    Boolean(accessToken) &&
    Boolean(sessionEmail) &&
    sessionEmail !== invitationEmail &&
    !canAcceptWithSession;

  return (
    <main style={{ minHeight: "100vh", padding: 40 }}>
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <p style={{ color: "#6b7280", marginBottom: 8 }}>Invitación</p>
        <h1 style={{ fontSize: 28, marginBottom: 12 }}>
          Unirse a {invitation.company.name}
        </h1>
        <p style={{ color: "#4b5563", marginBottom: 24 }}>
          Te invitaron como {getRoleLabel(invitation.role)} con el correo{" "}
          <strong>{invitation.email}</strong>.
        </p>

        {isBlocked ? (
          <div
            style={{
              padding: 16,
              borderRadius: 8,
              background: "#fef2f2",
              color: "#991b1b",
            }}
          >
            Este usuario ya pertenece a otra empresa y no puede aceptar esta
            invitación.
          </div>
        ) : canAcceptWithSession ? (
          <button
            disabled={isSubmitting}
            onClick={() => void acceptExisting()}
            style={{
              padding: 12,
              borderRadius: 8,
              border: 0,
              background: "#111827",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            {isSubmitting ? "Aceptando..." : "Aceptar invitación"}
          </button>
        ) : isWrongAccount ? (
          <div style={{ display: "grid", gap: 12 }}>
            <p style={{ color: "#4b5563" }}>
              Iniciaste sesión como <strong>{user?.email}</strong>, pero esta
              invitación es para <strong>{invitation.email}</strong>.
            </p>
            <button
              type="button"
              onClick={() => {
                clearAuth();
                setPassword("");
              }}
              style={{
                justifySelf: "start",
                padding: "10px 14px",
                borderRadius: 8,
                border: "1px solid #d1d5db",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              Cerrar sesión e ingresar con el email invitado
            </button>
          </div>
        ) : invitation.recipientFlow === "login" ? (
          <form onSubmit={loginAndAccept} style={{ display: "grid", gap: 16 }}>
            <p style={{ color: "#4b5563", margin: 0 }}>
              Ya tienes una cuenta. Inicia sesión para unirte a la empresa.
            </p>
            <label style={{ display: "grid", gap: 6 }}>
              Email
              <input
                value={invitation.email}
                readOnly
                style={{
                  padding: 12,
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  background: "#f9fafb",
                }}
              />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              Contraseña
              <input
                type="password"
                value={password}
                minLength={8}
                onChange={(event) => setPassword(event.target.value)}
                required
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
              {isSubmitting ? "Ingresando..." : "Iniciar sesión y aceptar"}
            </button>
          </form>
        ) : (
          <form onSubmit={register} style={{ display: "grid", gap: 16 }}>
            <p style={{ color: "#4b5563", margin: 0 }}>
              Crea tu cuenta para unirte a la empresa.
            </p>
            <label style={{ display: "grid", gap: 6 }}>
              Nombre
              <input
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                required
                style={{
                  padding: 12,
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                }}
              />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              Apellido
              <input
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                required
                style={{
                  padding: 12,
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                }}
              />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              Contraseña
              <input
                type="password"
                value={password}
                minLength={8}
                onChange={(event) => setPassword(event.target.value)}
                required
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
              {isSubmitting ? "Creando..." : "Crear cuenta y aceptar"}
            </button>
            <p style={{ color: "#6b7280", fontSize: 14, margin: 0 }}>
              ¿Ya tienes cuenta?{" "}
              <Link href={AUTH_ROUTES.login} style={{ color: "#111827" }}>
                Inicia sesión
              </Link>
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
