/*"use client";

import { useCallback, useEffect, useState } from "react";

import styles from "./page.module.css";

type UserRow = { id: number; name: string | null; email: string };

const apiBase = () =>
  (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001").replace(
    /\/$/,
    "",
  );

export function UsersTester() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setMessage(null);
    try {
      const res = await fetch(`${apiBase()}/users`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setUsers((await res.json()) as UserRow[]);
    } catch {
      setMessage(
        "No se pudo cargar la lista (¿API encendido y NEXT_PUBLIC_API_URL?)",
      );
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`${apiBase()}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || undefined,
        }),
      });
      const text = await res.text();
      let body: unknown;
      try {
        body = text ? JSON.parse(text) : null;
      } catch {
        body = null;
      }
      if (!res.ok) {
        const msg =
          typeof body === "object" &&
          body &&
          "message" in body &&
          typeof (body as { message: unknown }).message === "string"
            ? (body as { message: string }).message
            : `Error ${res.status}`;
        throw new Error(msg);
      }
      setEmail("");
      setName("");
      await loadUsers();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Error al registrar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={styles.usersBox} aria-labelledby="users-test-heading">
      <h2 id="users-test-heading" className={styles.usersTitle}>
        Probar usuarios (dev / staging)
      </h2>
      <p className={styles.usersHint}>
        Usa la misma web con <code>pnpm dev</code> o{" "}
        <code>pnpm dev:staging</code>; el API debe apuntar a la base de ese
        entorno (<code>NEXT_PUBLIC_API_URL</code>).
      </p>
      <form className={styles.usersForm} onSubmit={(e) => void onSubmit(e)}>
        <input
          className={styles.usersInput}
          type="email"
          autoComplete="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className={styles.usersInput}
          type="text"
          autoComplete="name"
          placeholder="Nombre (opcional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className={styles.usersSubmit} type="submit" disabled={saving}>
          {saving ? "Guardando…" : "Registrar"}
        </button>
      </form>
      {message ? <p className={styles.usersMsg}>{message}</p> : null}
      {loading ? (
        <p className={styles.usersMuted}>Cargando…</p>
      ) : (
        <ul className={styles.usersList}>
          {users.length === 0 ? (
            <li className={styles.usersMuted}>Nadie registrado aún.</li>
          ) : (
            users.map((u) => (
              <li key={u.id} className={styles.usersRow}>
                <strong>{u.name?.trim() ? u.name : "(sin nombre)"}</strong>
                <span>{u.email}</span>
              </li>
            ))
          )}
        </ul>
      )}
    </section>
  );
}
*/
