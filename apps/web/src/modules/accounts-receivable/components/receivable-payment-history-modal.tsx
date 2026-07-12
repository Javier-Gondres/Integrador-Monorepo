import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ReceiptText } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Modal } from "@/shared/ui/modal";

import { useAccountReceivable } from "../hooks/use-accounts-receivable";

const fmtCurrency = (value: number) =>
  new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP" }).format(value);

const methodLabel: Record<string, string> = {
  CASH: "Efectivo",
  CARD: "Tarjeta",
  TRANSFER: "Transferencia",
};

interface ReceivablePaymentHistoryModalProps {
  receivableId: string;
  onClose: () => void;
  onViewSale: (saleId: string) => void;
}

export function ReceivablePaymentHistoryModal({
  receivableId,
  onClose,
  onViewSale,
}: ReceivablePaymentHistoryModalProps) {
  const { data, isLoading } = useAccountReceivable(receivableId);

  return (
    <Modal
      title="Historial de Abonos"
      description={data ? `Factura: ${data.sale.ncf || "N/A"}` : "Cargando..."}
      onClose={onClose}
      maxWidth="800px"
    >
      <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
        {isLoading ? (
          <p className="text-center text-gray-500 py-8">Cargando historial...</p>
        ) : !data ? (
          <p className="text-center text-gray-500 py-8">No se encontró la factura.</p>
        ) : (
          <>
            {/* Summary */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4.5 mb-5 text-sm md:text-[15px] grid grid-cols-2 gap-x-4 gap-y-2.5">
              <span className="text-gray-500 font-medium">Cliente:</span>
              <span className="font-semibold text-gray-900">
                {data.customer.firstName} {data.customer.lastName}
              </span>
              <span className="text-gray-500 font-medium">NCF / Factura:</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">{data.sale.ncf || "N/A"}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewSale(data.sale.id)}
                  title="Ver detalle de venta"
                >
                  <ReceiptText className="w-3.5 h-3.5" />
                  Ver venta
                </Button>
              </div>
              <span className="text-gray-500 font-medium">Monto Original:</span>
              <span className="font-semibold text-gray-900">{fmtCurrency(data.originalAmount)}</span>
              <span className="text-gray-500 font-medium">Balance Actual:</span>
              <span className="font-bold text-red-600 text-base md:text-lg">{fmtCurrency(data.balance)}</span>
            </div>

            {/* Payments table */}
            <h4 className="m-0 mb-2.5 text-sm font-semibold text-gray-900">
              Pagos Registrados
            </h4>
            {!data.payments.length ? (
              <p className="text-gray-500 text-[13px] italic">
                No hay abonos registrados aún.
              </p>
            ) : (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full border-collapse text-[13px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      {["Fecha", "Método", "Notas", "Monto"].map((h) => (
                        <th
                          key={h}
                          className="px-3 py-2 text-left font-semibold text-gray-700"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.payments.map((payment) => (
                      <tr key={payment.id} className="border-b border-gray-100 last:border-b-0">
                        <td className="px-3 py-2 text-gray-500">
                          {format(new Date(payment.createdAt), "dd MMM yyyy HH:mm", { locale: es })}
                        </td>
                        <td className="px-3 py-2">{methodLabel[payment.method] ?? payment.method}</td>
                        <td className="px-3 py-2 text-gray-400 text-xs">
                          {payment.notes ?? "—"}
                        </td>
                        <td className="px-3 py-2 font-semibold text-gray-900">
                          {fmtCurrency(payment.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
