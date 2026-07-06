import { AuthGuard } from "@/modules/auth/components/auth-guard";
import { PlatformGuard } from "@/modules/auth/components/platform-guard";
import { PlatformSidebar } from "@/shared/ui/sidebar/platform-sidebar";

export default function PlatformLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <PlatformGuard>
        <div className="app-shell">
          <PlatformSidebar />
          <div className="app-shell__content">{children}</div>
        </div>
      </PlatformGuard>
    </AuthGuard>
  );
}
