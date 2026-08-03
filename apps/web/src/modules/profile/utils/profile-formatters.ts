import type { AuthUser } from "@/types";

export function getUserInitials(user: AuthUser | null | undefined): string {
  const first = user?.firstName?.[0]?.toUpperCase() ?? "";
  const last = user?.lastName?.[0]?.toUpperCase() ?? "";
  return `${first}${last}`;
}

export function getUserFullName(user: AuthUser | null | undefined): string {
  if (!user) {
    return "";
  }

  return `${user.firstName} ${user.lastName}`.trim();
}
