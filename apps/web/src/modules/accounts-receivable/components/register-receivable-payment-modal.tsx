import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useForm } from "react-hook-form";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Modal } from "@/shared/ui/modal";

import type { AccountReceivable } from "../types/accounts-receivable";

const fmtCurrency = (value: number) =>
  new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP" }).format(
    value,
  );

interface FormData {
  amount: number;
  method: string;
  notes: string;
}

interface RegisterReceivablePaymentModalProps {
  receivable: AccountReceivable;
  onClose: () => void;
  onSubmit: (data: { amount: number; method: string; notes?: string }) => void;
  isSubmitting: boolean;
}

export function RegisterReceivablePaymentModal({
  receivable,
  onClose,
  onSubmit,
  isSubmitting,
}: RegisterReceivablePaymentModalProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      amount: Math.max(0, receivable.balance),
      method: "CASH",
      notes: "",
    },
  });

  const amount = watch("amount");

  return (
    <Modal
      title="Registrar Abono"
      description={`Factura: ${receivable.sale.ncf || "N/A"}`}
      onClose={onClose}
      maxWidth="600px"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-6 flex flex-col gap-4 overflow-y-auto"
      >
        {/* Summary */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4.5 mb-5 text-sm md:text-[15px] grid grid-cols-2 gap-x-4 gap-y-2.5">
          <span className="text-gray-500 font-medium">Fecha Venta:</span>
          <span className="font-semibold text-gray-900">
            {format(new Date(receivable.sale.createdAt), "dd MMM yyyy", {
              locale: es,
            })}
          </span>
          <span className="text-gray-500 font-medium">Monto Original:</span>
          <span className="font-semibold text-gray-900">
            {fmtCurrency(receivable.originalAmount)}
          </span>
          <span className="text-gray-500 font-medium">Balance Pendiente:</span>
          <span className="font-bold text-red-600 text-base md:text-lg">
            {fmtCurrency(receivable.balance)}
          </span>
        </div>

        <div className="flex flex-col gap-4">
          <Input
            label="Monto a Abonar"
            type="number"
            step="0.01"
            min="0.01"
            onKeyDown={(e) => {
              if (e.key === "-" || e.key === "e" || e.key === "+") {
                e.preventDefault();
              }
            }}
            max={Math.max(0, receivable.balance)}
            {...register("amount", {
              required: "Monto es requerido",
              min: { value: 0.01, message: "Debe ser mayor a 0" },
              max: {
                value: Math.max(0, receivable.balance),
                message: "No puede ser mayor al balance",
              },
              valueAsNumber: true,
            })}
            error={errors.amount?.message}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-gray-900">
              Método de Pago
            </label>
            <select
              {...register("method", { required: true })}
              className="h-[42px] px-3.5 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white outline-none w-full"
            >
              <option value="CASH">Efectivo</option>
              <option value="CARD">Tarjeta</option>
              <option value="TRANSFER">Transferencia</option>
            </select>
          </div>

          <Input label="Notas (Opcional)" {...register("notes")} />
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={
              isSubmitting ||
              Number(amount) <= 0 ||
              Number(amount) > receivable.balance
            }
          >
            {isSubmitting ? "Guardando..." : "Confirmar Abono"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
