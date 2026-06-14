"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type ReactNode, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { ERP_COLORS as C } from "@/constants/theme";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Modal } from "@/shared/ui/modal";

import {
  type AssignProductSchema,
  assignProductSchema,
} from "../schemas/assign-product.schema";
import type { ProductOption } from "../types/supplier-product.types";
import { formatCurrency } from "../utils/format-currency";

interface AssignProductDialogProps {
  supplierName: string;
  isSubmitting: boolean;
  onSubmit: (values: AssignProductSchema) => void | Promise<void>;
  onClose: () => void;
  renderProductCombobox: (props: {
    selected: ProductOption | null;
    onChange: (product: ProductOption | null) => void;
  }) => ReactNode;
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label style={{ fontSize: "13px", fontWeight: 600, color: C.bodyText }}>
      {children}
    </label>
  );
}

function ReadonlyBox({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: "42px",
        display: "flex",
        alignItems: "center",
        padding: "0 14px",
        border: `1px solid ${C.inputBorder}`,
        borderRadius: "8px",
        backgroundColor: C.tableHead,
        fontSize: "14px",
        color: C.bodyText,
      }}
    >
      {children}
    </div>
  );
}

function ReadonlyField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <FieldLabel>{label}</FieldLabel>
      <ReadonlyBox>{children}</ReadonlyBox>
    </div>
  );
}

export function AssignProductDialog({
  supplierName,
  isSubmitting,
  onSubmit,
  onClose,
  renderProductCombobox,
}: AssignProductDialogProps) {
  const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(
    null,
  );

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AssignProductSchema>({
    resolver: zodResolver(assignProductSchema),
    defaultValues: { productId: "", lastCost: "" },
  });

  return (
    <Modal
      title="Asignar producto"
      description={`Agrega un producto al catálogo de ${supplierName}.`}
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
            Producto <span style={{ color: C.danger }}>*</span>
          </FieldLabel>
          <Controller
            name="productId"
            control={control}
            render={({ field }) =>
              renderProductCombobox({
                selected: selectedProduct,
                onChange: (product) => {
                  field.onChange(product?.id ?? "");
                  setSelectedProduct(product);
                },
              }) as React.ReactElement
            }
          />
          {errors.productId && (
            <span style={{ fontSize: "12px", color: C.danger }}>
              {errors.productId.message}
            </span>
          )}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          <ReadonlyField label="Código">
            <span
              style={{
                color: selectedProduct ? C.bodyText : C.mutedText,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {selectedProduct?.code ?? "—"}
            </span>
          </ReadonlyField>

          <ReadonlyField label="Precio de venta">
            <span
              style={{
                fontWeight: 600,
                color: selectedProduct ? C.bodyText : C.mutedText,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {selectedProduct ? formatCurrency(selectedProduct.price) : "—"}
            </span>
          </ReadonlyField>
        </div>

        <Input
          label="Último costo"
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          error={errors.lastCost?.message}
          {...register("lastCost")}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <FieldLabel>Estado del producto</FieldLabel>
          <div
            style={{ display: "flex", alignItems: "center", minHeight: "30px" }}
          >
            {selectedProduct ? (
              selectedProduct.isActive ? (
                <Badge variant="success">Activo</Badge>
              ) : (
                <Badge variant="muted">Inactivo</Badge>
              )
            ) : (
              <span style={{ color: C.mutedText }}>—</span>
            )}
          </div>
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
          <Button type="submit" disabled={isSubmitting || !selectedProduct}>
            Asignar producto
          </Button>
        </div>
      </form>
    </Modal>
  );
}
