"use client";

import { useState } from "react";

import { DEFAULT_PAGE_SIZE } from "@/constants/theme";
import { DataTable, DataTableToolbar } from "@/shared/data-table";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";
import { Select } from "@/shared/ui";

import { getPlatformCompaniesTableColumns } from "../components/platform-companies-table";
import { PlatformCompanyEditForm } from "../components/platform-company-edit-form";
import { PlatformCompanyForm } from "../components/platform-company-form";
import { useCreatePlatformCompany } from "../hooks/use-create-platform-company";
import { usePlatformCompanies } from "../hooks/use-platform-companies";
import { useTogglePlatformCompanyStatus } from "../hooks/use-toggle-platform-company-status";
import { useUpdatePlatformCompany } from "../hooks/use-update-platform-company";
import {
  mapPlatformCompanyFormDefaults,
  mapPlatformCompanyFormToPayload,
  mapPlatformCompanyToEditFormDefaults,
  mapUpdatePlatformCompanyFormToPayload,
} from "../mappers/platform-company.mapper";
import type {
  PlatformCompanyFormSchema,
  UpdatePlatformCompanyFormSchema,
} from "../schemas/platform-company.schema";
import type { PlatformCompany } from "../types/platform.types";

type StatusFilter = "Todos" | "Activas" | "Inactivas";

export function PlatformCompaniesTableContainer() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebouncedValue(searchTerm);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Todos");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<PlatformCompany | null>(
    null,
  );

  const filters = {
    page: currentPage,
    take: rowsPerPage,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(statusFilter === "Activas" && { isActive: true }),
    ...(statusFilter === "Inactivas" && { isActive: false }),
  };

  const { data, isLoading, isFetching, refetch } =
    usePlatformCompanies(filters);
  const createMutation = useCreatePlatformCompany();
  const toggleStatusMutation = useTogglePlatformCompanyStatus();
  const updateMutation = useUpdatePlatformCompany();

  const companies = data?.items ?? [];
  const total = data?.meta.total ?? 0;
  const totalPages = data?.meta.totalPages ?? 1;

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleSubmit = async (values: PlatformCompanyFormSchema) => {
    await createMutation.mutateAsync(mapPlatformCompanyFormToPayload(values));
    setIsModalOpen(false);
  };

  const handleEditSubmit = async (values: UpdatePlatformCompanyFormSchema) => {
    if (!editingCompany) return;
    await updateMutation.mutateAsync({
      id: editingCompany.id,
      data: mapUpdatePlatformCompanyFormToPayload(values),
    });
    setEditingCompany(null);
  };

  return (
    <>
      <DataTableToolbar
        searchPlaceholder="Buscar empresa, slug o RNC..."
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        onRefresh={() => void refetch()}
        refreshing={isFetching}
        createLabel="Nueva empresa"
        onCreate={() => setIsModalOpen(true)}
      />

      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
        <span style={{ fontSize: "13px", fontWeight: 600 }}>Estado</span>
        <Select
          options={["Todos", "Activas", "Inactivas"]}
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as StatusFilter);
            setCurrentPage(1);
          }}
          className="w-full sm:w-auto"
          style={{ minWidth: "min(100%, 160px)" }}
        />
      </div>

      <DataTable
        title="Tenants registrados"
        columns={getPlatformCompaniesTableColumns({
          onToggleStatus: (id, isActive) =>
            void toggleStatusMutation.mutateAsync({ id, isActive }),
          onEdit: (company) => setEditingCompany(company),
        })}
        data={companies}
        loading={isLoading}
        loadingMessage="Cargando empresas..."
        emptyMessage="No se encontraron empresas."
        total={total}
        getRowKey={(row) => row.id}
        pagination={{
          total,
          currentPage,
          totalPages,
          rowsPerPage,
        }}
        onPageChange={setCurrentPage}
        onRowsPerPageChange={(value) => {
          setRowsPerPage(value);
          setCurrentPage(1);
        }}
      />

      {isModalOpen ? (
        <PlatformCompanyForm
          defaultValues={mapPlatformCompanyFormDefaults()}
          isSubmitting={createMutation.isPending}
          onSubmit={handleSubmit}
          onClose={() => setIsModalOpen(false)}
        />
      ) : null}

      {editingCompany ? (
        <PlatformCompanyEditForm
          defaultValues={mapPlatformCompanyToEditFormDefaults(editingCompany)}
          isSubmitting={updateMutation.isPending}
          onSubmit={handleEditSubmit}
          onClose={() => setEditingCompany(null)}
        />
      ) : null}
    </>
  );
}
