import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { getSale } from "@/modules/sales/api/get-sale";
import { Modal } from "@/shared/ui/modal";

const fmtCurrency = (value: number) =>
  new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP" }).format(value);

interface SaleDetailModalProps {
  saleId: string;
  onClose: () => void;
}

export function SaleDetailModal({ saleId, onClose }: SaleDetailModalProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["sales", "detail", saleId],
    queryFn: () => getSale(saleId),
    enabled: !!saleId,
  });

  return (
    <Modal
      title="Detalle de Venta"
      description={data?.ncf ? `NCF: ${data.ncf}` : "Cargando venta..."}
      onClose={onClose}
      maxWidth="680px"
    >
      {isLoading ? (
        <p style={{ textAlign: "center", color: "#6B7280", padding: "32px 0" }}>
          Cargando detalles de la venta...
        </p>
      ) : !data ? (
        <p style={{ textAlign: "center", color: "#6B7280", padding: "32px 0" }}>
          No se encontró la venta.
        </p>
      ) : (
        <>
          {/* Summary */}
          <div
            style={{
              backgroundColor: "#F9FAFB",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "20px",
              fontSize: "13px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "6px 12px",
            }}
          >
            <span style={{ color: "#6B7280" }}>Fecha:</span>
            <span style={{ fontWeight: 500 }}>
              {format(new Date(data.createdAt), "dd MMM yyyy HH:mm", { locale: es })}
            </span>
            <span style={{ color: "#6B7280" }}>Cliente:</span>
            <span style={{ fontWeight: 500 }}>
              {data.customerName || "Consumidor Final"}
            </span>
            <span style={{ color: "#6B7280" }}>Subtotal:</span>
            <span style={{ fontWeight: 500 }}>{fmtCurrency(Number(data.subtotal))}</span>
            <span style={{ color: "#6B7280" }}>ITBIS:</span>
            <span style={{ fontWeight: 500 }}>{fmtCurrency(Number(data.taxAmount))}</span>
            <span style={{ color: "#6B7280", fontWeight: 600 }}>Total:</span>
            <span style={{ fontWeight: 700, fontSize: "15px", color: "#4F46E5" }}>
              {fmtCurrency(Number(data.total))}
            </span>
          </div>

          {/* Items table */}
          <h4 style={{ margin: "0 0 10px 0", fontSize: "14px", fontWeight: 600, color: "#111827" }}>
            Productos
          </h4>
          <div style={{ border: "1px solid #E5E7EB", borderRadius: "8px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ backgroundColor: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                  {["Producto", "Cant.", "Precio", "Total"].map((h) => (
                    <th
                      key={h}
                      style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, color: "#374151" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                    <td style={{ padding: "8px 12px", fontWeight: 500, color: "#111827" }}>
                      {item.name}
                    </td>
                    <td style={{ padding: "8px 12px", color: "#6B7280" }}>{item.quantity}</td>
                    <td style={{ padding: "8px 12px", color: "#6B7280" }}>
                      {fmtCurrency(Number(item.unitPrice))}
                    </td>
                    <td style={{ padding: "8px 12px", fontWeight: 600, color: "#111827" }}>
                      {fmtCurrency(Number(item.subtotal))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Modal>
  );
}
