"use client";

import { Minus, Plus } from "lucide-react";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function QuantityStepper({
  value,
  onChange,
  min = 0,
  max,
}: QuantityStepperProps) {
  const clamp = (next: number) => {
    if (next < min) return min;
    if (max !== undefined && next > max) return max;
    return next;
  };

  return (
    <div className="inline-flex items-center rounded-lg border border-card-border bg-white">
      <button
        type="button"
        aria-label="Disminuir"
        className="grid h-8 w-8 place-items-center text-head transition-colors hover:text-primary disabled:opacity-40"
        onClick={() => onChange(clamp(value - 1))}
        disabled={value <= min}
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <input
        className="h-8 w-12 border-x border-card-border bg-transparent text-center text-sm font-semibold text-body tabular-nums outline-none"
        inputMode="numeric"
        value={value}
        onChange={(event) => {
          const parsed = Number(event.target.value.replace(/[^0-9.]/g, ""));
          onChange(clamp(Number.isFinite(parsed) ? parsed : min));
        }}
      />
      <button
        type="button"
        aria-label="Aumentar"
        className="grid h-8 w-8 place-items-center text-head transition-colors hover:text-primary disabled:opacity-40"
        onClick={() => onChange(clamp(value + 1))}
        disabled={max !== undefined && value >= max}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
