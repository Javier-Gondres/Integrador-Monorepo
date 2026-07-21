"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { getErrorMessage } from "@/lib/api/errors";

import { AUTH_ROUTES } from "../constants";

export function ResetPasswordScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await apiFetch(ENDPOINTS.auth.resetPassword, {
        method: "POST",
        body: JSON.stringify({ token, newPassword }),
      });
      toast.success("Contraseña actualizada. Ya puedes iniciar sesión.");
      router.replace(AUTH_ROUTES.login);
    } catch (error) {
      toast.error(
        getErrorMessage(error, "No se pudo actualizar la contraseña"),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", padding: 40 }}>
      <div style={{ maxWidth: 420, margin: "0 auto" }}>
        <h1 style={{ fontSize: 28, marginBottom: 12 }}>
          Restablecer contraseña
        </h1>
        <p style={{ color: "#4b5563", marginBottom: 24 }}>
          Define una contraseña para activar tu cuenta o recuperar el acceso.
        </p>

        {!token ? (
          <p>El enlace no contiene un token válido.</p>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
            <label style={{ display: "grid", gap: 6 }}>
              Nueva contraseña
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                minLength={8}
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
              {isSubmitting ? "Guardando..." : "Guardar contraseña"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
