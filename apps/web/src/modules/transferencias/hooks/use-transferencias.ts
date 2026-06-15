import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { DEFAULT_PAGE_SIZE } from "@/constants/theme";
import { getBranchesForSelect } from "@/modules/employees/api/get-branches";
import { getInventories } from "@/modules/inventories/api/get-inventories";

import {
  cancelarTransferencia,
  completarTransferencia,
  crearTransferencia,
  despacharTransferencia,
  getStock,
  getTransferencias,
} from "../api/transferencias.api";
import type { CrearTransferenciaPayload, TransferStatus } from "../types/transferencia.types";

export function useTransferencias(origenId?: string) {
  const queryClient = useQueryClient();

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [statusFilter, setStatusFilter] = useState<TransferStatus | undefined>();

  // Queries
  const { data: sucursales = [] } = useQuery({
    queryKey: ["branches-for-select"],
    queryFn: getBranchesForSelect,
  });

  const { data: inventarioResponse } = useQuery({
    queryKey: ["inventory-for-transfers", origenId],
    queryFn: () => getInventories({ branchId: origenId, take: 50 }),
    enabled: !!origenId,
  });
  const productos = inventarioResponse?.items.map((i) => ({
    id: i.product.id,
    name: i.product.name,
    code: i.product.code,
  })) ?? [];

  const { data: transferenciasResponse, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["transferencias", currentPage, rowsPerPage, statusFilter],
    queryFn: () => getTransferencias({ page: currentPage, take: rowsPerPage, status: statusFilter }),
  });

  // Mutations
  const crearMutation = useMutation({
    mutationFn: (payload: CrearTransferenciaPayload) => crearTransferencia(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transferencias"] });
      toast.success("Transferencia creada con éxito");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Error al crear la transferencia");
    },
  });

  const despacharMutation = useMutation({
    mutationFn: (id: string) => despacharTransferencia(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transferencias"] });
      toast.success("Transferencia despachada");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Error al despachar la transferencia");
    },
  });

  const completarMutation = useMutation({
    mutationFn: (id: string) => completarTransferencia(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transferencias"] });
      toast.success("Transferencia completada (stock actualizado)");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Error al completar la transferencia");
    },
  });

  const cancelarMutation = useMutation({
    mutationFn: (id: string) => cancelarTransferencia(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transferencias"] });
      toast.success("Transferencia cancelada");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Error al cancelar la transferencia");
    },
  });

  const fetchStock = async (branchId: string, productId: string) => {
    try {
      const res = await getStock(branchId, productId);
      return res.quantity;
    } catch {
      return 0;
    }
  };

  return {
    transferencias: transferenciasResponse?.items ?? [],
    total: transferenciasResponse?.meta.total ?? 0,
    totalPages: transferenciasResponse?.meta.totalPages ?? 1,
    currentPage,
    rowsPerPage,
    statusFilter,
    sucursales,
    productos,
    loading: isLoading,
    fetching: isFetching,
    refetch,
    onPageChange: setCurrentPage,
    onRowsPerPageChange: (rows: number) => {
      setRowsPerPage(rows);
      setCurrentPage(1);
    },
    onStatusFilterChange: (status: TransferStatus | undefined) => {
      setStatusFilter(status);
      setCurrentPage(1);
    },
    crearTransferencia: (payload: CrearTransferenciaPayload) => crearMutation.mutate(payload),
    isCreating: crearMutation.isPending,
    despacharTransferencia: (id: string) => despacharMutation.mutate(id),
    completarTransferencia: (id: string) => completarMutation.mutate(id),
    cancelarTransferencia: (id: string) => cancelarMutation.mutate(id),
    isMutating: despacharMutation.isPending || completarMutation.isPending || cancelarMutation.isPending,
    fetchStock,
  };
}
