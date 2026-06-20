"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type ReactNode, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { ERP_COLORS as C } from "@/constants/theme";
import { BranchSelect } from "@/modules/branches/components/branch-select";
import type { BranchListItem } from "@/modules/branches/types/branch.types";
import type { InventoryProductOption } from "@/modules/inventories/types/inventory.types";
import { Button } from "@/shared/ui/button";
import { Input, Textarea } from "@/shared/ui/input";
import { Modal } from "@/shared/ui/modal";

import { ADJUSTMENT_REASON_OPTIONS } from "../constants";
import {
  type AdjustmentFormSchema,
  adjustmentFormSchema,
} from "../schemas/adjustment-form.schema";

interface AdjustmentFormProps {
  defaultBranchId: string;
  branches: BranchListItem[];
  branchesLoading: boolean;
  isSubmitting: boolean;
  onSubmit: (values: AdjustmentFormSchema) => void | Promise<void>;
  onClose: () => void;
  renderProductCombobox: (props: {
    selected: InventoryProductOption | null;
    onChange: (product: InventoryProductOption | null) => void;
  }) => ReactNode;
}

const selectStyle: React.CSSProperties = {
  height: "42px",
  padding: "0 14px",
  border: `1px solid ${C.inputBorder}`,
  borderRadius: "8px",
  fontSize: "14px",
  color: C.bodyText,
  backgroundColor: C.cardBg,
  outline: "none",
  width: "100%",
};

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label style={{ fontSize: "13px", fontWeight: 600, color: C.bodyText }}>
      {children}
    </label>
  );
}

export function AdjustmentForm({
  defaultBranchId,
  branches,
  branchesLoading,
  isSubmitting,
  onSubmit,
  onClose,
  renderProductCombobox,
}: AdjustmentFormProps) {
  const [selectedProduct, setSelectedProduct] =
    useState<InventoryProductOption | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AdjustmentFormSchema>({
    resolver: zodResolver(adjustmentFormSchema),
    defaultValues: {
      branchId: defaultBranchId,
      productId: "",
      adjustmentReason: undefined,
      notes: "",
    },
  });

  return (
    <Modal
      title="Registrar ajuste de inventario"
      description="Corrige el stock de un producto por diferencia de conteo u otro motivo."
      onClose={onClose}
      maxWidth="520px"
    >
      <form
        onSubmit={(e) => void handleSubmit(onSubmit)(e)}
        style={{
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <FieldLabel>
            Sucursal <span style={{ color: C.danger }}>*</span>
          </FieldLabel>
          <Controller
            name="branchId"
            control={control}
            render={({ field }) => (
              <BranchSelect
                branches={branches}
                value={field.value}
                loading={branchesLoading}
                onChange={field.onChange}
              />
            )}
          />
          {errors.branchId && (
            <span style={{ fontSize: "12px", color: C.danger }}>
              {errors.branchId.message}
            </span>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <FieldLabel>
            Producto <span style={{ color: C.danger }}>*</span>
          </FieldLabel>
          <Controller
            name="productId"
            control={control}
            render={({ field }) => (
              <>
                {renderProductCombobox({
                  selected: selectedProduct,
                  onChange: (product) => {
                    field.onChange(product?.id ?? "");
                    setSelectedProduct(product);
                  },
                })}
              </>
            )}
          />
          {errors.productId && (
            <span style={{ fontSize: "12px", color: C.danger }}>
              {errors.productId.message}
            </span>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <FieldLabel>
            Razón de ajuste <span style={{ color: C.danger }}>*</span>
          </FieldLabel>
          <select
            aria-label="Razón de ajuste"
            style={selectStyle}
            defaultValue=""
            {...register("adjustmentReason")}
          >
            <option value="" disabled>
              Selecciona una razón...
            </option>
            {ADJUSTMENT_REASON_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors.adjustmentReason && (
            <span style={{ fontSize: "12px", color: C.danger }}>
              {errors.adjustmentReason.message}
            </span>
          )}
        </div>

        <Input
          label="Cantidad afectada"
          required
          type="number"
          step="any"
          placeholder="Ej: 5 o -3"
          title="Positivo si se encontró stock de más, negativo si falta stock"
          error={errors.quantity?.message}
          {...register("quantity", { valueAsNumber: true })}
        />

        <Textarea
          label="Notas"
          placeholder="Detalle del ajuste (opcional)"
          error={errors.notes?.message}
          {...register("notes")}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            paddingTop: "6px",
            borderTop: `1px solid ${C.divider}`,
          }}
        >
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            Registrar ajuste
          </Button>
        </div>
      </form>
    </Modal>
  );
}
