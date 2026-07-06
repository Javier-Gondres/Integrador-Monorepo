"use client";

import { ERP_COLORS as C } from "@/constants/theme";
import { Button } from "@/shared/ui/button";
import { Modal } from "@/shared/ui/modal";

import type { ReturnDetail } from "../types/return.types";
import { formatCurrency, formatDate } from "../utils/format";

interface ReturnDetailsModalProps {
  detail: ReturnDetail | undefined;
  loading: boolean;
  onClose: () => void;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
      <span style={{ fontSize: "12px", color: C.mutedText }}>{label}</span>
      <span style={{ fontSize: "14px", fontWeight: 600, color: C.bodyText }}>
        {value}
      </span>
    </div>
  );
}

export function ReturnDetailsModal({
  detail,
  loading,
  onClose,
}: ReturnDetailsModalProps) {
  return (
    <Modal
      title="Detalle de la devolución"
      description="Productos devueltos y monto de la nota de crédito."
      onClose={onClose}
      maxWidth="640px"
    >
      <div
        style={{
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          overflowY: "auto",
        }}
      >
        {loading || !detail ? (
          <p style={{ color: C.mutedText, fontSize: "14px", margin: 0 }}>
            Cargando detalle...
          </p>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "14px",
              }}
            >
              <InfoRow label="Sucursal" value={detail.branchName} />
              <InfoRow label="Fecha" value={formatDate(detail.createdAt)} />
              <InfoRow
                label="Cliente"
                value={detail.customerName ?? "Consumidor final"}
              />
              <InfoRow label="Motivo" value={detail.reasonLabel} />
              <InfoRow label="NCF nota de crédito" value={detail.ncf ?? "—"} />
              <InfoRow
                label="NCF venta original"
                value={detail.saleNcf ?? "—"}
              />
            </div>

            {detail.notes && (
              <div
                style={{
                  padding: "10px 14px",
                  backgroundColor: C.tableHead,
                  borderRadius: "8px",
                  border: `1px solid ${C.divider}`,
                }}
              >
                <span style={{ fontSize: "12px", color: C.mutedText }}>
                  Notas
                </span>
                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: "14px",
                    color: C.bodyText,
                  }}
                >
                  {detail.notes}
                </p>
              </div>
            )}

            <div
              style={{
                border: `1px solid ${C.divider}`,
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "14px",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: C.tableHead }}>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "10px 14px",
                        color: C.headText,
                        fontWeight: 600,
                      }}
                    >
                      Producto
                    </th>
                    <th
                      style={{
                        textAlign: "center",
                        padding: "10px 14px",
                        color: C.headText,
                        fontWeight: 600,
                      }}
                    >
                      Cantidad
                    </th>
                    <th
                      style={{
                        textAlign: "right",
                        padding: "10px 14px",
                        color: C.headText,
                        fontWeight: 600,
                      }}
                    >
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {detail.items.map((item) => (
                    <tr
                      key={item.id}
                      style={{ borderTop: `1px solid ${C.divider}` }}
                    >
                      <td style={{ padding: "10px 14px", color: C.bodyText }}>
                        <span style={{ fontWeight: 600 }}>{item.name}</span>
                        <span
                          style={{
                            marginLeft: "8px",
                            color: C.mutedText,
                            fontSize: "12px",
                          }}
                        >
                          {item.code}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "10px 14px",
                          textAlign: "center",
                          color: C.bodyText,
                        }}
                      >
                        {item.quantity}
                      </td>
                      <td
                        style={{
                          padding: "10px 14px",
                          textAlign: "right",
                          color: C.bodyText,
                        }}
                      >
                        {formatCurrency(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: "6px",
                borderTop: `1px solid ${C.divider}`,
              }}
            >
              <span
                style={{ fontSize: "14px", fontWeight: 600, color: C.headText }}
              >
                Total devuelto
              </span>
              <span
                style={{ fontSize: "18px", fontWeight: 700, color: C.primary }}
              >
                {formatCurrency(detail.total)}
              </span>
            </div>
          </>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
