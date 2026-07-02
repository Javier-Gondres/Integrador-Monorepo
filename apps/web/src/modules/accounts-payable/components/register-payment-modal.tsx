import { useState } from "react";
import { AccountPayable } from "../types/accounts-payable";
import { formatCurrency } from "../utils/formatters";

interface RegisterPaymentModalProps {
  payable: AccountPayable;
  onClose: () => void;
  onSubmit: (data: { amount: number; method: string; notes?: string }) => void;
  isSubmitting: boolean;
}

export function RegisterPaymentModal({
  payable,
  onClose,
  onSubmit,
  isSubmitting,
}: RegisterPaymentModalProps) {
  const [amount, setAmount] = useState<string>("");
  const [method, setMethod] = useState<string>("CASH");
  const [notes, setNotes] = useState<string>("");

  const numAmount = Number(amount);
  const isValidAmount = numAmount > 0 && numAmount <= payable.balance;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValidAmount) {
      onSubmit({ amount: numAmount, method, notes });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h3 className="mb-2 text-lg font-bold text-head">Registrar Abono</h3>
        <p className="mb-6 text-sm text-body">
          Abonar a compra{" "}
          <strong>
            {payable.purchase.invoiceNumber ||
              `C-${payable.purchase.id.slice(-6).toUpperCase()}`}
          </strong>{" "}
          de {payable.supplier.name}.
          <br />
          Pendiente:{" "}
          <span className="font-semibold text-primary">
            {formatCurrency(payable.balance)}
          </span>
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold text-head">
              Monto a abonar
            </span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={payable.balance}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
              className="h-10 rounded-lg border border-input-border bg-white px-3 text-sm text-body outline-none focus:border-primary"
            />
            {amount && !isValidAmount && (
              <span className="text-xs text-error">
                El monto debe ser mayor a 0 y menor o igual al balance (
                {formatCurrency(payable.balance)}).
              </span>
            )}
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold text-head">
              Método de pago
            </span>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="h-10 rounded-lg border border-input-border bg-white px-3 text-sm text-body outline-none focus:border-primary"
            >
              <option value="CASH">Efectivo</option>
              <option value="CARD">Tarjeta</option>
              <option value="TRANSFER">Transferencia</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold text-head">
              Notas (opcional)
            </span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Referencia de transferencia, etc."
              className="min-h-20 resize-y rounded-lg border border-input-border bg-white p-3 text-sm text-body outline-none focus:border-primary"
            />
          </label>

          <div className="mt-2 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-input-border px-4 py-2 text-sm font-semibold text-head transition-colors hover:bg-body/5"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!isValidAmount || isSubmitting}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
            >
              {isSubmitting ? "Guardando..." : "Confirmar abono"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
