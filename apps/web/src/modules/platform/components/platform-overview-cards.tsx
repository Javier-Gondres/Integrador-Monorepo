"use client";

import Link from "next/link";

import { ERP_COLORS as C } from "@/constants/theme";
import { AUTH_ROUTES } from "@/modules/auth/constants";

import { usePlatformOverview } from "../hooks/use-platform-overview";

const cardStyle = {
  backgroundColor: C.cardBg,
  borderRadius: "12px",
  border: `1px solid ${C.cardBorder}`,
  padding: "24px",
  boxShadow: C.cardShadow,
} as const;

export function PlatformOverviewCards() {
  const { data, isLoading } = usePlatformOverview();

  const cards = [
    {
      label: "Empresas totales",
      value: data?.totalCompanies ?? 0,
      tone: C.primary,
    },
    {
      label: "Activas",
      value: data?.activeCompanies ?? 0,
      tone: C.greenText,
    },
    {
      label: "Suspendidas",
      value: data?.inactiveCompanies ?? 0,
      tone: C.grayText,
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "16px",
      }}
    >
      {cards.map((card) => (
        <div key={card.label} style={cardStyle}>
          <p style={{ margin: 0, fontSize: "13px", color: C.mutedText }}>
            {card.label}
          </p>
          <p
            style={{
              margin: "8px 0 0",
              fontSize: "32px",
              fontWeight: 700,
              color: card.tone,
            }}
          >
            {isLoading ? "…" : card.value}
          </p>
        </div>
      ))}

      <div
        style={{
          ...cardStyle,
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "14px",
            fontWeight: 600,
            color: C.bodyText,
          }}
        >
          Acciones rápidas
        </p>
        <Link
          href={AUTH_ROUTES.platformCompanies}
          style={{ color: C.primary, fontSize: "14px", fontWeight: 600 }}
        >
          Gestionar empresas →
        </Link>
      </div>
    </div>
  );
}
