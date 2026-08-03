"use client";

import { TenantRole } from "@repo/shared";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/errors";
import { usePermissions } from "@/modules/auth";

import { getUser } from "../api/get-user";
import { transferOwnership } from "../api/transfer-ownership";
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
import type { PermissionInfo, User } from "../types/user.types";

interface UserFormModalContainerProps {
  user: User | null;
  onClose: () => void;
}

export function UserFormModalContainer({
  user,
  onClose,
}: UserFormModalContainerProps) {
  const { roleName: actorRoleName } = usePermissions();
  const isEditing = Boolean(user);
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const { data: roles = [], isLoading: rolesLoading } = useUserRoles();
  const [permissions, setPermissions] = useState<PermissionInfo[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const targetRoleName = user?.roleName ?? "";
  const isTargetOwner = targetRoleName === TenantRole.OWNER;
  const canTransferOwnership = Boolean(
    actorRoleName === TenantRole.OWNER && isEditing && user && !isTargetOwner,
  );

  useEffect(() => {
    if (!user) {
      setPermissions([]);
      return;
    }

    setDetailLoading(true);
    void getUser(user.id)
      .then((detail) => setPermissions(detail.permissions))
      .catch((error) =>
        toast.error(
          getErrorMessage(error, "No se pudieron cargar los permisos"),
        ),
      )
      .finally(() => setDetailLoading(false));
  }, [user]);

  if (isEditing && user) {
    const handleUpdate = async (values: UserUpdateFormSchema) => {
      await updateMutation.mutateAsync({
        id: user.id,
        data: mapUpdateFormValuesToDto(values),
      });
      onClose();
    };

    const handleTransferOwnership = async () => {
      if (
        !confirm(
          "¿Transferir la propiedad de la empresa a este usuario? Tú pasarás automáticamente a ADMIN.",
        )
      ) {
        return;
      }

      setIsTransferring(true);
      try {
        await transferOwnership(user.id);
        toast.success("Propiedad transferida correctamente");
        onClose();
      } catch (error) {
        toast.error(
          getErrorMessage(error, "No se pudo transferir la propiedad"),
        );
      } finally {
        setIsTransferring(false);
      }
    };

    return (
      <UserForm
        isEditing
        defaultValues={mapUserToUpdateFormValues(user)}
        isSubmitting={isSubmitting}
        userEmail={user.email}
        roles={roles}
        rolesLoading={rolesLoading}
        permissions={permissions}
        permissionsLoading={detailLoading}
        isTargetOwner={isTargetOwner}
        canTransferOwnership={canTransferOwnership}
        isTransferring={isTransferring}
        onTransferOwnership={() => void handleTransferOwnership()}
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
