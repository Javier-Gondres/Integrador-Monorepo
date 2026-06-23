"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { ERP_COLORS as C } from "@/constants/theme";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Modal } from "@/shared/ui/modal";

import {
  type UserFormSchema,
  userFormSchema,
  type UserUpdateFormSchema,
  userUpdateFormSchema,
} from "../schemas/user.schema";
import type { RoleOption } from "../types/user.types";
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

function RoleSelectField({
  roles,
  rolesLoading,
  value,
  onChange,
  error,
}: {
  roles: RoleOption[];
  rolesLoading: boolean;
  value: string;
  onChange: (value: string) => void;
  error?: string;
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
        disabled={rolesLoading || roles.length === 0}
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
          onChange={(role) =>
            setValue("role", role, { shouldValidate: true })
          }
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

        <RoleSelectField
          roles={roles}
          rolesLoading={rolesLoading}
          value={selectedRole}
          onChange={(role) =>
            setValue("role", role, { shouldValidate: true })
          }
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
            {isSubmitting ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
