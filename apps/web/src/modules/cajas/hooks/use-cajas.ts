import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { closeShift } from "../api/close-shift";
import { createCaja } from "../api/create-caja";
import { getCajas } from "../api/get-cajas";
import { openShift } from "../api/open-shift";
import type {
  AbrirTurnoPayload,
  CerrarTurnoPayload,
} from "../types/caja.types";

export function useCajas(branchId?: string) {
  const queryClient = useQueryClient();

  const queryKey = ["cajas", branchId];

  const { data: cajas = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => getCajas(branchId),
  });

  const crearMutation = useMutation({
    mutationFn: (payload: { name: string; branchId?: string }) =>
      createCaja(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cajas"] });
      toast.success("Caja creada correctamente");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Error al crear la caja");
    },
  });

  const abrirMutation = useMutation({
    mutationFn: (payload: AbrirTurnoPayload) => {
      const { cajaId, ...rest } = payload;
      return openShift(cajaId, rest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cajas"] });
      toast.success("Turno abierto correctamente");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Error al abrir el turno");
    },
  });

  const cerrarMutation = useMutation({
    mutationFn: (payload: CerrarTurnoPayload & { cajaId: string }) => {
      const { cajaId, turnoId, montoCierre } = payload;
      return closeShift(cajaId, turnoId, { montoCierre });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cajas"] });
      toast.success("Turno cerrado correctamente");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Error al cerrar el turno");
    },
  });

  return {
    cajas,
    loading:
      isLoading ||
      abrirMutation.isPending ||
      cerrarMutation.isPending ||
      crearMutation.isPending,
    abrirTurno: (payload: AbrirTurnoPayload) => abrirMutation.mutate(payload),
    cerrarTurno: (payload: CerrarTurnoPayload & { cajaId: string }) =>
      cerrarMutation.mutate(payload),
    crearCaja: (payload: { name: string; branchId?: string }) =>
      crearMutation.mutate(payload),
  };
}
