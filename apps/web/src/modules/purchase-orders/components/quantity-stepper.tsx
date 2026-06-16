import { Minus, Plus } from "lucide-react";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
}

export function QuantityStepper({ value, onChange }: QuantityStepperProps) {
  return (
    <div className="inline-flex items-center rounded-lg border border-card-border bg-white">
      <button
        type="button"
        aria-label="Disminuir"
        onClick={() => onChange(value - 1)}
        className="flex h-8 w-8 items-center justify-center text-head transition-colors hover:text-body"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <input
        type="number"
        min={1}
        value={value}
        onChange={(e) => {
          const parsed = parseInt(e.target.value, 10);
          onChange(Number.isFinite(parsed) ? parsed : 0);
        }}
        className="h-8 w-12 border-x border-card-border text-center text-sm font-semibold text-body outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        aria-label="Aumentar"
        onClick={() => onChange(value + 1)}
        className="flex h-8 w-8 items-center justify-center text-head transition-colors hover:text-body"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
