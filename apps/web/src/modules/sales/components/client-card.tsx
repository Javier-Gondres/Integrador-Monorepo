"use client";

import { UserRound, X } from "lucide-react";

import type { Customer } from "@/modules/customers/types/customer.types";

import type { SaleCustomer } from "../hooks/use-sale";
import type { SalePaymentOption } from "../types/sale.types";
import { ClientLookup } from "./client-lookup";
import { PaymentPicker } from "./payment-picker";

interface ClientCardProps {
  customer: SaleCustomer | null;
  searchValue: string;
  onSearchChange: (value: string) => void;
  customers: Customer[];
  loadingCustomers: boolean;
  onPickCustomer: (customer: Customer) => void;
  onClearCustomer: () => void;
  paymentOption: SalePaymentOption;
  onPaymentChange: (value: SalePaymentOption) => void;
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-head">{label}</span>
      <span className="min-h-[20px] text-sm text-body">
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
  onClearCustomer,
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
          onClick={onClearCustomer}
          className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-card-border px-3 text-sm font-semibold text-head transition-colors hover:text-primary"
        >
          <X className="h-3.5 w-3.5" />
          Consumidor final
        </button>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.3fr_1fr] lg:items-end">
        <Field
          label="Nombre / Razón Social"
          value={customer?.name ?? "Consumidor Final"}
        />
        <Field label="Cédula / RNC" value={customer?.cedula ?? null} />
        <Field label="Correo Electrónico" value={customer?.email ?? null} />
        <Field label="Teléfono" value={customer?.phone ?? null} />
        <div className="sm:col-span-2">
          <Field label="Dirección" value={customer?.address ?? null} />
        </div>
        <div className="sm:col-span-2">
          <span className="mb-1 block text-xs font-semibold text-head">
            Método de Pago
          </span>
          <PaymentPicker value={paymentOption} onChange={onPaymentChange} />
        </div>
      </div>
    </section>
  );
}
