"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { ERP_COLORS as C } from "@/constants/theme";
import { Button } from "@/shared/ui/button";
import { Input, Textarea } from "@/shared/ui/input";
import { Modal } from "@/shared/ui/modal";

import {
  type DiscountFormSchema,
  discountFormSchema,
} from "../schemas/discount.schema";

interface DiscountFormProps {
  isEditing: boolean;
  defaultValues: DiscountFormSchema;
  isSubmitting: boolean;
  onSubmit: (values: DiscountFormSchema) => void | Promise<void>;
  onClose: () => void;
  renderCategorySelector: (props: {
    selectedIds: string[];
    onChange: (ids: string[]) => void;
  }) => React.ReactNode;
  renderProductSelector: (props: {
    selectedIds: string[];
    onChange: (ids: string[]) => void;
  }) => React.ReactNode;
  renderExcludedProductSelector: (props: {
    selectedIds: string[];
    onChange: (ids: string[]) => void;
  }) => React.ReactNode;
}

export function DiscountForm({
  isEditing,
  defaultValues,
  isSubmitting,
  onSubmit,
  onClose,
  renderCategorySelector,
  renderProductSelector,
  renderExcludedProductSelector,
}: DiscountFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<DiscountFormSchema>({
    resolver: zodResolver(discountFormSchema),
    defaultValues,
  });

  return (
    <Modal
      title={isEditing ? "Editar Descuento" : "Nuevo Descuento"}
      description={
        isEditing
          ? "Modifica los atributos del descuento y sus reglas de aplicación."
          : "Completa los campos para crear un descuento con productos, categorías y exclusiones."
      }
      onClose={onClose}
      maxWidth="760px"
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
        <Input
          label="Nombre"
          required
          placeholder="Ej. 10% en Bebidas"
          error={errors.name?.message}
          {...register("name")}
        />

        <Textarea
          label="Descripción"
          placeholder="Describe la promoción o las condiciones del descuento..."
          error={errors.description?.message}
          {...register("description")}
        />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "12px" }}>
          <Input
            label="Porcentaje"
            required
            type="number"
            min="0"
            max="100"
            step="0.01"
            placeholder="Ej. 10"
            error={errors.percentage?.message}
            {...register("percentage", { valueAsNumber: true })}
          />

          <Input
            label="Fecha inicio"
            type="date"
            error={errors.startDate?.message}
            {...register("startDate")}
          />

          <Input
            label="Fecha fin"
            type="date"
            error={errors.endDate?.message}
            {...register("endDate")}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "16px", borderRadius: "10px", border: `1px solid ${C.divider}`, backgroundColor: C.tableHead }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: C.bodyText }}>Alcance del descuento</h4>
            <p style={{ margin: 0, fontSize: "12px", color: C.headText }}>Selecciona los productos o categorías a los que se aplicará el descuento.</p>
          </div>

          <Controller
            name="categoryIds"
            control={control}
            render={({ field }) =>
              renderCategorySelector({
                selectedIds: field.value ?? [],
                onChange: field.onChange,
              })
            }
          />

          <Controller
            name="productIds"
            control={control}
            render={({ field }) =>
              renderProductSelector({
                selectedIds: field.value ?? [],
                onChange: field.onChange,
              })
            }
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "16px", borderRadius: "10px", border: `1px solid ${C.divider}`, backgroundColor: C.cardBg }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: C.bodyText }}>Exclusiones</h4>
            <p style={{ margin: 0, fontSize: "12px", color: C.headText }}>
              Los productos excluidos no recibirán el descuento aunque estén dentro de una categoría aplicable.
            </p>
          </div>

          <Controller
            name="excludedProductIds"
            control={control}
            render={({ field }) =>
              renderExcludedProductSelector({
                selectedIds: field.value ?? [],
                onChange: field.onChange,
              })
            }
          />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 14px",
            backgroundColor: C.tableHead,
            borderRadius: "8px",
            border: `1px solid ${C.divider}`,
          }}
        >
          <input
            type="checkbox"
            id="discount-isActive"
            {...register("isActive")}
            style={{
              width: "16px",
              height: "16px",
              accentColor: C.primary,
              cursor: "pointer",
            }}
          />
          <label
            htmlFor="discount-isActive"
            style={{
              fontSize: "13px",
              fontWeight: 500,
              color: C.bodyText,
              cursor: "pointer",
            }}
          >
            Habilitar descuento
          </label>
        </div>

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
            Guardar Cambios
          </Button>
        </div>
      </form>
    </Modal>
  );
}