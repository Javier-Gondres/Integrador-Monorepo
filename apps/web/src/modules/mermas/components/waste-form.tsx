import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { InventoryComboboxContainer } from "@/modules/inventories/containers/inventory-combobox-container";
import type { InventoryProductOption } from "@/modules/inventories/types/inventory.types";
import { Button } from "@/shared/ui";
import { Input, Textarea } from "@/shared/ui/input";

import type {
  CreateWastePayload,
  InventoryAdjustmentReason,
} from "../types/waste.types";

const schema = z.object({
  productId: z.string().min(1, "Producto es requerido"),

  quantity: z.coerce

    .number()

    .min(0.001, "La cantidad debe ser mayor a cero")

    .refine(
      (value) => {
        const [, decimals = ""] = value.toString().split(".");

        return decimals.length <= 3;
      },

      { message: "La cantidad admite hasta 3 decimales" },
    ),

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

  onSubmit: (data: Omit<CreateWastePayload, "branchId">) => void;

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

export function WasteForm({
  branchId,

  onSubmit,

  isSubmitting,
}: WasteFormProps) {
  const [selectedProduct, setSelectedProduct] =
    useState<InventoryProductOption | null>(null);

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
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-6 space-y-6 overflow-y-auto"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-gray-700">Producto</label>

          <Controller
            control={control}
            name="productId"
            render={({ field }) => (
              <InventoryComboboxContainer
                branchId={branchId}
                selected={selectedProduct}
                onChange={(product) => {
                  field.onChange(product?.id ?? "");

                  setSelectedProduct(product);
                }}
              />
            )}
          />

          {errors.productId && (
            <p className="text-sm text-red-500">
              {errors.productId.message as string}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Cantidad</label>

          <Input
            type="number"
            step="0.001"
            min="0.001"
            placeholder="Ej: 5 o 2.5"
            {...register("quantity")}
          />

          {errors.quantity && (
            <p className="text-sm text-red-500">
              {errors.quantity.message as string}
            </p>
          )}
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

          {errors.adjustmentReason && (
            <p className="text-sm text-red-500">
              {errors.adjustmentReason.message as string}
            </p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-gray-700">Notas</label>

          <Textarea
            placeholder="Detalles adicionales..."
            {...register("notes")}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-gray-700">
            Nº de Referencia (Opcional)
          </label>

          <Input placeholder="Ej. ACTA-001" {...register("referenceNumber")} />
        </div>
      </div>

      <div className="pt-4 flex justify-end gap-2">
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Registrar Merma"}
        </Button>
      </div>
    </form>
  );
}
