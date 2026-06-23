"use client";

import { UserForm } from "../components/user-form";
import { useCreateUser } from "../hooks/use-create-user";
import { useUpdateUser } from "../hooks/use-update-user";
import { useUserRoles } from "../hooks/use-user-roles";
import {
  mapCreateFormValuesToDto,
  mapUpdateFormValuesToDto,
  mapUserToCreateFormValues,
  mapUserToUpdateFormValues,
} from "../mappers/user-form.mapper";
import type {
  UserFormSchema,
  UserUpdateFormSchema,
} from "../schemas/user.schema";
import type { User } from "../types/user.types";

interface UserFormModalContainerProps {
  user: User | null;
  onClose: () => void;
}

export function UserFormModalContainer({
  user,
  onClose,
}: UserFormModalContainerProps) {
  const isEditing = Boolean(user);
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const { data: roles = [], isLoading: rolesLoading } = useUserRoles();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (isEditing && user) {
    const handleUpdate = async (values: UserUpdateFormSchema) => {
      await updateMutation.mutateAsync({
        id: user.id,
        data: mapUpdateFormValuesToDto(values),
      });
      onClose();
    };

    return (
      <UserForm
        isEditing
        defaultValues={mapUserToUpdateFormValues(user)}
        isSubmitting={isSubmitting}
        userEmail={user.email}
        roles={roles}
        rolesLoading={rolesLoading}
        onSubmit={handleUpdate}
        onClose={onClose}
      />
    );
  }

  const handleCreate = async (values: UserFormSchema) => {
    await createMutation.mutateAsync(mapCreateFormValuesToDto(values));
    onClose();
  };

  return (
    <UserForm
      isEditing={false}
      defaultValues={mapUserToCreateFormValues()}
      isSubmitting={isSubmitting}
      roles={roles}
      rolesLoading={rolesLoading}
      onSubmit={handleCreate}
      onClose={onClose}
    />
  );
}
