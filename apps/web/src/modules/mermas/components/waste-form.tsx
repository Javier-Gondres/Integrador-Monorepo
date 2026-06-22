import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { useInfiniteInventories } from "@/modules/inventories/hooks/use-infinite-inventories";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";
import { AsyncCombobox, Button } from "@/shared/ui";
import { Input, Textarea } from "@/shared/ui/input";

import type { CreateWastePayload, InventoryAdjustmentReason } from "../types/waste.types";

const schema = z.object({
  productId: z.string().min(1, "Producto es requerido"),
  quantity: z.coerce.number().int("La cantidad debe ser un número entero").min(1, "La cantidad debe ser al menos 1"),
  adjustmentReason: z.enum([
    "DAMAGE",
    "THEFT",
    "EXPIRED",
    "COUNT_DIFFERENCE",
    "INTERNAL_USE",
    "OTHER",
  ]),
  notes: z.string().optional(),
  referenceNumber: z.string().optional(),
});

interface WasteFormProps {
  branchId: string;
  onSubmit: (data: CreateWastePayload) => void;
  isSubmitting?: boolean;
}

const REASON_OPTIONS = [
  { value: "DAMAGE", label: "Dañado" },
  { value: "THEFT", label: "Robo" },
  { value: "EXPIRED", label: "Vencido" },
  { value: "INTERNAL_USE", label: "Consumo Interno" },
  { value: "COUNT_DIFFERENCE", label: "Diferencia de Conteo" },
  { value: "OTHER", label: "Otro" },
];

export function WasteForm({ branchId, onSubmit, isSubmitting }: WasteFormProps) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);

  // Cargamos los productos con scroll infinito y filtrado de búsqueda
  const {
    data: inventoriesData,
    isLoading: isLoadingInventories,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteInventories({
    branchId,
    search: debouncedSearch,
    take: 20,
  });

  const inventories = inventoriesData?.pages.flatMap((page) => page.items) ?? [];

  // Mapeamos a AsyncComboboxOption
  const options = inventories.map((inv: any) => ({
    id: inv.productId,
    name: inv.name,
    description: `Stock actual: ${inv.quantity}`,
  }));

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      productId: "",
      quantity: 0,
      adjustmentReason: "DAMAGE" as InventoryAdjustmentReason,
      notes: "",
      referenceNumber: "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6 overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Producto - Toma ambas columnas si se desea, o una. Lo dejamos en 1 col completa para mejor lectura */}
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-gray-700">Producto</label>
          <Controller
            control={control}
            name="productId"
            render={({ field }) => (
              <AsyncCombobox
                value={field.value}
                onChange={field.onChange}
                onSearchChange={setSearch}
                options={options}
                isLoading={isLoadingInventories && !isFetchingNextPage}
                hasNextPage={hasNextPage}
                fetchNextPage={fetchNextPage}
                isFetchingNextPage={isFetchingNextPage}
                placeholder="Busca y selecciona un producto..."
              />
            )}
          />
          {errors.productId && <p className="text-sm text-red-500">{errors.productId.message as string}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Cantidad</label>
          <Input
            type="number"
            step="1"
            placeholder="Ej: 5"
            {...register("quantity")}
          />
          {errors.quantity && <p className="text-sm text-red-500">{errors.quantity.message as string}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Motivo</label>
          <select
            {...register("adjustmentReason")}
            className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {REASON_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors.adjustmentReason && <p className="text-sm text-red-500">{errors.adjustmentReason.message as string}</p>}
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-gray-700">Notas</label>
          <Textarea
            placeholder="Detalles adicionales..."
            {...register("notes")}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-gray-700">Nº de Referencia (Opcional)</label>
          <Input
            placeholder="Ej. ACTA-001"
            {...register("referenceNumber")}
          />
        </div>
      </div>

      <div className="pt-4 flex justify-end gap-2">
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Guardando..." : "Registrar Merma"}
        </Button>
      </div>
    </form>
  );
}
