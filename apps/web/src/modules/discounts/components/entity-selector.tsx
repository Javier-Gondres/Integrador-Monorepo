import { Check, ChevronDown, Search, X } from "lucide-react";
import { useEffect, useRef } from "react";

import { ERP_COLORS as C } from "@/constants/theme";
import { Badge } from "@/shared/ui/badge";

export interface EntityOption {
  id: string;
  name: string;
  subtitle?: string;
}

interface EntitySelectorProps {
  label: string;
  placeholder: string;
  searchPlaceholder: string;
  emptyMessage: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  search: string;
  onSearchChange: (value: string) => void;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  options: EntityOption[];
  /**
   * Entidades ya seleccionadas conocidas de antemano (p. ej. al editar).
   * Permite mostrar sus nombres aunque no estén en la página cargada.
   */
  selectedEntities?: EntityOption[];
  loading: boolean;
  loadingMore: boolean;
  onListScroll: React.UIEventHandler<HTMLDivElement>;
}

export function EntitySelector({
  label,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  open,
  onOpenChange,
  search,
  onSearchChange,
  selectedIds,
  onChange,
  options,
  selectedEntities,
  loading,
  loadingMore,
  onListScroll,
}: EntitySelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const optionById = new Map<string, EntityOption>();
  for (const entity of selectedEntities ?? []) {
    optionById.set(entity.id, entity);
  }
  for (const option of options) {
    optionById.set(option.id, option);
  }

  const selectedOptions = selectedIds
    .map((id) => optionById.get(id))
    .filter((option): option is EntityOption => Boolean(option));

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

  const toggleOption = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((value) => value !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const removeTag = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedIds.filter((value) => value !== id));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontSize: "13px", fontWeight: 600, color: C.bodyText }}>
        {label}
      </label>
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
              {placeholder}
            </span>
          ) : (
            selectedOptions.map((option) => (
              <Badge key={option.id} variant="primary">
                {option.name}
                <button
                  type="button"
                  onClick={(e) => removeTag(option.id, e)}
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
                placeholder={searchPlaceholder}
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
              {loading && options.length === 0 ? (
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
              ) : options.length === 0 ? (
                <div
                  style={{
                    padding: "20px",
                    textAlign: "center",
                    fontSize: "13px",
                    color: C.mutedText,
                  }}
                >
                  {emptyMessage}
                </div>
              ) : (
                <>
                  {options.map((option) => {
                    const selected = selectedIds.includes(option.id);
                    return (
                      <div
                        key={option.id}
                        onClick={() => toggleOption(option.id)}
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
                            backgroundColor: selected
                              ? C.primary
                              : "transparent",
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
                          {option.name}
                        </span>
                        {option.subtitle && (
                          <span
                            style={{ fontSize: "12px", color: C.mutedText }}
                          >
                            {option.subtitle}
                          </span>
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
    </div>
  );
}
