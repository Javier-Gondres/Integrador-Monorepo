"use client";

import { CustomerForm } from "../components/customer-form";
import { useCreateCustomer } from "../hooks/use-create-customer";
import { useUpdateCustomer } from "../hooks/use-update-customer";
import { mapCustomerDtoToUi } from "../mappers/customer.mapper";
import {
  mapCustomerToFormValues,
  mapFormValuesToDto,
} from "../mappers/customer-form.mapper";
import type { CustomerFormSchema } from "../schemas/customer.schema";
import type { Customer } from "../types/customer.types";

interface CustomerFormModalContainerProps {
  customer: Customer | null;
  onClose: () => void;
  /** Se invoca con el cliente recién creado (solo en modo creación). */
  onCreated?: (customer: Customer) => void;
}

export function CustomerFormModalContainer({
  customer,
  onClose,
  onCreated,
}: CustomerFormModalContainerProps) {
  const isEditing = Boolean(customer);
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (values: CustomerFormSchema) => {
    const dto = mapFormValuesToDto(values);

    if (isEditing && customer) {
      await updateMutation.mutateAsync({ id: customer.id, data: dto });
    } else {
      const created = await createMutation.mutateAsync(dto);
      onCreated?.(mapCustomerDtoToUi(created));
    }

    onClose();
  };

  return (
    <CustomerForm
      customerId={customer?.id}
      isEditing={isEditing}
      defaultValues={mapCustomerToFormValues(customer)}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      onClose={onClose}
    />
  );
}
