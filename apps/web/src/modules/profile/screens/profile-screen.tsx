"use client";

import { ERP_COLORS as C } from "@/constants/theme";
import { useAuth } from "@/modules/auth";
import { PageHeader } from "@/shared/ui";

import { ProfileContentContainer } from "../containers/profile-content-container";

export function ProfileScreen() {
  const { user } = useAuth();

  if (!user) {
    return (
      <main
        style={{
          minHeight: "100vh",
          backgroundColor: C.pageBg,
          fontFamily: "inherit",
        }}
      >
        <div style={{ textAlign: "center", paddingTop: "40px" }}>
          <p style={{ color: C.bodyText }}>Cargando...</p>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: C.pageBg,
        fontFamily: "inherit",
      }}
    >
      <PageHeader breadcrumb="Mi Perfil" title="Mi Perfil" />

      <div
        style={{
          padding: "32px 40px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <div
          style={{
            backgroundColor: C.cardBg,
            borderRadius: "12px",
            border: `1px solid ${C.cardBorder}`,
            padding: "32px",
          }}
        >
          <ProfileContentContainer user={user} />
        </div>
      </div>
    </main>
  );
}
