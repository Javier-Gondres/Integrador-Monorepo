"use client";

import { EmployeeForm } from "../components/employee-form";
import { useCreateEmployee } from "../hooks/use-create-employee";
import { useEmployeeBranches } from "../hooks/use-employee-branches";
import { useEmployeeRoles } from "../hooks/use-employee-roles";
import { useUpdateEmployee } from "../hooks/use-update-employee";
import {
  mapCreateFormValuesToDto,
  mapEmployeeToCreateFormValues,
  mapEmployeeToUpdateFormValues,
  mapUpdateFormValuesToDto,
} from "../mappers/employee-form.mapper";
import type { EmployeeFormSchema } from "../schemas/employee.schema";
import type { EmployeeUpdateFormSchema } from "../schemas/employee.schema";
import type { Employee } from "../types/employee.types";

interface EmployeeFormModalContainerProps {
  employee: Employee | null;
  onClose: () => void;
}

export function EmployeeFormModalContainer({
  employee,
  onClose,
}: EmployeeFormModalContainerProps) {
  const isEditing = Boolean(employee);
  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();
  const { data: branches = [], isLoading: branchesLoading } =
    useEmployeeBranches();
  const { data: roles = [], isLoading: rolesLoading } = useEmployeeRoles();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (isEditing && employee) {
    const handleUpdate = async (values: EmployeeUpdateFormSchema) => {
      await updateMutation.mutateAsync({
        id: employee.id,
        data: mapUpdateFormValuesToDto(values),
      });
      onClose();
    };

    return (
      <EmployeeForm
        isEditing
        defaultValues={mapEmployeeToUpdateFormValues(employee)}
        isSubmitting={isSubmitting}
        branches={branches}
        branchesLoading={branchesLoading}
        userEmail={employee.userEmail}
        onSubmit={handleUpdate}
        onClose={onClose}
      />
    );
  }

  const handleCreate = async (values: EmployeeFormSchema) => {
    await createMutation.mutateAsync(mapCreateFormValuesToDto(values));
    onClose();
  };

  return (
    <EmployeeForm
      isEditing={false}
      defaultValues={mapEmployeeToCreateFormValues()}
      isSubmitting={isSubmitting}
      branches={branches}
      branchesLoading={branchesLoading}
      roles={roles}
      rolesLoading={rolesLoading}
      onSubmit={handleCreate}
      onClose={onClose}
    />
  );
}
