import { Check, Package, Plus, Search } from "lucide-react";

import type { SupplierProduct } from "@/modules/supplier-catalog/types/supplier-product.types";

import { money } from "../utils/format";

interface ProductListProps {
  supplierName: string | null;
  products: SupplierProduct[];
  orderedQty: Record<string, number>;
  search: string;
  onSearchChange: (value: string) => void;
  onAdd: (product: SupplierProduct) => void;
  loading: boolean;
}

export function ProductList({
  supplierName,
  products,
  orderedQty,
  search,
  onSearchChange,
  onAdd,
  loading,
}: ProductListProps) {
  return (
    <div className="flex min-h-0 flex-col border-r border-card-border">
      <div className="flex items-center justify-between gap-3 border-b border-card-border p-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-body">
            Productos activos
          </div>
          <div className="truncate text-xs text-muted">
            {supplierName ?? "Selecciona un proveedor"}
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-input-border px-3">
          <Search className="h-4 w-4 shrink-0 text-muted" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar producto…"
            className="h-9 w-44 bg-transparent text-sm text-body outline-none placeholder:text-muted"
          />
        </div>
      </div>

      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-10 text-center text-sm text-muted">
            Cargando productos…
          </div>
        ) : products.length === 0 ? (
          <div className="p-10 text-center">
            <div className="text-sm font-semibold text-body">
              Sin coincidencias
            </div>
            <div className="text-xs text-muted">
              {supplierName
                ? "Este proveedor no tiene productos activos que coincidan."
                : "Selecciona un proveedor para ver sus productos."}
            </div>
          </div>
        ) : (
          products.map((product) => {
            const qty = orderedQty[product.productId] ?? 0;
            return (
              <div
                key={product.productId}
                className="flex items-center gap-3 border-b border-divider px-4 py-3 last:border-b-0"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Package className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-body">
                    {product.name}
                  </div>
                  <div className="truncate text-xs text-muted">
                    {product.code}
                  </div>
                </div>
                <div className="text-sm font-semibold tabular-nums text-body">
                  {money(product.price)}
                </div>
                {qty > 0 ? (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-green-bg px-3 py-1.5 text-xs font-semibold text-green-text">
                    <Check className="h-3.5 w-3.5" />
                    {qty}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onAdd(product)}
                    className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-hover"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Agregar
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
