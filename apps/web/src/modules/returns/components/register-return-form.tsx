"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import { ERP_COLORS as C } from "@/constants/theme";
import { Button } from "@/shared/ui/button";
import { Input, Textarea } from "@/shared/ui/input";
import { Modal } from "@/shared/ui/modal";

import { RETURN_REASON_LABELS, RETURN_REASON_VALUES } from "../constants";
import {
  type RegisterReturnSchema,
  registerReturnSchema,
} from "../schemas/return.schema";
import type { SaleLookup } from "../types/return.types";
import { formatCurrency, formatDate } from "../utils/format";

interface RegisterReturnFormProps {
  sale: SaleLookup | null;
  looking: boolean;
  submitting: boolean;
  onLookup: (ncf: string) => void;
  onSubmit: (values: RegisterReturnSchema) => void | Promise<void>;
  onClose: () => void;
}

export function RegisterReturnForm({
  sale,
  looking,
  submitting,
  onLookup,
  onSubmit,
  onClose,
}: RegisterReturnFormProps) {
  const [ncf, setNcf] = useState("");

  const {
    register,
    control,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<RegisterReturnSchema>({
    resolver: zodResolver(registerReturnSchema),
    defaultValues: { reason: "DEFECTIVE", notes: "", lineItems: [] },
  });

  const { fields, replace } = useFieldArray({ control, name: "lineItems" });

  useEffect(() => {
    replace(
      sale
        ? sale.items.map((item) => ({
            productId: item.productId,
            quantityToReturn: 0,
          }))
        : [],
    );
  }, [sale, replace]);

  const watchedItems = watch("lineItems");
  const runningTotal = sale
    ? sale.items.reduce((sum, item, index) => {
        const qty = Number(watchedItems?.[index]?.quantityToReturn) || 0;
        return sum + qty * item.unitPrice;
      }, 0)
    : 0;

  const lineItemsError =
    errors.lineItems?.root?.message ?? errors.lineItems?.message;

  const handleLookup = () => {
    const trimmed = ncf.trim();
    if (trimmed) onLookup(trimmed);
  };

  const submit = handleSubmit((values) => {
    let hasError = false;
    values.lineItems.forEach((line, index) => {
      const max = sale?.items[index]?.quantityReturnable ?? 0;
      if (line.quantityToReturn > max) {
        setError(`lineItems.${index}.quantityToReturn`, {
          message: `Máximo ${max}`,
        });
        hasError = true;
      }
    });
    if (hasError) return;
    void onSubmit(values);
  });

  return (
    <Modal
      title="Registrar devolución"
      description="Busca la venta por su NCF y selecciona los productos a devolver."
      onClose={onClose}
      maxWidth="720px"
    >
      <div
        style={{
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          overflowY: "auto",
        }}
      >
        {/* Paso 1: búsqueda por NCF */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: "10px" }}>
          <div style={{ flex: 1 }}>
            <Input
              label="NCF de la venta"
              placeholder="Ej. B0200000001"
              value={ncf}
              onChange={(e) => setNcf(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleLookup();
                }
              }}
            />
          </div>
          <Button
            variant="secondary"
            onClick={handleLookup}
            disabled={looking || !ncf.trim()}
            style={{ height: "42px" }}
          >
            <Search style={{ width: "16px", height: "16px" }} />
            {looking ? "Buscando..." : "Buscar"}
          </Button>
        </div>

        {/* Paso 2: detalle de la venta + productos a devolver */}
        {sale && (
          <form
            onSubmit={(e) => void submit(e)}
            style={{ display: "flex", flexDirection: "column", gap: "18px" }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "12px",
                padding: "12px 14px",
                backgroundColor: C.tableHead,
                borderRadius: "8px",
                border: `1px solid ${C.divider}`,
              }}
            >
              <SummaryItem label="NCF venta" value={sale.ncf ?? "—"} />
              <SummaryItem label="Sucursal" value={sale.branch.name} />
              <SummaryItem
                label="Cliente"
                value={sale.customerName ?? "Consumidor final"}
              />
              <SummaryItem label="Fecha" value={formatDate(sale.createdAt)} />
              <SummaryItem
                label="Total venta"
                value={formatCurrency(sale.total)}
              />
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              <label
                htmlFor="return-reason"
                style={{ fontSize: "13px", fontWeight: 600, color: C.bodyText }}
              >
                Motivo de la devolución{" "}
                <span style={{ color: C.danger }}>*</span>
              </label>
              <select
                id="return-reason"
                {...register("reason")}
                style={{
                  height: "42px",
                  padding: "0 14px",
                  border: `1px solid ${C.inputBorder}`,
                  borderRadius: "8px",
                  fontSize: "14px",
                  color: C.bodyText,
                  backgroundColor: C.cardBg,
                  outline: "none",
                }}
              >
                {RETURN_REASON_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {RETURN_REASON_LABELS[value]}
                  </option>
                ))}
              </select>
            </div>

            {/* Productos */}
            <div
              style={{
                border: `1px solid ${C.divider}`,
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr 1.2fr",
                  gap: "8px",
                  padding: "10px 14px",
                  backgroundColor: C.tableHead,
                  fontSize: "12px",
                  fontWeight: 600,
                  color: C.headText,
                }}
              >
                <span>Producto</span>
                <span style={{ textAlign: "center" }}>Disponible</span>
                <span style={{ textAlign: "right" }}>Precio</span>
                <span style={{ textAlign: "center" }}>Devolver</span>
              </div>

              {fields.map((field, index) => {
                const item = sale.items[index];
                if (!item) return null;
                const disabled = item.quantityReturnable <= 0;
                return (
                  <div
                    key={field.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "2fr 1fr 1fr 1.2fr",
                      gap: "8px",
                      alignItems: "center",
                      padding: "10px 14px",
                      borderTop: `1px solid ${C.divider}`,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: C.bodyText }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: "12px", color: C.mutedText }}>
                        {item.code}
                      </div>
                    </div>
                    <span
                      style={{
                        textAlign: "center",
                        color: C.headText,
                        fontSize: "14px",
                      }}
                    >
                      {item.quantityReturnable}
                    </span>
                    <span
                      style={{
                        textAlign: "right",
                        color: C.headText,
                        fontSize: "14px",
                      }}
                    >
                      {formatCurrency(item.unitPrice)}
                    </span>
                    <Input
                      type="number"
                      min={0}
                      max={item.quantityReturnable}
                      step="any"
                      disabled={disabled}
                      placeholder="0"
                      error={
                        errors.lineItems?.[index]?.quantityToReturn?.message
                      }
                      {...register(`lineItems.${index}.quantityToReturn`, {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                );
              })}
            </div>
            {lineItemsError && (
              <span style={{ fontSize: "12px", color: C.danger }}>
                {lineItemsError}
              </span>
            )}

            <Textarea
              label="Notas"
              placeholder="Detalles adicionales de la devolución..."
              error={errors.notes?.message}
              {...register("notes")}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: "6px",
                borderTop: `1px solid ${C.divider}`,
              }}
            >
              <span
                style={{ fontSize: "14px", fontWeight: 600, color: C.headText }}
              >
                Total a devolver
              </span>
              <span
                style={{ fontSize: "18px", fontWeight: 700, color: C.primary }}
              >
                {formatCurrency(runningTotal)}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <Button variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Registrando..." : "Registrar devolución"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
      <span style={{ fontSize: "11px", color: C.mutedText }}>{label}</span>
      <span style={{ fontSize: "13px", fontWeight: 600, color: C.bodyText }}>
        {value}
      </span>
    </div>
  );
}
