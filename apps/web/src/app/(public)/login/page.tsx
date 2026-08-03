import { redirect } from "next/navigation";

import { AUTH_ROUTES } from "@/modules/auth/constants";

export default function LoginPage() {
  redirect(AUTH_ROUTES.login);
}
