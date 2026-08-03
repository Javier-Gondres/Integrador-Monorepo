"use client";

import { ERP_COLORS as C } from "@/constants/theme";
import {
  getUserFullName,
  getUserInitials,
} from "@/modules/profile/utils/profile-formatters";
import type { AuthUser } from "@/types";

interface ProfileAvatarCardProps {
  user: AuthUser;
}

export function ProfileAvatarCard({ user }: ProfileAvatarCardProps) {
  const initials = getUserInitials(user);
  const fullName = getUserFullName(user);

  return (
    <div
      style={{
        display: "flex",
        gap: "24px",
        alignItems: "flex-start",
        padding: "24px",
        backgroundColor: C.cardBg,
        borderRadius: "12px",
        border: `1px solid ${C.cardBorder}`,
      }}
    >
      <div
        style={{
          width: "120px",
          height: "120px",
          borderRadius: "50%",
          backgroundColor: C.primary,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "48px",
          fontWeight: 700,
          color: "#fff",
          flexShrink: 0,
        }}
      >
        {initials}
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <div>
          <p
            style={{
              fontSize: "12px",
              color: C.bodyText,
              marginBottom: "4px",
            }}
          >
            Nombre Completo
          </p>
          <p style={{ fontSize: "16px", fontWeight: 600, color: C.headText }}>
            {fullName}
          </p>
        </div>

        <div>
          <p
            style={{
              fontSize: "12px",
              color: C.bodyText,
              marginBottom: "4px",
            }}
          >
            Correo Electrónico
          </p>
          <p style={{ fontSize: "14px", color: C.bodyText }}>{user.email}</p>
        </div>
      </div>
    </div>
  );
}
