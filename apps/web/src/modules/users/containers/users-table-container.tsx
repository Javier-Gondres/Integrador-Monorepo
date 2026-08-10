"use client";

import { useState } from "react";

import { DEFAULT_PAGE_SIZE } from "@/constants/theme";
import { Permission, usePermissions } from "@/modules/auth";
import { DataTable, DataTableToolbar } from "@/shared/data-table";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";
import { Select } from "@/shared/ui";

import { getUsersTableColumns } from "../components/users-table";
import { useToggleUserStatus } from "../hooks/use-toggle-user-status";
import { useUsers } from "../hooks/use-users";
import type { User } from "../types/user.types";
import { canManageTargetRole } from "../utils/role-labels";

interface UsersTableContainerProps {
  onEdit: (user: User) => void;
  onCreate: () => void;
}

type StatusFilter = "Todos" | "Activos" | "Inactivos";

export function UsersTableContainer({
  onEdit,
  onCreate,
}: UsersTableContainerProps) {
  const { roleName } = usePermissions();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebouncedValue(searchTerm);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Todos");

  const filters = {
    page: currentPage,
    take: rowsPerPage,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(statusFilter === "Activos" && { isActive: true }),
    ...(statusFilter === "Inactivos" && { isActive: false }),
  };

  const { data, isLoading, isFetching, refetch } = useUsers(filters);
  const toggleStatusMutation = useToggleUserStatus();

  const users = data?.items ?? [];
  const total = data?.meta.total ?? 0;
  const totalPages = data?.meta.totalPages ?? 1;

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const canManageRow = (user: User) =>
    canManageTargetRole(roleName, user.roleName);

  return (
    <>
      <DataTableToolbar
        searchPlaceholder="Buscar por nombre o email..."
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        onRefresh={() => void refetch()}
        refreshing={isFetching}
        createLabel="Nuevo Usuario"
        onCreate={onCreate}
        createPermission={Permission.USERS_CREATE}
      />

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "13px", fontWeight: 600 }}>Estado</span>
        <Select
          options={["Todos", "Activos", "Inactivos"]}
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as StatusFilter);
            setCurrentPage(1);
          }}
          style={{ minWidth: "160px" }}
        />
      </div>

      <DataTable
        title="Lista de Usuarios"
        columns={getUsersTableColumns({
          canManageRow,
          onEdit,
          onToggleStatus: (id, isActive) =>
            void toggleStatusMutation.mutateAsync({ id, isActive }),
        })}
        data={users}
        loading={isLoading}
        loadingMessage="Cargando usuarios..."
        emptyMessage="No se encontraron usuarios."
        total={total}
        getRowKey={(user) => user.id}
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
