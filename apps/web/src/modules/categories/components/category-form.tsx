"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { ERP_COLORS as C } from "@/constants/theme";
import { Button } from "@/shared/ui/button";
import { Input, Textarea } from "@/shared/ui/input";
import { Modal } from "@/shared/ui/modal";

import {
  type CategoryFormSchema,
  categoryFormSchema,
} from "../schemas/category.schema";

interface CategoryFormProps {
  isEditing: boolean;
  defaultValues: CategoryFormSchema;
  isSubmitting: boolean;
  onSubmit: (values: CategoryFormSchema) => void | Promise<void>;
  onClose: () => void;
}

export function CategoryForm({
  isEditing,
  defaultValues,
  isSubmitting,
  onSubmit,
  onClose,
}: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormSchema>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues,
  });

  return (
    <Modal
      title={isEditing ? "Editar Categoría" : "Nueva Categoría"}
      description={
        isEditing
          ? "Modifica los atributos de la categoría."
          : "Completa los campos para añadir una nueva categoría."
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
          label="Nombre"
          required
          maxLength={100}
          placeholder="Ej. Tecnología, Alimentos..."
          error={errors.name?.message}
          {...register("name")}
        />

        <Textarea
          label="Descripción"
          maxLength={500}
          placeholder="Breve descripción de los elementos de esta categoría..."
          error={errors.description?.message}
          {...register("description")}
        />

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
            id="category-isActive"
            {...register("isActive")}
            style={{
              width: "16px",
              height: "16px",
              accentColor: C.primary,
              cursor: "pointer",
            }}
          />
          <label
            htmlFor="category-isActive"
            style={{
              fontSize: "13px",
              fontWeight: 500,
              color: C.bodyText,
              cursor: "pointer",
            }}
          >
            Habilitar categoría
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
