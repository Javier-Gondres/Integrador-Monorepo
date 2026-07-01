"use client";

import { useState } from "react";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/errors";

import { RegisterReturnForm } from "../components/register-return-form";
import { useCreateReturn } from "../hooks/use-create-return";
import { useLookupSale } from "../hooks/use-lookup-sale";
import type { RegisterReturnSchema } from "../schemas/return.schema";
import type { SaleLookup } from "../types/return.types";

interface RegisterReturnModalContainerProps {
  onClose: () => void;
}

export function RegisterReturnModalContainer({
  onClose,
}: RegisterReturnModalContainerProps) {
  const [sale, setSale] = useState<SaleLookup | null>(null);
  const lookupMutation = useLookupSale();
  const createMutation = useCreateReturn();

  const handleLookup = async (ncf: string) => {
    setSale(null);
    try {
      const found = await lookupMutation.mutateAsync(ncf);
      setSale(found);
    } catch (error) {
      toast.error(getErrorMessage(error, "No se encontró la venta"));
    }
  };

  const handleSubmit = async (values: RegisterReturnSchema) => {
    if (!sale) return;

    const items = values.lineItems
      .filter((line) => line.quantityToReturn > 0)
      .map((line) => ({
        productId: line.productId,
        quantity: line.quantityToReturn,
      }));

    await createMutation.mutateAsync({
      saleId: sale.saleId,
      reason: values.reason,
      notes: values.notes?.trim() ? values.notes.trim() : undefined,
      items,
    });
    onClose();
  };

  return (
    <RegisterReturnForm
      sale={sale}
      looking={lookupMutation.isPending}
      submitting={createMutation.isPending}
      onLookup={(ncf) => void handleLookup(ncf)}
      onSubmit={handleSubmit}
      onClose={onClose}
    />
  );
}
