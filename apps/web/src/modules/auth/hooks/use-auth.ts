import { useQuery } from "@tanstack/react-query";

import { getSession } from "../api/get-session";
import { authKeys } from "../query-keys";

export function useAuth() {
  return useQuery({
    queryKey: authKeys.session(),
    queryFn: getSession,
    retry: false,
    staleTime: 5 * 60_000,
  });
}

export function useCurrentUser() {
  const { data, ...rest } = useAuth();
  return { user: data?.user ?? null, ...rest };
}

export function usePermissions() {
  const { data } = useAuth();
  return data?.user?.role?.permissions ?? [];
}

export function useHasPermission(code: string) {
  const permissions = usePermissions();
  return permissions.some((p) => p.code === code);
}
