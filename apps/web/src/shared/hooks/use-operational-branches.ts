"use client";

import { Permission } from "@repo/shared";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { getMyBranch } from "@/modules/auth/api/get-my-branch";
import { usePermissions } from "@/modules/auth/hooks/use-permissions";
import { useAuthStore } from "@/modules/auth/store/auth-store";
import { getBranchesForSelect } from "@/modules/employees/api/get-branches";
import type { BranchOption } from "@/modules/employees/types/employee.types";

/**
 * Sucursales disponibles según el alcance operativo del usuario.
 *
 * - Con `BRANCHES_READ`: lista completa (Owner, Admin, Manager, etc.).
 * - Sin él: solo la sucursal activa vía `GET /me/branch` (p. ej. cajero).
 */
export function useOperationalBranches() {
  const user = useAuthStore((s) => s.user);
  const { can } = usePermissions();
  const canSelectBranch = can(Permission.BRANCHES_READ);

  const allBranchesQuery = useQuery({
    queryKey: ["branches-select"],
    queryFn: getBranchesForSelect,
    enabled: canSelectBranch,
    staleTime: 60_000,
  });

  const myBranchQuery = useQuery({
    queryKey: ["my-branch", user?.branchId],
    queryFn: getMyBranch,
    enabled: !canSelectBranch && Boolean(user?.companyId),
    staleTime: 60_000,
  });

  const branches = useMemo((): BranchOption[] => {
    if (canSelectBranch) {
      return allBranchesQuery.data ?? [];
    }

    const branch = myBranchQuery.data;
    if (branch) {
      return [{ id: branch.id, name: branch.name }];
    }

    if (user?.branchId) {
      return [{ id: user.branchId, name: "Sucursal activa" }];
    }

    return [];
  }, [
    canSelectBranch,
    allBranchesQuery.data,
    myBranchQuery.data,
    user?.branchId,
  ]);

  const defaultBranchId = useMemo(() => {
    if (canSelectBranch) {
      if (user?.branchId && branches.some((b) => b.id === user.branchId)) {
        return user.branchId;
      }
      return branches[0]?.id ?? "";
    }

    return user?.branchId ?? myBranchQuery.data?.id ?? "";
  }, [canSelectBranch, branches, user?.branchId, myBranchQuery.data?.id]);

  return {
    branches,
    canSelectBranch,
    defaultBranchId,
    isLoading: canSelectBranch
      ? allBranchesQuery.isLoading
      : myBranchQuery.isLoading,
  };
}
