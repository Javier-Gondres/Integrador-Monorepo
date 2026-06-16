import { AuthGuard } from "@/modules/auth/components/auth-guard";
import { LayoutShell } from "@/shared/ui/layout-shell/layout-shell";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <LayoutShell>
        {children}
      </LayoutShell>
    </AuthGuard>
  );
}
