import { GuestGuard } from "@/modules/auth/components/guest-guard";
import { LoginScreen } from "@/modules/auth/screens/login-screen";

export default function HomePage() {
  return (
    <GuestGuard>
      <LoginScreen />
    </GuestGuard>
  );
}
