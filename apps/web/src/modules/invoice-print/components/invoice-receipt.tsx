import type { SaleDetailDto } from "@/modules/sales/types/sale.types";
import { money } from "@/modules/sales/utils/format";
import { formatDate } from "@/modules/sales-history/utils/format-date";

import { ncfTypeLabel } from "../utils/ncf-label";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: "Efectivo",
  CARD: "Tarjeta",
  TRANSFER: "Transferencia",
  CREDIT: "Crédito",
};

interface InvoiceReceiptProps {
  sale: SaleDetailDto;
}

/**
 * Recibo térmico 80mm (Representación Impresa de la factura). Pensado para
 * imprimirse con `@page { size: 80mm auto }` — ver el bloque `@media print`
 * en globals.css.
 */
export function InvoiceReceipt({ sale }: InvoiceReceiptProps) {
  const { day, time } = formatDate(sale.createdAt);
  const address = sale.company.address ?? sale.branch.address;

  return (
    <div className="receipt mx-auto w-[58mm] max-w-full bg-white px-2 py-3 font-mono text-[10px] leading-tight text-black">
      {/* Emisor */}
      <header className="text-center">
        <h1 className="text-[13px] font-bold uppercase">{sale.company.name}</h1>
        {sale.company.rnc && <div>RNC: {sale.company.rnc}</div>}
        {address && <div className="whitespace-pre-line">{address}</div>}
        {sale.company.phone && <div>Tel: {sale.company.phone}</div>}
        <div className="mt-1 font-semibold">{sale.branch.name}</div>
      </header>

      <Divider />

      {/* Documento */}
      <section className="space-y-0.5">
        <div className="text-center font-semibold uppercase">
          {ncfTypeLabel(sale.ncfType)}
        </div>
        {sale.ncf && <Row label="NCF" value={sale.ncf} />}
        <Row label="Fecha" value={`${day} ${time}`} />
        {sale.cashierName && <Row label="Cajero" value={sale.cashierName} />}
      </section>

      <Divider />

      {/* Cliente */}
      <section className="space-y-0.5">
        <div className="font-semibold">Cliente</div>
        <div>{sale.customer?.name ?? "Consumidor Final"}</div>
        {sale.customer?.rnc && <div>RNC: {sale.customer.rnc}</div>}
        {!sale.customer?.rnc && sale.customer?.cedula && (
          <div>Cédula: {sale.customer.cedula}</div>
        )}
      </section>

      <Divider />

      {/* Líneas */}
      <section>
        {sale.items.map((item) => {
          const lineDiscount = item.discountAmount ?? 0;
          return (
            <div key={item.id} className="mb-1">
              <div className="font-semibold">{item.name}</div>
              <div className="flex justify-between tabular-nums">
                <span>
                  {item.quantity} x {money(item.unitPrice)}
                </span>
                <span>{money(item.subtotal)}</span>
              </div>
              {lineDiscount > 0 && (
                <div className="flex justify-between tabular-nums text-[10px]">
                  <span>Descuento</span>
                  <span>-{money(lineDiscount)}</span>
                </div>
              )}
            </div>
          );
        })}
      </section>

      <Divider />

      {/* Totales */}
      <section className="space-y-0.5">
        <Row label="Subtotal" value={money(sale.subtotal)} mono />
        <Row label="ITBIS (18%)" value={money(sale.taxAmount)} mono />
        <div className="flex justify-between border-t border-dashed border-black pt-1 text-[12px] font-bold tabular-nums">
          <span>Total</span>
          <span>{money(sale.total)}</span>
        </div>
      </section>

      {sale.payments.length > 0 && (
        <>
          <Divider />
          <section className="space-y-0.5">
            {sale.payments.map((payment) => (
              <Row
                key={payment.id}
                label={PAYMENT_METHOD_LABELS[payment.method] ?? payment.method}
                value={money(payment.amount)}
                mono
              />
            ))}
          </section>
        </>
      )}

      {sale.creditNotesApplied.length > 0 && (
        <section className="mt-1 space-y-0.5">
          {sale.creditNotesApplied.map((note) => (
            <Row
              key={note.id}
              label={`Nota de crédito ${note.ncf ?? ""}`.trim()}
              value={`-${money(note.amount)}`}
              mono
            />
          ))}
        </section>
      )}

      {sale.accountReceivable && (
        <section className="mt-1">
          <Row
            label="Balance pendiente"
            value={money(sale.accountReceivable.balance)}
            mono
          />
        </section>
      )}

      <Divider />

      <footer className="text-center text-[10px]">
        <div>¡Gracias por su compra!</div>
      </footer>
    </div>
  );
}

function Divider() {
  return <div className="my-2 border-t border-dashed border-black" />;
}

function Row({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between gap-2">
      <span>{label}</span>
      <span className={mono ? "tabular-nums" : undefined}>{value}</span>
    </div>
  );
}
