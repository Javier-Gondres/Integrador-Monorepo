import { redirect } from "next/navigation";

import { AUTH_ROUTES } from "@/modules/auth/constants";

export default function PlatformIndexPage() {
  redirect(AUTH_ROUTES.platformDashboard);
}
