"use client";

import { useEffect, useRef } from "react";

import { useSale } from "@/modules/sales-history/hooks/use-sale";

import { InvoiceReceipt } from "../components/invoice-receipt";

interface InvoicePrintScreenProps {
  id: string;
}

export function InvoicePrintScreen({ id }: InvoicePrintScreenProps) {
  const { data: sale, isLoading, isError } = useSale(id);
  const hasPrinted = useRef(false);

  useEffect(() => {
    if (sale && !hasPrinted.current) {
      hasPrinted.current = true;
      // Espera a que el layout del recibo pinte antes de abrir el diálogo.
      const timer = setTimeout(() => window.print(), 300);
      return () => clearTimeout(timer);
    }
  }, [sale]);

  if (isLoading) {
    return <CenteredMessage>Cargando factura…</CenteredMessage>;
  }

  if (isError || !sale) {
    return <CenteredMessage>No se pudo cargar la factura.</CenteredMessage>;
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="no-print flex justify-center gap-2 p-4">
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white"
        >
          Imprimir
        </button>
        <button
          type="button"
          onClick={() => window.close()}
          className="rounded-md border border-gray-border px-4 py-2 text-sm font-semibold text-gray-text"
        >
          Cerrar
        </button>
      </div>
      <InvoiceReceipt sale={sale} />
    </div>
  );
}

function CenteredMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-10 text-center text-sm text-black">
      {children}
    </div>
  );
}
