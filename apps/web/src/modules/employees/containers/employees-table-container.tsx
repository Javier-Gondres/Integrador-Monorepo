"use client";

import { useMemo, useState } from "react";

import { DEFAULT_PAGE_SIZE } from "@/constants/theme";
import { Permission, usePermissions } from "@/modules/auth";
import { useAuthStore } from "@/modules/auth/store/auth-store";
import { useUsers } from "@/modules/users/hooks/use-users";
import { DataTable, DataTableToolbar } from "@/shared/data-table";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";

import { getEmployeesTableColumns } from "../components/employees-table";
import { useEmployees } from "../hooks/use-employees";
import { useRemoveMemberFromCompany } from "../hooks/use-remove-member";
import { mapUsersAndEmployeesToMembers } from "../mappers/company-member.mapper";
import type { CompanyMember } from "../types/company-member.types";
import {
  canEditMember,
  canRemoveMemberFromCompany,
} from "../utils/employee-access";

interface EmployeesTableContainerProps {
  onEdit: (member: CompanyMember) => void;
  onCreate: () => void;
}

export function EmployeesTableContainer({
  onEdit,
  onCreate,
}: EmployeesTableContainerProps) {
  const { roleName } = usePermissions();
  const actorUserId = useAuthStore((state) => state.user?.id);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebouncedValue(searchTerm);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);

  const filters = {
    page: currentPage,
    take: rowsPerPage,
    ...(debouncedSearch && { search: debouncedSearch }),
  };

  const { data: usersData, isLoading, isFetching, refetch } = useUsers(filters);
  const { data: employeesData } = useEmployees({ page: 1, take: 500 });
  const removeMutation = useRemoveMemberFromCompany();

  const members = useMemo(
    () =>
      mapUsersAndEmployeesToMembers(
        usersData?.items ?? [],
        employeesData?.items ?? [],
      ),
    [usersData?.items, employeesData?.items],
  );

  const total = usersData?.meta.total ?? 0;
  const totalPages = usersData?.meta.totalPages ?? 1;

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  async function handleRemove(userId: string) {
    if (
      !confirm("¿Sacar este usuario de la empresa? No se eliminará su cuenta.")
    ) {
      return;
    }
    await removeMutation.mutateAsync(userId);
  }

  return (
    <>
      <DataTableToolbar
        searchPlaceholder="Buscar por nombre, email o puesto..."
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        onRefresh={() => void refetch()}
        refreshing={isFetching}
        createLabel="Nuevo miembro"
        onCreate={onCreate}
        createPermission={Permission.EMPLOYEES_CREATE}
      />

      <DataTable
        title="Miembros de la empresa"
        columns={getEmployeesTableColumns({
          canEdit: (member) => canEditMember(actorUserId, roleName, member),
          canRemove: (member) =>
            canRemoveMemberFromCompany(actorUserId, roleName, member),
          onEdit,
          onRemove: (userId) => void handleRemove(userId),
        })}
        data={members}
        loading={isLoading}
        loadingMessage="Cargando miembros..."
        emptyMessage="No se encontraron miembros."
        total={total}
        getRowKey={(row) => row.userId}
        pagination={{
          total,
          currentPage,
          totalPages,
          rowsPerPage,
          loading: isFetching,
        }}
        onPageChange={setCurrentPage}
        onRowsPerPageChange={(rows) => {
          setRowsPerPage(rows);
          setCurrentPage(1);
        }}
      />
    </>
  );
}
