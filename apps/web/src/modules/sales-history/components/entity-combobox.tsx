import { Check, ChevronDown, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { ERP_COLORS as C } from "@/constants/theme";

export interface EntityOption {
  id: string;
  label: string;
}

interface EntityComboboxProps {
  label: string;
  placeholder: string;
  searchPlaceholder: string;
  emptyMessage: string;
  search: string;
  onSearchChange: (value: string) => void;
  options: EntityOption[];
  selected: EntityOption | null;
  onSelect: (option: EntityOption) => void;
  onClear: () => void;
  loading: boolean;
}

export function EntityCombobox({
  label,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  search,
  onSearchChange,
  options,
  selected,
  onSelect,
  onClear,
  loading,
}: EntityComboboxProps) {
  const [open, setOpen] = useState(false);
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
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-semibold text-head">{label}</span>
      <div ref={containerRef} className="relative min-w-52">
        <div
          onClick={() => setOpen((prev) => !prev)}
          className="flex h-10 cursor-pointer items-center gap-2 rounded-lg border bg-white pr-2 pl-3"
          style={{ borderColor: open ? C.inputFocus : C.inputBorder }}
        >
          <span
            className="flex-1 truncate text-sm"
            style={{ color: selected ? C.bodyText : C.mutedText }}
          >
            {selected ? selected.label : placeholder}
          </span>
          {selected ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="flex shrink-0 text-muted hover:text-body"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <ChevronDown
              className="h-4 w-4 shrink-0 text-head transition-transform"
              style={{ transform: open ? "rotate(180deg)" : "none" }}
            />
          )}
        </div>

        {open && (
          <div
            className="absolute right-0 left-0 z-[100] mt-1.5 overflow-hidden rounded-[10px] bg-white"
            style={{
              border: `1px solid ${C.cardBorder}`,
              boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
            }}
          >
            <div
              className="flex items-center gap-2 p-2.5"
              style={{ borderBottom: `1px solid ${C.divider}` }}
            >
              <Search className="h-3.5 w-3.5 shrink-0 text-muted" />
              <input
                ref={searchRef}
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="flex-1 border-none bg-transparent text-[13px] text-body outline-none"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="flex text-muted"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            <div className="max-h-56 overflow-y-auto">
              {loading && options.length === 0 ? (
                <div className="p-5 text-center text-[13px] text-muted">
                  Cargando...
                </div>
              ) : options.length === 0 ? (
                <div className="p-5 text-center text-[13px] text-muted">
                  {emptyMessage}
                </div>
              ) : (
                options.map((option) => {
                  const isSelected = selected?.id === option.id;
                  return (
                    <div
                      key={option.id}
                      onClick={() => {
                        onSelect(option);
                        setOpen(false);
                      }}
                      className="flex cursor-pointer items-center justify-between gap-2.5 px-3 py-2.5"
                      style={{
                        backgroundColor: isSelected ? "#EEF2FF" : "transparent",
                      }}
                    >
                      <span
                        className="min-w-0 truncate text-[13px]"
                        style={{
                          color: isSelected ? C.primary : C.bodyText,
                          fontWeight: isSelected ? 500 : 400,
                        }}
                      >
                        {option.label}
                      </span>
                      {isSelected && (
                        <Check
                          className="h-3.5 w-3.5 shrink-0"
                          style={{ color: C.primary, strokeWidth: 3 }}
                        />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </label>
  );
}
