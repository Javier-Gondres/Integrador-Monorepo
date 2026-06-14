"use client";

import { CustomerForm } from "../components/customer-form";
import { useCreateCustomer } from "../hooks/use-create-customer";
import { useUpdateCustomer } from "../hooks/use-update-customer";
import {
  mapCustomerToFormValues,
  mapFormValuesToDto,
} from "../mappers/customer-form.mapper";
import type { CustomerFormSchema } from "../schemas/customer.schema";
import type { Customer } from "../types/customer.types";

interface CustomerFormModalContainerProps {
  customer: Customer | null;
  onClose: () => void;
}

export function CustomerFormModalContainer({
  customer,
  onClose,
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
      await createMutation.mutateAsync(dto);
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
