import { AuthGuard } from "@/modules/auth/components/auth-guard";
import { Sidebar } from "@/shared/ui/sidebar/sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <div className="app-shell">
        <Sidebar />
        <div className="app-shell__content">{children}</div>
      </div>
    </AuthGuard>
  );
}
