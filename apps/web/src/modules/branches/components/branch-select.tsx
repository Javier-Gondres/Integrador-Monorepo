import { ERP_COLORS as C } from "@/constants/theme";

interface BranchSelectProps {
  branches: Array<{ id: string; name: string }>;
  value: string | null;
  onChange: (branchId: string) => void;
  loading?: boolean;
  /** Deshabilita el selector (p.ej. cajero con sucursal asignada). */
  disabled?: boolean;
  title?: string;
}

export function BranchSelect({
  branches,
  value,
  onChange,
  loading = false,
  disabled = false,
  title,
}: BranchSelectProps) {
  return (
    <select
      aria-label="Sucursal"
      value={value ?? ""}
      disabled={loading || branches.length === 0 || disabled}
      title={title}
      onChange={(e) => onChange(e.target.value)}
      style={{
        height: "40px",
        minWidth: "200px",
        padding: "0 14px",
        border: `1px solid ${C.inputBorder}`,
        borderRadius: "8px",
        fontSize: "14px",
        color: C.bodyText,
        backgroundColor: C.cardBg,
        cursor: "pointer",
        outline: "none",
      }}
    >
      {loading ? (
        <option value="">Cargando sucursales...</option>
      ) : branches.length === 0 ? (
        <option value="">Sin sucursales</option>
      ) : (
        branches.map((branch) => (
          <option key={branch.id} value={branch.id}>
            {branch.name}
          </option>
        ))
      )}
    </select>
  );
}
