"use client";

import { ChevronDown, UserPlus, UserRound } from "lucide-react";

import type { Customer } from "@/modules/customers/types/customer.types";

import type { SaleCustomer } from "../hooks/use-sale";
import type { SalePaymentOption } from "../types/sale.types";
import { ClientLookup } from "./client-lookup";

interface ClientCardProps {
  customer: SaleCustomer | null;
  searchValue: string;
  onSearchChange: (value: string) => void;
  customers: Customer[];
  loadingCustomers: boolean;
  onPickCustomer: (customer: Customer) => void;
  onNewCustomer: () => void;
  paymentOption: SalePaymentOption;
  onPaymentChange: (value: SalePaymentOption) => void;
}

const PAYMENT_OPTIONS: { value: SalePaymentOption; label: string }[] = [
  { value: "contado", label: "Contado / Efectivo" },
  { value: "credito", label: "Crédito" },
  { value: "tarjeta", label: "Tarjeta" },
];

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="text-xs font-semibold text-head">{label}</span>
      <span className="min-h-[20px] truncate text-sm text-body">
        {value && value.trim() ? value : <span className="text-muted">—</span>}
      </span>
    </div>
  );
}

export function ClientCard({
  customer,
  searchValue,
  onSearchChange,
  customers,
  loadingCustomers,
  onPickCustomer,
  onNewCustomer,
  paymentOption,
  onPaymentChange,
}: ClientCardProps) {
  return (
    <section className="rounded-xl border border-card-border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-2 text-sm font-semibold text-body">
          <UserRound className="h-4 w-4 text-primary" />
          Información del Cliente
        </span>
        <span className="grow" />
        <div className="w-[300px] max-[640px]:w-full">
          <ClientLookup
            searchValue={searchValue}
            onSearchChange={onSearchChange}
            customers={customers}
            loading={loadingCustomers}
            onPick={onPickCustomer}
          />
        </div>
        <button
          type="button"
          onClick={onNewCustomer}
          className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-card-border px-3 text-sm font-semibold text-head transition-colors hover:text-primary"
        >
          <UserPlus className="h-3.5 w-3.5" />
          Nuevo
        </button>
      </div>

      <div className="mt-3 grid grid-cols-1 items-end gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-[1.5fr_1.1fr_1fr_1.7fr_1.2fr]">
        <Field label="Nombre / Razón Social" value={customer?.name ?? null} />
        <Field label="Cédula / RNC" value={customer?.cedula ?? null} />
        <Field label="Teléfono" value={customer?.phone ?? null} />
        <Field label="Dirección" value={customer?.address ?? null} />
        <div className="flex flex-col gap-1">
          <label
            htmlFor="sale-payment-method"
            className="text-xs font-semibold text-head"
          >
            Método de Pago<span className="ml-0.5 text-danger">*</span>
          </label>
          <div className="relative">
            <select
              id="sale-payment-method"
              value={paymentOption}
              onChange={(event) =>
                onPaymentChange(event.target.value as SalePaymentOption)
              }
              className="h-11 w-full cursor-pointer appearance-none rounded-lg border border-input-border bg-white pl-3 pr-9 text-sm text-body outline-none focus:border-primary"
            >
              {PAYMENT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          </div>
        </div>
      </div>
    </section>
  );
}
