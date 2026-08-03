"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { ERP_COLORS as C } from "@/constants/theme";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Modal } from "@/shared/ui/modal";

import {
  type UserFormSchema,
  userFormSchema,
  type UserUpdateFormSchema,
  userUpdateFormSchema,
} from "../schemas/user.schema";
import type { PermissionInfo, RoleOption } from "../types/user.types";
import { getRoleLabel } from "../utils/role-labels";

interface UserFormCreateProps {
  isEditing: false;
  defaultValues: UserFormSchema;
  isSubmitting: boolean;
  roles: RoleOption[];
  rolesLoading: boolean;
  onSubmit: (values: UserFormSchema) => void | Promise<void>;
  onClose: () => void;
}

interface UserFormEditProps {
  isEditing: true;
  defaultValues: UserUpdateFormSchema;
  isSubmitting: boolean;
  userEmail: string;
  roles: RoleOption[];
  rolesLoading: boolean;
  permissions: PermissionInfo[];
  permissionsLoading: boolean;
  isTargetOwner: boolean;
  canTransferOwnership: boolean;
  isTransferring: boolean;
  onTransferOwnership: () => void;
  onSubmit: (values: UserUpdateFormSchema) => void | Promise<void>;
  onClose: () => void;
}

type UserFormProps = UserFormCreateProps | UserFormEditProps;

export function UserForm(props: UserFormProps) {
  if (props.isEditing) {
    return <UserEditForm {...props} />;
  }
  return <UserCreateForm {...props} />;
}

function PermissionsPanel({
  permissions,
  loading,
}: {
  permissions: PermissionInfo[];
  loading: boolean;
}) {
  const [showPermissions, setShowPermissions] = useState(false);

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <Button
        type="button"
        variant="secondary"
        onClick={() => setShowPermissions((current) => !current)}
        style={{ justifySelf: "start" }}
      >
        {showPermissions ? "Ocultar permisos" : "Mostrar permisos del usuario"}
      </Button>
      {showPermissions ? (
        <div style={{ display: "grid", gap: 8 }}>
          {loading ? (
            <span style={{ color: C.mutedText, fontSize: 13 }}>
              Cargando permisos...
            </span>
          ) : permissions.length > 0 ? (
            permissions.map((permission) => (
              <div
                key={permission.code}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 16,
                  padding: 12,
                  border: `1px solid ${C.divider}`,
                  borderRadius: 8,
                }}
              >
                <div>
                  <strong style={{ fontSize: 14 }}>{permission.name}</strong>
                  <p
                    style={{
                      margin: "4px 0 0",
                      color: C.mutedText,
                      fontSize: 13,
                    }}
                  >
                    {permission.description ?? "Sin descripción"}
                  </p>
                </div>
                <Badge variant="muted">{permission.code}</Badge>
              </div>
            ))
          ) : (
            <span style={{ color: C.mutedText, fontSize: 13 }}>
              Sin permisos asignados.
            </span>
          )}
        </div>
      ) : null}
    </div>
  );
}

function RoleSelectField({
  roles,
  rolesLoading,
  value,
  onChange,
  error,
  disabled = false,
}: {
  roles: RoleOption[];
  rolesLoading: boolean;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label
        style={{ fontSize: "13px", fontWeight: 600, color: C.bodyText }}
        htmlFor="user-role"
      >
        Rol <span style={{ color: C.danger }}>*</span>
      </label>
      <select
        id="user-role"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || rolesLoading || roles.length === 0}
        style={{
          height: "42px",
          padding: "0 14px",
          border: `1px solid ${error ? C.danger : C.inputBorder}`,
          borderRadius: "8px",
          fontSize: "14px",
          color: C.bodyText,
          backgroundColor: C.cardBg,
          outline: "none",
          width: "100%",
        }}
      >
        <option value="">Seleccionar rol</option>
        {roles.map((role) => (
          <option key={role.id} value={role.name}>
            {getRoleLabel(role.name)}
          </option>
        ))}
      </select>
      {error ? (
        <span style={{ fontSize: "12px", color: C.danger }}>{error}</span>
      ) : null}
    </div>
  );
}

function UserCreateForm({
  defaultValues,
  isSubmitting,
  roles,
  rolesLoading,
  onSubmit,
  onClose,
}: UserFormCreateProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormSchema>({
    resolver: zodResolver(userFormSchema),
    defaultValues,
  });

  const selectedRole = watch("role");

  return (
    <Modal
      title="Nuevo Usuario"
      description="Crea un usuario con acceso a la empresa y asigna su rol."
      onClose={onClose}
    >
      <form
        onSubmit={(e) => void handleSubmit(onSubmit)(e)}
        style={{
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "14px",
          }}
        >
          <Input
            label="Nombre"
            required
            error={errors.firstName?.message}
            {...register("firstName")}
          />
          <Input
            label="Apellido"
            required
            error={errors.lastName?.message}
            {...register("lastName")}
          />
        </div>

        <Input
          label="Email"
          type="email"
          required
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="Contraseña"
          type="password"
          required
          error={errors.password?.message}
          {...register("password")}
        />

        <RoleSelectField
          roles={roles}
          rolesLoading={rolesLoading}
          value={selectedRole}
          onChange={(role) => setValue("role", role, { shouldValidate: true })}
          error={errors.role?.message}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            paddingTop: "6px",
            borderTop: `1px solid ${C.divider}`,
          }}
        >
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Crear usuario"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function UserEditForm({
  defaultValues,
  isSubmitting,
  userEmail,
  roles,
  rolesLoading,
  permissions,
  permissionsLoading,
  isTargetOwner,
  canTransferOwnership,
  isTransferring,
  onTransferOwnership,
  onSubmit,
  onClose,
}: UserFormEditProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserUpdateFormSchema>({
    resolver: zodResolver(userUpdateFormSchema),
    defaultValues,
  });

  const selectedRole = watch("role");

  return (
    <Modal
      title="Editar Usuario"
      description="Actualiza los datos del usuario y su rol en la empresa."
      onClose={onClose}
    >
      <form
        onSubmit={(e) => void handleSubmit(onSubmit)(e)}
        style={{
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
        }}
      >
        <Input label="Email" value={userEmail} disabled readOnly />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "14px",
          }}
        >
          <Input
            label="Nombre"
            required
            error={errors.firstName?.message}
            {...register("firstName")}
          />
          <Input
            label="Apellido"
            required
            error={errors.lastName?.message}
            {...register("lastName")}
          />
        </div>

        {isTargetOwner ? (
          <div style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.bodyText }}>
              Rol
            </span>
            <Badge variant="primary">{getRoleLabel(selectedRole)}</Badge>
            <span style={{ color: C.mutedText, fontSize: 12 }}>
              El rol OWNER solo puede cambiarse mediante transferencia de
              propiedad.
            </span>
          </div>
        ) : (
          <RoleSelectField
            roles={roles}
            rolesLoading={rolesLoading}
            value={selectedRole}
            onChange={(role) =>
              setValue("role", role, { shouldValidate: true })
            }
            error={errors.role?.message}
          />
        )}

        <PermissionsPanel
          permissions={permissions}
          loading={permissionsLoading}
        />

        {canTransferOwnership ? (
          <div style={{ display: "grid", gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.bodyText }}>
              Transferencia de propiedad
            </span>
            <Button
              type="button"
              variant="secondary"
              onClick={onTransferOwnership}
              disabled={isTransferring}
              style={{ justifySelf: "start" }}
            >
              {isTransferring
                ? "Transfiriendo..."
                : "Transferir propiedad a este usuario"}
            </Button>
          </div>
        ) : null}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            paddingTop: "6px",
            borderTop: `1px solid ${C.divider}`,
          }}
        >
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
