import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useMemo } from "react";

import { ERP_COLORS as C } from "@/constants/theme";
import { useIntersectionObserver } from "@/shared/hooks/use-intersection-observer";

export interface AsyncComboboxOption {
  id: string;
  name: string;
  description?: string;
}

interface AsyncComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: AsyncComboboxOption[];
  onSearchChange: (search: string) => void;
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export function AsyncCombobox({
  value,
  onChange,
  options,
  onSearchChange,
  isLoading = false,
  isFetchingNextPage = false,
  hasNextPage = false,
  fetchNextPage,
  placeholder = "Seleccione una opción...",
  disabled = false,
}: AsyncComboboxProps) {
  const selectedOption = useMemo(() => options.find((opt) => opt.id === value), [options, value]);

  const observerRef = useIntersectionObserver({
    onIntersect: () => {
      if (hasNextPage && !isFetchingNextPage && fetchNextPage) {
        fetchNextPage();
      }
    },
    enabled: hasNextPage && !isFetchingNextPage,
  });

  return (
    <div className="relative w-full">
      <Combobox value={selectedOption ?? null} onChange={(opt: AsyncComboboxOption | null) => onChange(opt?.id ?? "")} disabled={disabled}>
        <div className="relative">
          <ComboboxInput
            className="w-full h-10 px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            displayValue={(opt: AsyncComboboxOption | null) => opt?.name ?? ""}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={placeholder}
            autoComplete="off"
          />
          <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
            {isLoading ? (
              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" aria-hidden="true" />
            ) : (
              <ChevronsUpDown className="w-4 h-4 text-gray-400" aria-hidden="true" />
            )}
          </ComboboxButton>
        </div>

        <ComboboxOptions className="absolute z-50 w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          {options.length === 0 && !isLoading ? (
            <div className="relative px-4 py-2 text-gray-700 cursor-default select-none">
              No se encontraron resultados.
            </div>
          ) : (
            options.map((opt) => (
              <ComboboxOption
                key={opt.id}
                value={opt}
                className="relative cursor-default select-none py-2 pl-10 pr-4 data-[focus]:bg-blue-100 data-[focus]:text-blue-900 text-gray-900"
              >
                {({ selected }) => (
                  <>
                    <div className="flex flex-col">
                      <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                        {opt.name}
                      </span>
                      {opt.description && (
                        <span className="block truncate text-xs text-gray-500">
                          {opt.description}
                        </span>
                      )}
                    </div>
                    {selected ? (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                        <Check className="w-4 h-4" aria-hidden="true" />
                      </span>
                    ) : null}
                  </>
                )}
              </ComboboxOption>
            ))
          )}

          {/* Elemento dummy para el scroll infinito */}
          <div ref={observerRef} className="h-1" />

          {isFetchingNextPage && (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
            </div>
          )}
        </ComboboxOptions>
      </Combobox>
    </div>
  );
}
