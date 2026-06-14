import { Check, ChevronDown, Search, X } from "lucide-react";
import { useEffect, useRef } from "react";

import { ERP_COLORS as C } from "@/constants/theme";

import type { ProductOption } from "../types/supplier-product.types";

interface ProductComboboxProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  search: string;
  onSearchChange: (value: string) => void;
  selected: ProductOption | null;
  onSelect: (product: ProductOption) => void;
  products: ProductOption[];
  loading: boolean;
  loadingMore: boolean;
  onListScroll: React.UIEventHandler<HTMLDivElement>;
}

export function ProductCombobox({
  open,
  onOpenChange,
  search,
  onSearchChange,
  selected,
  onSelect,
  products,
  loading,
  loadingMore,
  onListScroll,
}: ProductComboboxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        onOpenChange(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onOpenChange]);

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <div
        onClick={() => onOpenChange(!open)}
        style={{
          minHeight: "42px",
          padding: "0 36px 0 12px",
          border: `1px solid ${open ? C.inputFocus : C.inputBorder}`,
          borderRadius: "8px",
          backgroundColor: C.cardBg,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          position: "relative",
          transition: "border-color 0.15s",
          boxShadow: open ? "0 0 0 3px rgba(60,80,224,0.1)" : "none",
        }}
      >
        <span
          style={{
            fontSize: "14px",
            color: selected ? C.bodyText : C.mutedText,
          }}
        >
          {selected ? selected.name : "Selecciona un producto..."}
        </span>
        <ChevronDown
          style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: `translateY(-50%) rotate(${open ? "180deg" : "0deg"})`,
            width: "15px",
            height: "15px",
            color: C.headText,
            transition: "transform 0.2s",
          }}
        />
      </div>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            backgroundColor: C.cardBg,
            border: `1px solid ${C.cardBorder}`,
            borderRadius: "10px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
            zIndex: 100,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "10px",
              borderBottom: `1px solid ${C.divider}`,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Search
              style={{
                width: "14px",
                height: "14px",
                color: C.mutedText,
                flexShrink: 0,
              }}
            />
            <input
              ref={searchRef}
              type="text"
              placeholder="Buscar producto..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontSize: "13px",
                color: C.bodyText,
                backgroundColor: "transparent",
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                  color: C.mutedText,
                }}
              >
                <X style={{ width: "13px", height: "13px" }} />
              </button>
            )}
          </div>

          <div
            onScroll={onListScroll}
            style={{ maxHeight: "220px", overflowY: "auto" }}
          >
            {loading && products.length === 0 ? (
              <div
                style={{
                  padding: "20px",
                  textAlign: "center",
                  fontSize: "13px",
                  color: C.mutedText,
                }}
              >
                Cargando...
              </div>
            ) : products.length === 0 ? (
              <div
                style={{
                  padding: "20px",
                  textAlign: "center",
                  fontSize: "13px",
                  color: C.mutedText,
                }}
              >
                No hay productos disponibles
              </div>
            ) : (
              <>
                {products.map((product) => {
                  const isSelected = selected?.id === product.id;
                  return (
                    <div
                      key={product.id}
                      onClick={() => onSelect(product)}
                      style={{
                        padding: "9px 12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "10px",
                        cursor: "pointer",
                        backgroundColor: isSelected ? "#EEF2FF" : "transparent",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "1px",
                          minWidth: 0,
                        }}
                      >
                        <span
                          style={{
                            fontSize: "13px",
                            color: isSelected ? C.primary : C.bodyText,
                            fontWeight: isSelected ? 500 : 400,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {product.name}
                        </span>
                        <span style={{ fontSize: "12px", color: C.mutedText }}>
                          {product.code}
                        </span>
                      </div>
                      {isSelected && (
                        <Check
                          style={{
                            width: "15px",
                            height: "15px",
                            color: C.primary,
                            strokeWidth: 3,
                            flexShrink: 0,
                          }}
                        />
                      )}
                    </div>
                  );
                })}
                {loadingMore && (
                  <div
                    style={{
                      padding: "10px",
                      textAlign: "center",
                      fontSize: "12px",
                      color: C.mutedText,
                    }}
                  >
                    Cargando más...
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
