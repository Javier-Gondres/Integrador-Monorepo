"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { ERP_COLORS as C } from "@/constants/theme";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Modal } from "@/shared/ui/modal";

import {
  type EmployeeFormSchema,
  employeeFormSchema,
  type EmployeeUpdateFormSchema,
  employeeUpdateFormSchema,
} from "../schemas/employee.schema";
import type { BranchOption, RoleOption } from "../types/employee.types";
import { BranchSelectField } from "./branch-select-field";

interface EmployeeFormCreateProps {
  isEditing: false;
  defaultValues: EmployeeFormSchema;
  isSubmitting: boolean;
  branches: BranchOption[];
  branchesLoading: boolean;
  roles: RoleOption[];
  rolesLoading: boolean;
  onSubmit: (values: EmployeeFormSchema) => void | Promise<void>;
  onClose: () => void;
}

interface EmployeeFormEditProps {
  isEditing: true;
  defaultValues: EmployeeUpdateFormSchema;
  isSubmitting: boolean;
  branches: BranchOption[];
  branchesLoading: boolean;
  userEmail: string;
  onSubmit: (values: EmployeeUpdateFormSchema) => void | Promise<void>;
  onClose: () => void;
}

type EmployeeFormProps = EmployeeFormCreateProps | EmployeeFormEditProps;

export function EmployeeForm(props: EmployeeFormProps) {
  if (props.isEditing) {
    return <EmployeeEditForm {...props} />;
  }
  return <EmployeeCreateForm {...props} />;
}

function EmployeeCreateForm({
  defaultValues,
  isSubmitting,
  branches,
  branchesLoading,
  roles,
  rolesLoading,
  onSubmit,
  onClose,
}: EmployeeFormCreateProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EmployeeFormSchema>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues,
  });

  return (
    <Modal
      title="Nuevo Empleado"
      description="Crea el usuario, la membresía y el registro laboral en una sola operación."
      onClose={onClose}
    >
      <form
        onSubmit={(e) => void handleSubmit(onSubmit)(e)}
        style={{
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          overflowY: "auto",
          maxHeight: "70vh",
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
            maxLength={100}
            error={errors.firstName?.message}
            {...register("firstName")}
          />
          <Input
            label="Apellido"
            required
            maxLength={100}
            error={errors.lastName?.message}
            {...register("lastName")}
          />
        </div>

        <Controller
          name="branchId"
          control={control}
          render={({ field }) => (
            <BranchSelectField
              required
              value={field.value}
              onChange={field.onChange}
              branches={branches}
              loading={branchesLoading}
              error={errors.branchId?.message}
            />
          )}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "14px",
          }}
        >
          <Input
            label="Email"
            type="email"
            required
            maxLength={100}
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
        </div>

        <RoleSelectField
          control={control}
          roles={roles}
          rolesLoading={rolesLoading}
          error={errors.roleId?.message}
        />

        <Input
          label="Puesto"
          maxLength={100}
          placeholder="Ej. Cajero"
          error={errors.position?.message}
          {...register("position")}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "14px",
          }}
        >
          <Input
            label="Teléfono"
            maxLength={20}
            error={errors.phone?.message}
            {...register("phone")}
          />
          <Input
            label="Salario"
            type="number"
            step="0.01"
            min={0}
            max={99999999.99}
            error={errors.salary?.message}
            {...register("salary")}
          />
        </div>

        <Input
          label="Fecha de contratación"
          type="date"
          error={errors.hireDate?.message}
          {...register("hireDate")}
        />

        <FormActions
          isSubmitting={isSubmitting}
          onClose={onClose}
          submitLabel="Crear empleado"
        />
      </form>
    </Modal>
  );
}

function EmployeeEditForm({
  defaultValues,
  isSubmitting,
  branches,
  branchesLoading,
  userEmail,
  onSubmit,
  onClose,
}: EmployeeFormEditProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EmployeeUpdateFormSchema>({
    resolver: zodResolver(employeeUpdateFormSchema),
    defaultValues,
  });

  return (
    <Modal
      title="Editar Empleado"
      description="Actualiza los datos laborales. El acceso al sistema se gestiona por email."
      onClose={onClose}
    >
      <form
        onSubmit={(e) => void handleSubmit(onSubmit)(e)}
        style={{
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          overflowY: "auto",
        }}
      >
        <Input label="Email (acceso)" value={userEmail} disabled />

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
            maxLength={100}
            error={errors.firstName?.message}
            {...register("firstName")}
          />
          <Input
            label="Apellido"
            required
            maxLength={100}
            error={errors.lastName?.message}
            {...register("lastName")}
          />
        </div>

        <Controller
          name="branchId"
          control={control}
          render={({ field }) => (
            <BranchSelectField
              required
              value={field.value}
              onChange={field.onChange}
              branches={branches}
              loading={branchesLoading}
              error={errors.branchId?.message}
            />
          )}
        />

        <Input
          label="Puesto"
          maxLength={100}
          error={errors.position?.message}
          {...register("position")}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "14px",
          }}
        >
          <Input
            label="Teléfono"
            maxLength={20}
            error={errors.phone?.message}
            {...register("phone")}
          />
          <Input
            label="Salario"
            type="number"
            step="0.01"
            min={0}
            max={99999999.99}
            error={errors.salary?.message}
            {...register("salary")}
          />
        </div>

        <Input
          label="Fecha de contratación"
          type="date"
          error={errors.hireDate?.message}
          {...register("hireDate")}
        />

        <FormActions
          isSubmitting={isSubmitting}
          onClose={onClose}
          submitLabel="Guardar"
        />
      </form>
    </Modal>
  );
}

function RoleSelectField({
  control,
  roles,
  rolesLoading,
  error,
}: {
  control: ReturnType<typeof useForm<EmployeeFormSchema>>["control"];
  roles: RoleOption[];
  rolesLoading: boolean;
  error?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontSize: "13px", fontWeight: 600, color: C.bodyText }}>
        Rol <span style={{ color: C.danger }}>*</span>
      </label>
      <Controller
        name="roleId"
        control={control}
        render={({ field }) => (
          <select
            value={field.value}
            onChange={field.onChange}
            disabled={rolesLoading}
            style={{
              height: "40px",
              padding: "0 12px",
              border: `1px solid ${error ? C.danger : C.inputBorder}`,
              borderRadius: "8px",
              fontSize: "14px",
            }}
          >
            <option value="">
              {rolesLoading ? "Cargando roles..." : "Selecciona un rol"}
            </option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
                {role.description ? ` — ${role.description}` : ""}
              </option>
            ))}
          </select>
        )}
      />
      {error && (
        <span style={{ fontSize: "12px", color: C.danger }}>{error}</span>
      )}
    </div>
  );
}

function FormActions({
  isSubmitting,
  onClose,
  submitLabel,
}: {
  isSubmitting: boolean;
  onClose: () => void;
  submitLabel: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px",
        paddingTop: "6px",
        borderTop: `1px solid ${C.divider}`,
      }}
    >
      <Button variant="secondary" onClick={onClose}>
        Cancelar
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {submitLabel}
      </Button>
    </div>
  );
}
