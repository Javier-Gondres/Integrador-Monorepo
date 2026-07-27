import { Check, ChevronDown, Plus, Search, X } from "lucide-react";
import { useEffect, useRef } from "react";

import { ERP_COLORS as C } from "@/constants/theme";
import { Badge } from "@/shared/ui/badge";

export interface CategoryOption {
  id: string;
  name: string;
}

interface CategoryComboboxProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  search: string;
  onSearchChange: (value: string) => void;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  categories: CategoryOption[];
  loading: boolean;
  loadingMore: boolean;
  onListScroll: React.UIEventHandler<HTMLDivElement>;
  onCreateClick?: () => void;
}

export function CategoryCombobox({
  open,
  onOpenChange,
  search,
  onSearchChange,
  selectedIds,
  onChange,
  categories,
  loading,
  loadingMore,
  onListScroll,
  onCreateClick,
}: CategoryComboboxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selectedCategories = categories.filter((c) =>
    selectedIds.includes(c.id),
  );

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

  const toggleCategory = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const removeTag = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedIds.filter((x) => x !== id));
  };

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <div
        onClick={() => onOpenChange(!open)}
        style={{
          minHeight: "42px",
          padding: "6px 36px 6px 10px",
          border: `1px solid ${open ? C.inputFocus : C.inputBorder}`,
          borderRadius: "8px",
          backgroundColor: C.cardBg,
          cursor: "pointer",
          display: "flex",
          flexWrap: "wrap",
          gap: "5px",
          alignItems: "center",
          position: "relative",
          transition: "border-color 0.15s",
          boxShadow: open ? "0 0 0 3px rgba(60,80,224,0.1)" : "none",
        }}
      >
        {selectedIds.length === 0 ? (
          <span style={{ fontSize: "14px", color: C.mutedText }}>
            Seleccionar categorías...
          </span>
        ) : (
          selectedCategories.map((cat) => (
            <Badge key={cat.id} variant="primary">
              {cat.name}
              <button
                type="button"
                onClick={(e) => removeTag(cat.id, e)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                  color: "#818CF8",
                  marginLeft: "1px",
                }}
              >
                <X style={{ width: "10px", height: "10px" }} />
              </button>
            </Badge>
          ))
        )}
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
            flexShrink: 0,
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
              placeholder="Buscar categoría..."
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
            ref={listRef}
            onScroll={onListScroll}
            style={{ maxHeight: "220px", overflowY: "auto" }}
          >
            {loading && categories.length === 0 ? (
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
            ) : categories.length === 0 ? (
              <div
                style={{
                  padding: "20px",
                  textAlign: "center",
                  fontSize: "13px",
                  color: C.mutedText,
                }}
              >
                No se encontraron categorías
                {onCreateClick && (
                  <>
                    {" "}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCreateClick();
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        fontSize: "13px",
                        color: C.primary,
                        cursor: "pointer",
                        fontWeight: 500,
                      }}
                    >
                      Crear una nueva
                    </button>
                  </>
                )}
              </div>
            ) : (
              <>
                {categories.map((cat) => {
                  const selected = selectedIds.includes(cat.id);
                  return (
                    <div
                      key={cat.id}
                      onClick={() => toggleCategory(cat.id)}
                      style={{
                        padding: "9px 12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        cursor: "pointer",
                        backgroundColor: selected ? "#EEF2FF" : "transparent",
                      }}
                    >
                      <div
                        style={{
                          width: "16px",
                          height: "16px",
                          borderRadius: "4px",
                          border: `1.5px solid ${selected ? C.primary : C.grayBorder}`,
                          backgroundColor: selected ? C.primary : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {selected && (
                          <Check
                            style={{
                              width: "10px",
                              height: "10px",
                              color: "#fff",
                              strokeWidth: 3,
                            }}
                          />
                        )}
                      </div>
                      <span
                        style={{
                          fontSize: "13px",
                          color: selected ? C.primary : C.bodyText,
                          fontWeight: selected ? 500 : 400,
                        }}
                      >
                        {cat.name}
                      </span>
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

          {onCreateClick && (
            <div
              style={{
                padding: "8px 12px",
                borderTop: `1px solid ${C.divider}`,
              }}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateClick();
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  padding: "8px 10px",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: C.primary,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  borderRadius: "6px",
                }}
              >
                <Plus style={{ width: "14px", height: "14px" }} />
                Nueva categoría
              </button>
            </div>
          )}

          {selectedIds.length > 0 && (
            <div
              style={{
                padding: "8px 12px",
                borderTop: `1px solid ${C.divider}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: "12px", color: C.mutedText }}>
                {selectedIds.length} seleccionada
                {selectedIds.length !== 1 ? "s" : ""}
              </span>
              <button
                type="button"
                onClick={() => onChange([])}
                style={{
                  fontSize: "12px",
                  color: C.danger,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "2px 6px",
                }}
              >
                Limpiar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
