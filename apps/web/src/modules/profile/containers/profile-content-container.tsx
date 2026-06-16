"use client";

import type { AuthUser } from "@/types";

import { ProfileTabs } from "../components/profile-tabs";
import { ChangePasswordTabContainer } from "./change-password-tab-container";
import { PersonalInfoTabContainer } from "./personal-info-tab-container";

interface ProfileContentContainerProps {
  user: AuthUser;
}

export function ProfileContentContainer({
  user,
}: ProfileContentContainerProps) {
  const tabs = [
    {
      id: "personal",
      label: "Información Personal",
      content: <PersonalInfoTabContainer user={user} />,
    },
    {
      id: "security",
      label: "Seguridad y Contraseña",
      content: <ChangePasswordTabContainer />,
    },
  ];

  return <ProfileTabs tabs={tabs} defaultTab="personal" />;
}
