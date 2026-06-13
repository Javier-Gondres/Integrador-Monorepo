import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { DEFAULT_PAGE_SIZE } from "@/constants/theme";

import { getHistorialCaja } from "../api/cajas.api";

export function useHistorialCaja(cajaId: string) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["caja-historial", cajaId, currentPage, rowsPerPage],
    queryFn: () => getHistorialCaja(cajaId, { page: currentPage, take: rowsPerPage }),
    enabled: !!cajaId,
  });

  const historial = data?.items ?? [];
  const total = data?.meta.total ?? 0;
  const totalPages = data?.meta.totalPages ?? 1;

  function handlePageChange(page: number) {
    setCurrentPage(page);
  }

  function handleRowsPerPageChange(rows: number) {
    setRowsPerPage(rows);
    setCurrentPage(1);
  }

  return {
    historial,
    total,
    totalPages,
    currentPage,
    rowsPerPage,
    loading: isLoading,
    fetching: isFetching,
    refetch,
    onPageChange: handlePageChange,
    onRowsPerPageChange: handleRowsPerPageChange,
  };
}
