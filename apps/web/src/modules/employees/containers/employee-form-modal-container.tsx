"use client";

import { TenantRole } from "@repo/shared";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/errors";
import { usePermissions } from "@/modules/auth";
import { useAuthStore } from "@/modules/auth/store/auth-store";
import { transferOwnership } from "@/modules/users/api/transfer-ownership";
import { userKeys } from "@/modules/users/query-keys";
import { filterAssignableRoleOptions } from "@/shared/auth/assignable-roles";

import { upsertLaborProfile } from "../api/upsert-labor-profile";
import { EmployeeForm } from "../components/employee-form";
import { useCreateEmployee } from "../hooks/use-create-employee";
import { useEmployeeBranches } from "../hooks/use-employee-branches";
import { useEmployeeRoles } from "../hooks/use-employee-roles";
import { useUpdateEmployee } from "../hooks/use-update-employee";
import {
  formatMemberJoinDate,
  mapCreateFormValuesToDto,
  mapEmployeeToCreateFormValues,
  mapMemberToUpdateFormValues,
  mapUpdateFormValuesToDto,
  resolveMemberJoinDate,
} from "../mappers/employee-form.mapper";
import { employeeKeys } from "../query-keys";
import type {
  EmployeeFormSchema,
  EmployeeUpdateFormSchema,
} from "../schemas/employee.schema";
import type { CompanyMember } from "../types/company-member.types";

interface EmployeeFormModalContainerProps {
  member: CompanyMember | null;
  onClose: () => void;
}

export function EmployeeFormModalContainer({
  member,
  onClose,
}: EmployeeFormModalContainerProps) {
  const queryClient = useQueryClient();
  const { roleName: actorRoleName } = usePermissions();
  const actorUserId = useAuthStore((state) => state.user?.id);
  const [isTransferring, setIsTransferring] = useState(false);
  const isEditing = Boolean(member);
  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();
  const { data: branches = [], isLoading: branchesLoading } =
    useEmployeeBranches();
  const { data: roles = [], isLoading: rolesLoading } = useEmployeeRoles();
  const assignableRoles = filterAssignableRoleOptions(roles, actorRoleName);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (isEditing && member) {
    const isTargetOwner = member.roleName === TenantRole.OWNER;
    const isSelf = actorUserId === member.userId;
    const canChangeRole = !isSelf && !isTargetOwner;
    const hasEmployeeRecord = Boolean(member.employeeId);
    const canTransferOwnership = Boolean(
      actorRoleName === TenantRole.OWNER && !isTargetOwner && !isSelf,
    );

    const handleUpdate = async (values: EmployeeUpdateFormSchema) => {
      if (hasEmployeeRecord && member.employeeId) {
        const data = mapUpdateFormValuesToDto(values);
        if (!canChangeRole) {
          delete data.roleId;
        }
        await updateMutation.mutateAsync({
          id: member.employeeId,
          data,
        });
      } else {
        await upsertLaborProfile(member.userId, {
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          branchId: values.branchId?.trim() ?? "",
          phone: values.phone?.trim() || undefined,
          position: values.position?.trim() || undefined,
          salary: values.salary ? Number(values.salary) : undefined,
          ...(canChangeRole && values.roleId ? { roleId: values.roleId } : {}),
        });
        await queryClient.invalidateQueries({ queryKey: userKeys.all });
        await queryClient.invalidateQueries({ queryKey: employeeKeys.all });
      }

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
        await transferOwnership(member.userId);
        toast.success("Propiedad transferida correctamente");
        await queryClient.invalidateQueries({ queryKey: userKeys.all });
        await queryClient.invalidateQueries({ queryKey: employeeKeys.all });
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
      <EmployeeForm
        isEditing
        defaultValues={mapMemberToUpdateFormValues(member, branches)}
        isSubmitting={isSubmitting}
        branches={branches}
        branchesLoading={branchesLoading}
        roles={assignableRoles}
        rolesLoading={rolesLoading}
        userEmail={member.email}
        memberRoleLabel={member.roleLabel}
        requiresLaborProfile
        canChangeRole={canChangeRole}
        isTargetOwner={isTargetOwner}
        joinDateLabel={formatMemberJoinDate(resolveMemberJoinDate(member))}
        canTransferOwnership={canTransferOwnership}
        isTransferring={isTransferring}
        onTransferOwnership={() => void handleTransferOwnership()}
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
      defaultValues={mapEmployeeToCreateFormValues(branches)}
      isSubmitting={isSubmitting}
      branches={branches}
      branchesLoading={branchesLoading}
      roles={assignableRoles}
      rolesLoading={rolesLoading}
      onSubmit={handleCreate}
      onClose={onClose}
    />
  );
}
