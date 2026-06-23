"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { AUTH_ROUTES } from "../constants";

const MESSAGES = {
  "no-permission": {
    title: "Acceso denegado",
    description:
      "No tienes permisos para ver esta sección. Si crees que es un error, contacta al administrador de tu empresa.",
  },
  "no-tenant": {
    title: "Sin contexto de empresa",
    description:
      "Tu cuenta no tiene una empresa activa asignada. Las pantallas del ERP requieren membresía tenant.",
  },
  "platform-admin": {
    title: "Acceso restringido a plataforma",
    description:
      "Esta sección es exclusiva para Super Admin. Si necesitas operar el ERP de una empresa, usa el dashboard tenant.",
  },
} as const;

const primaryLinkClassName =
  "inline-flex h-10 items-center rounded-lg bg-[#3C50E0] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#3346c8]";

type ForbiddenReason = keyof typeof MESSAGES;

function resolveReason(raw: string | null): ForbiddenReason {
  if (raw === "no-tenant") {
    return "no-tenant";
  }
  if (raw === "platform-admin") {
    return "platform-admin";
  }
  return "no-permission";
}

export function ForbiddenScreen() {
  const searchParams = useSearchParams();
  const reason = resolveReason(searchParams.get("reason"));
  const { title, description } = MESSAGES[reason];

  return (
    <main className="flex min-h-full items-center justify-center px-6 py-10">
      <div className="flex max-w-[480px] flex-col gap-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
          403
        </p>
        <h1 className="text-[28px] font-bold text-[#1C2434]">{title}</h1>
        <p className="text-[15px] leading-relaxed text-[#637381]">
          {description}
        </p>
        <div className="mt-2 flex justify-center gap-3">
          {reason === "no-tenant" ? (
            <Link href={AUTH_ROUTES.login} className={primaryLinkClassName}>
              Volver al inicio
            </Link>
          ) : reason === "platform-admin" ? (
            <Link href={AUTH_ROUTES.dashboard} className={primaryLinkClassName}>
              Ir al dashboard
            </Link>
          ) : (
            <Link href={AUTH_ROUTES.dashboard} className={primaryLinkClassName}>
              Ir al dashboard
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
