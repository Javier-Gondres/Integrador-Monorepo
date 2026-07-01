"use client";

import { Banknote, CreditCard, ReceiptText } from "lucide-react";

import type { SalePaymentOption } from "../types/sale.types";

interface PaymentPickerProps {
  value: SalePaymentOption;
  onChange: (value: SalePaymentOption) => void;
}

const OPTIONS: {
  id: SalePaymentOption;
  label: string;
  sub: string;
  icon: typeof Banknote;
}[] = [
  { id: "contado", label: "Contado", sub: "Efectivo", icon: Banknote },
  { id: "credito", label: "Crédito", sub: "Cuenta por cobrar", icon: ReceiptText },
  { id: "tarjeta", label: "Tarjeta", sub: "Visa / Mastercard", icon: CreditCard },
];

export function PaymentPicker({ value, onChange }: PaymentPickerProps) {
  return (
    <div className="grid grid-cols-3 gap-2.5 max-[640px]:grid-cols-1">
      {OPTIONS.map((option) => {
        const Icon = option.icon;
        const selected = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`flex items-center gap-2.5 rounded-lg border p-3 text-left transition-colors ${
              selected
                ? "border-primary bg-primary/5"
                : "border-card-border bg-white hover:border-primary/40"
            }`}
          >
            <span
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
                selected ? "bg-primary text-white" : "bg-gray-bg text-head"
              }`}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-body">
                {option.label}
              </span>
              <span className="block truncate text-xs text-muted">
                {option.sub}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
