import { Sidebar } from "@/shared/ui/sidebar/sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-shell__content">{children}</div>
    </div>
  );
}