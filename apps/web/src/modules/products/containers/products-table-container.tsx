"use client";

import { useState } from "react";

import { DEFAULT_PAGE_SIZE } from "@/constants/theme";
import { DataTable, DataTableToolbar } from "@/shared/data-table";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";

import { getProductsTableColumns } from "../components/products-table";
import { useDeleteProduct } from "../hooks/use-delete-product";
import { useProducts } from "../hooks/use-products";
import { useToggleProductStatus } from "../hooks/use-toggle-product-status";
import type { Product } from "../types/product.types";

interface ProductsTableContainerProps {
  onEdit: (product: Product) => void;
  onCreate: () => void;
}

export function ProductsTableContainer({
  onEdit,
  onCreate,
}: ProductsTableContainerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebouncedValue(searchTerm);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);

  const filters = {
    page: currentPage,
    take: rowsPerPage,
    ...(debouncedSearch && { search: debouncedSearch }),
  };

  const { data, isLoading, isFetching, refetch } = useProducts(filters);
  const deleteMutation = useDeleteProduct();
  const toggleStatusMutation = useToggleProductStatus();

  const products = data?.items ?? [];
  const total = data?.meta.total ?? 0;
  const totalPages = data?.meta.totalPages ?? 1;

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  return (
    <>
      <DataTableToolbar
        searchPlaceholder="Buscar producto..."
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        onRefresh={() => void refetch()}
        refreshing={isFetching}
        createLabel="Nuevo Producto"
        onCreate={onCreate}
      />

      <DataTable
        title="Lista de Productos"
        columns={getProductsTableColumns({
          onEdit,
          onDelete: (id) => void deleteMutation.mutateAsync(id),
          onToggleStatus: (id, isActive) =>
            void toggleStatusMutation.mutateAsync({ id, isActive }),
        })}
        data={products}
        loading={isLoading}
        loadingMessage="Cargando productos..."
        emptyMessage="No se encontraron productos."
        total={total}
        getRowKey={(p) => p.id}
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
