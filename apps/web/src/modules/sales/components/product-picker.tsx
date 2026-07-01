"use client";

import { Box, Plus, Search } from "lucide-react";

import type { SaleProductDto } from "../types/sale.types";
import { money } from "../utils/format";

interface ProductPickerProps {
  products: SaleProductDto[];
  search: string;
  onSearchChange: (value: string) => void;
  categories: string[];
  activeCategory: string;
  onCategoryChange: (value: string) => void;
  cartQty: Record<string, number>;
  onAdd: (product: SaleProductDto) => void;
  loading?: boolean;
}

export function ProductPicker({
  products,
  search,
  onSearchChange,
  categories,
  activeCategory,
  onCategoryChange,
  cartQty,
  onAdd,
  loading = false,
}: ProductPickerProps) {
  return (
    <section className="flex min-h-0 flex-col rounded-xl border border-card-border bg-card shadow-sm">
      <div className="flex flex-col gap-3 border-b border-card-border p-4">
        <span className="flex items-center gap-2 text-sm font-semibold text-body">
          <Box className="h-4 w-4 text-primary" />
          Agregar Productos
        </span>
        <div className="flex h-10 items-center gap-2 rounded-lg border border-input-border bg-white px-3">
          <Search className="h-4 w-4 text-muted" />
          <input
            className="h-full w-full bg-transparent text-sm text-body outline-none placeholder:text-muted"
            placeholder="Buscar por código o nombre…"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => onCategoryChange(category)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                activeCategory === category
                  ? "border-primary bg-primary text-white"
                  : "border-card-border bg-white text-head hover:border-primary/40"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto p-3 max-[1024px]:max-h-[55vh]">
        {loading ? (
          <div className="grid h-full place-items-center py-12 text-sm text-muted">
            Cargando productos…
          </div>
        ) : products.length === 0 ? (
          <div className="grid h-full place-items-center py-12 text-center">
            <div>
              <p className="text-sm font-semibold text-body">Sin coincidencias</p>
              <p className="mt-1 text-xs text-muted">
                Ajusta la búsqueda o la categoría.
              </p>
            </div>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {products.map((product) => {
              const inCart = cartQty[product.id] ?? 0;
              const hasDiscount = product.discountPercentage > 0;
              const soldOut = product.available <= 0;
              const reachedMax = inCart >= product.available;
              return (
                <li
                  key={product.id}
                  className="flex items-center gap-3 rounded-lg border border-card-border bg-white p-3"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Box className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-body">
                      {product.name}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {product.code}
                      {product.categories[0]
                        ? ` · ${product.categories[0].name}`
                        : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    {hasDiscount ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="text-xs text-muted line-through">
                          {money(product.price)}
                        </span>
                        <span className="rounded bg-green-bg px-1 text-[10px] font-bold text-green-text">
                          -{product.discountPercentage}%
                        </span>
                      </div>
                    ) : null}
                    <p className="text-sm font-semibold text-body tabular-nums">
                      {money(product.finalPrice)}
                    </p>
                    <p
                      className={`text-xs ${
                        soldOut ? "text-danger" : "text-muted"
                      }`}
                    >
                      Stock: {product.available}
                    </p>
                  </div>
                  {inCart > 0 ? (
                    <span className="grid h-9 min-w-[3rem] place-items-center rounded-lg bg-green-bg px-2 text-sm font-semibold text-green-text">
                      {inCart} ✓
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onAdd(product)}
                      disabled={soldOut || reachedMax}
                      className="inline-flex h-9 items-center gap-1 rounded-lg bg-primary px-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Agregar
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
