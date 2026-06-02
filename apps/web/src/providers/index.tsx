import { AuthProvider } from "@/modules/auth";

import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "./theme-provider";
import { ToastProvider } from "./toast-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <ThemeProvider>
          {children}
          <ToastProvider />
        </ThemeProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
