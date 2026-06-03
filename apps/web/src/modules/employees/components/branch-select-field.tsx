"use client";

import { ERP_COLORS as C } from "@/constants/theme";

import type { BranchOption } from "../types/employee.types";

interface BranchSelectFieldProps {
  label?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  branches: BranchOption[];
  loading?: boolean;
  error?: string;
}

export function BranchSelectField({
  label = "Sucursal",
  required,
  value,
  onChange,
  branches,
  loading,
  error,
}: BranchSelectFieldProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label
        style={{
          fontSize: "13px",
          fontWeight: 600,
          color: C.bodyText,
        }}
      >
        {label}
        {required && (
          <span style={{ color: C.danger, marginLeft: "4px" }}>*</span>
        )}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
        style={{
          height: "40px",
          padding: "0 12px",
          border: `1px solid ${error ? C.danger : C.inputBorder}`,
          borderRadius: "8px",
          fontSize: "14px",
          color: C.bodyText,
          backgroundColor: C.cardBg,
        }}
      >
        <option value="">
          {loading ? "Cargando sucursales..." : "Selecciona una sucursal"}
        </option>
        {branches.map((branch) => (
          <option key={branch.id} value={branch.id}>
            {branch.name}
          </option>
        ))}
      </select>
      {error && (
        <span style={{ fontSize: "12px", color: C.danger }}>{error}</span>
      )}
    </div>
  );
}
