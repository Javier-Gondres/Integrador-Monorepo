import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Eye, HandCoins } from "lucide-react";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Modal } from "@/shared/ui/modal";

import { useCustomerReceivables } from "../hooks/use-accounts-receivable";
import type { AccountReceivable, ReceivableCustomerSummary } from "../types/accounts-receivable";

const fmtCurrency = (value: number) =>
  new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP" }).format(value);

const statusConfig = {
  PAID: { label: "Saldada", variant: "success" as const },
  PARTIAL: { label: "Parcial", variant: "primary" as const },
  OPEN: { label: "Pendiente", variant: "muted" as const },
  OVERDUE: { label: "Vencida", variant: "default" as const },
};

function getStatusConfig(status: string) {
  return statusConfig[status as keyof typeof statusConfig] ?? statusConfig.OPEN;
}

interface CustomerReceivablesModalProps {
  customer: ReceivableCustomerSummary;
  branchId?: string;
  onClose: () => void;
  onPay: (receivable: AccountReceivable) => void;
  onViewHistory: (receivable: AccountReceivable) => void;
  onViewSale: (saleId: string) => void;
}

export function CustomerReceivablesModal({
  customer,
  branchId,
  onClose,
  onPay,
  onViewHistory,
  onViewSale,
}: CustomerReceivablesModalProps) {
  const { data, isLoading } = useCustomerReceivables(customer.id, {
    branchId: branchId && branchId !== "todas" ? branchId : undefined,
    take: 100,
  });

  return (
    <Modal
      title={`${customer.firstName} ${customer.lastName}`}
      description="Facturas a crédito del cliente"
      onClose={onClose}
      maxWidth="900px"
    >
      <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
        {isLoading ? (
          <p className="text-center text-gray-500 py-8">
            Cargando facturas...
          </p>
        ) : !data?.items.length ? (
          <p className="text-center text-gray-500 py-8">
            No hay facturas a crédito pendientes.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {["NCF / Venta", "Sucursal", "Fecha", "Vencimiento", "Estado", "Balance", ""].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-2.5 text-left font-semibold text-gray-700 text-xs"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => {
                  const s = getStatusConfig(item.status);
                  return (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="px-3 py-2.5">
                        <button
                          onClick={() => onViewSale(item.sale.id)}
                          className="text-indigo-600 font-medium bg-transparent border-none cursor-pointer p-0"
                        >
                          {item.sale.ncf || "N/A"}
                        </button>
                      </td>
                      <td className="px-3 py-2.5 text-gray-500">{item.sale.branchName}</td>
                      <td className="px-3 py-2.5 text-gray-500">
                        {format(new Date(item.sale.createdAt), "dd MMM yyyy", { locale: es })}
                      </td>
                      <td className="px-3 py-2.5 text-gray-500">
                        {format(new Date(item.dueDate), "dd MMM yyyy", { locale: es })}
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge variant={s.variant}>{s.label}</Badge>
                      </td>
                      <td className="px-3 py-2.5 font-semibold text-red-600">
                        {fmtCurrency(item.balance)}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <Button variant="icon" size="sm" onClick={() => onViewHistory(item)} title="Ver historial">
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          {item.status !== "PAID" && (
                            <Button variant="primary" size="sm" onClick={() => onPay(item)} title="Abonar">
                              <HandCoins className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Modal>
  );
}
