"use client";

import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { Customer } from "@/modules/customers/types/customer.types";

import { initials } from "../utils/format";

interface ClientLookupProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  customers: Customer[];
  loading?: boolean;
  onPick: (customer: Customer) => void;
}

export function ClientLookup({
  searchValue,
  onSearchChange,
  customers,
  loading = false,
  onPick,
}: ClientLookupProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () =>
      document.removeEventListener("pointerdown", onPointerDown, true);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div className="flex h-10 items-center gap-2 rounded-lg border border-input-border bg-white px-3">
        <Search className="h-4 w-4 text-muted" />
        <input
          className="h-full w-full bg-transparent text-sm text-body outline-none placeholder:text-muted"
          placeholder="Buscar cliente por nombre o cédula…"
          value={searchValue}
          onChange={(event) => {
            onSearchChange(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
      </div>

      {open && (
        <div className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-card-border bg-white py-1 shadow-lg">
          {loading ? (
            <div className="px-3 py-3 text-sm text-muted">Buscando…</div>
          ) : customers.length === 0 ? (
            <div className="px-3 py-3 text-sm text-muted">
              Sin clientes que coincidan. Déjalo vacío para vender a consumidor
              final.
            </div>
          ) : (
            customers.map((customer) => (
              <button
                key={customer.id}
                type="button"
                className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-page"
                onClick={() => {
                  onPick(customer);
                  setOpen(false);
                }}
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-white">
                  {initials(customer.fullName)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-body">
                    {customer.fullName}
                  </span>
                  <span className="block truncate text-xs text-muted">
                    {customer.cedula
                      ? `Cédula/RNC ${customer.cedula}`
                      : "Sin cédula"}
                    {customer.phone ? ` · ${customer.phone}` : ""}
                  </span>
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
