import { Search } from "lucide-react";

import type { Supplier } from "@/modules/suppliers/types/supplier.types";

import { avatarColor, initials } from "../utils/format";

interface SupplierRailProps {
  suppliers: Supplier[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
  loading: boolean;
}

export function SupplierRail({
  suppliers,
  selectedId,
  onSelect,
  search,
  onSearchChange,
  loading,
}: SupplierRailProps) {
  return (
    <div className="flex min-h-0 flex-col border-r border-card-border">
      <div className="border-b border-card-border p-3">
        <div className="flex items-center gap-2 rounded-lg border border-input-border px-3">
          <Search className="h-4 w-4 shrink-0 text-muted" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar proveedor…"
            className="h-9 w-full bg-transparent text-sm text-body outline-none placeholder:text-muted"
          />
        </div>
      </div>

      <div className="px-4 pt-3 pb-1 text-xs font-semibold tracking-wide text-head uppercase">
        Proveedores · {suppliers.length}
      </div>

      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="p-6 text-center text-sm text-muted">
            Cargando proveedores…
          </div>
        ) : suppliers.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted">
            Sin proveedores.
          </div>
        ) : (
          suppliers.map((supplier) => {
            const active = supplier.id === selectedId;
            return (
              <button
                key={supplier.id}
                type="button"
                onClick={() => onSelect(supplier.id)}
                className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                  active
                    ? "bg-primary/10 ring-1 ring-primary/30"
                    : "hover:bg-[#F9FAFB]"
                }`}
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ background: avatarColor(supplier.id) }}
                >
                  {initials(supplier.name)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-body">
                    {supplier.name}
                  </span>
                  <span className="block truncate text-xs text-muted">
                    {supplier.contactName ?? "Sin contacto"}
                  </span>
                </span>
                <span className="shrink-0 rounded-full bg-gray-bg px-2 py-0.5 text-xs font-semibold text-gray-text">
                  {supplier.productsCount}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
