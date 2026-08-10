"use client";

import type { TenantRoleName } from "@repo/shared";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { getErrorMessage } from "@/lib/api/errors";
import { usePermissions } from "@/modules/auth";
import {
  InvitationStatus,
  type TeamInvitation,
} from "@/modules/invitations/types/invitation.types";
import { getAssignableRoles } from "@/shared/auth/assignable-roles";
import { PageHeader } from "@/shared/ui";

const ALL_INVITABLE_ROLES = [
  "ADMIN",
  "MANAGER",
  "CASHIER",
  "INVENTORY_ASSISTANT",
] as const satisfies readonly TenantRoleName[];

export function TeamSettingsScreen() {
  const { roleName } = usePermissions();
  const invitableRoles = useMemo(
    () =>
      ALL_INVITABLE_ROLES.filter((role) =>
        getAssignableRoles(roleName).includes(role),
      ),
    [roleName],
  );
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TenantRoleName>(
    invitableRoles[0] ?? "CASHIER",
  );
  const [items, setItems] = useState<TeamInvitation[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadInvitations() {
    const result = await apiFetch<TeamInvitation[]>(ENDPOINTS.invitations.root);
    setItems(result);
  }

  useEffect(() => {
    if (!invitableRoles.some((item) => item === role)) {
      setRole(invitableRoles[0] ?? "CASHIER");
    }
  }, [invitableRoles, role]);

  useEffect(() => {
    void loadInvitations().catch((error) =>
      toast.error(getErrorMessage(error, "No se pudieron cargar invitaciones")),
    );
  }, []);

  async function createInvitation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await apiFetch(ENDPOINTS.invitations.root, {
        method: "POST",
        body: JSON.stringify({ email, role }),
      });
      setEmail("");
      toast.success("Invitación enviada");
      await loadInvitations();
    } catch (error) {
      toast.error(getErrorMessage(error, "No se pudo enviar la invitación"));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function mutateInvitation(id: string, action: "resend" | "revoke") {
    try {
      await apiFetch(
        action === "resend"
          ? ENDPOINTS.invitations.resend(id)
          : ENDPOINTS.invitations.revoke(id),
        { method: "POST" },
      );
      toast.success(
        action === "resend" ? "Invitación reenviada" : "Invitación revocada",
      );
      await loadInvitations();
    } catch (error) {
      toast.error(
        getErrorMessage(error, "No se pudo actualizar la invitación"),
      );
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#f9fafb" }}>
      <PageHeader breadcrumb="Configuración / Equipo" title="Equipo" />
      <div style={{ padding: "32px 40px", display: "grid", gap: 24 }}>
        <section style={{ background: "#fff", padding: 24, borderRadius: 12 }}>
          <h2 style={{ fontSize: 20, marginBottom: 16 }}>Invitar usuario</h2>
          <form
            onSubmit={createInvitation}
            style={{ display: "grid", gap: 16, maxWidth: 520 }}
          >
            <label style={{ display: "grid", gap: 6 }}>
              Email
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                required
                style={{
                  padding: 12,
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                }}
              />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              Rol
              <select
                value={role}
                onChange={(event) =>
                  setRole(event.target.value as TenantRoleName)
                }
                style={{
                  padding: 12,
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                }}
              >
                {invitableRoles.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
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
              {isSubmitting ? "Enviando..." : "Enviar invitación"}
            </button>
          </form>
        </section>

        <section style={{ background: "#fff", padding: 24, borderRadius: 12 }}>
          <h2 style={{ fontSize: 20, marginBottom: 16 }}>Invitaciones</h2>
          <div style={{ display: "grid", gap: 12 }}>
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 16,
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  padding: 16,
                }}
              >
                <div>
                  <strong>{item.email}</strong>
                  <p style={{ margin: "4px 0", color: "#6b7280" }}>
                    {item.role.name} · {item.status}
                  </p>
                </div>
                {item.status === InvitationStatus.PENDING && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => void mutateInvitation(item.id, "resend")}
                    >
                      Reenviar
                    </button>
                    <button
                      onClick={() => void mutateInvitation(item.id, "revoke")}
                    >
                      Revocar
                    </button>
                  </div>
                )}
              </div>
            ))}
            {items.length === 0 && <p>No hay invitaciones registradas.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}
