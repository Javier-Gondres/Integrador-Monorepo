import { ERP_COLORS as C } from "@/constants/theme";
import type { BranchListItem } from "@/modules/branches/types/branch.types";

interface BranchSelectProps {
  branches: BranchListItem[];
  value: string | null;
  onChange: (branchId: string) => void;
  loading?: boolean;
}

export function BranchSelect({
  branches,
  value,
  onChange,
  loading = false,
}: BranchSelectProps) {
  return (
    <select
      aria-label="Sucursal"
      value={value ?? ""}
      disabled={loading || branches.length === 0}
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
