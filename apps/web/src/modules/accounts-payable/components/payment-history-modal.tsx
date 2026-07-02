import { useAccountPayable } from "../hooks/use-accounts-payable";
import { formatCurrency, formatDate } from "../utils/formatters";

interface PaymentHistoryModalProps {
  payableId: string;
  onClose: () => void;
}

export function PaymentHistoryModal({
  payableId,
  onClose,
}: PaymentHistoryModalProps) {
  const { data: detail, isLoading, error } = useAccountPayable(payableId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-head">
            Detalle de Cuenta y Abonos
          </h3>
          <button
            onClick={onClose}
            className="text-body/50 hover:text-primary transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {isLoading && (
          <div className="py-8 text-center text-body">Cargando detalles...</div>
        )}

        {error && (
          <div className="py-8 text-center text-red-500">
            Error al cargar los detalles.
          </div>
        )}

        {detail && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4 rounded-lg bg-body/5 p-4">
              <div>
                <p className="text-[13px] font-semibold text-head">Proveedor</p>
                <p className="text-sm text-body">{detail.supplier.name}</p>
              </div>
              <div>
                <p className="text-[13px] font-semibold text-head">
                  Factura / Compra
                </p>
                <p className="text-sm text-body">
                  {detail.purchase.invoiceNumber ||
                    `C-${detail.purchase.id.slice(-6).toUpperCase()}`}
                </p>
              </div>
              <div>
                <p className="text-[13px] font-semibold text-head">
                  Monto Original
                </p>
                <p className="text-sm text-body font-semibold">
                  {formatCurrency(detail.originalAmount)}
                </p>
              </div>
              <div>
                <p className="text-[13px] font-semibold text-head">
                  Balance Actual
                </p>
                <p className="text-sm text-primary font-semibold">
                  {formatCurrency(detail.balance)}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold text-head mb-3">
                Historial de Abonos
              </h4>
              {detail.payments.length === 0 ? (
                <p className="text-sm text-body italic">
                  No se han registrado abonos para esta cuenta.
                </p>
              ) : (
                <div className="border border-card-border rounded-lg overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-body/5 text-head">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Fecha</th>
                        <th className="px-4 py-3 font-semibold">Monto</th>
                        <th className="px-4 py-3 font-semibold">Método</th>
                        <th className="px-4 py-3 font-semibold">Notas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-card-border">
                      {detail.payments.map((payment) => (
                        <tr
                          key={payment.id}
                          className="hover:bg-body/5 transition-colors"
                        >
                          <td className="px-4 py-3 text-body">
                            {formatDate(payment.createdAt)}
                          </td>
                          <td className="px-4 py-3 font-semibold text-body">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="px-4 py-3 text-body">
                            {payment.method}
                          </td>
                          <td
                            className="px-4 py-3 text-body truncate max-w-[200px]"
                            title={payment.notes || ""}
                          >
                            {payment.notes || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
