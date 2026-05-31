"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { ERP_COLORS as C } from "@/constants/theme";
import { Button } from "@/shared/ui/button";
import { Input, Textarea } from "@/shared/ui/input";
import { Modal } from "@/shared/ui/modal";

import {
  type ProductFormSchema,
  productFormSchema,
} from "../schemas/product.schema";

interface ProductFormProps {
  isEditing: boolean;
  defaultValues: ProductFormSchema;
  isSubmitting: boolean;
  onSubmit: (values: ProductFormSchema) => void | Promise<void>;
  onClose: () => void;
  renderCategoryCombobox: (props: {
    value: string[];
    onChange: (ids: string[]) => void;
  }) => React.ReactNode;
}

export function ProductForm({
  isEditing,
  defaultValues,
  isSubmitting,
  onSubmit,
  onClose,
  renderCategoryCombobox,
}: ProductFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormSchema>({
    resolver: zodResolver(productFormSchema),
    defaultValues,
  });

  return (
    <Modal
      title={isEditing ? "Editar Producto" : "Nuevo Producto"}
      description={
        isEditing
          ? "Modifica los atributos del producto."
          : "Completa los campos para añadir un nuevo producto."
      }
      onClose={onClose}
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
          label="Código (SKU)"
          required
          placeholder="Ej. MOUSE-M185"
          error={errors.code?.message}
          {...register("code")}
        />

        <Input
          label="Nombre"
          required
          placeholder="Ej. Mouse Logitech M185"
          error={errors.name?.message}
          {...register("name")}
        />

        <Textarea
          label="Descripción"
          placeholder="Breve descripción del producto..."
          error={errors.description?.message}
          {...register("description")}
        />

        <Input
          label="Precio"
          required
          type="number"
          min="0"
          step="0.01"
          placeholder="Ej. 999.99"
          error={errors.price?.message}
          {...register("price", { valueAsNumber: true })}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label
            style={{ fontSize: "13px", fontWeight: 600, color: C.bodyText }}
          >
            Categorías
          </label>
          <Controller
            name="categoryIds"
            control={control}
            render={({ field }) => (
              <>
                {renderCategoryCombobox({
                  value: field.value ?? [],
                  onChange: field.onChange,
                })}
              </>
            )}
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
            id="product-isActive"
            {...register("isActive")}
            style={{
              width: "16px",
              height: "16px",
              accentColor: C.primary,
              cursor: "pointer",
            }}
          />
          <label
            htmlFor="product-isActive"
            style={{
              fontSize: "13px",
              fontWeight: 500,
              color: C.bodyText,
              cursor: "pointer",
            }}
          >
            Habilitar producto
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
