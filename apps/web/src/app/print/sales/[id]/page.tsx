import { Metadata } from "next";

import { InvoicePrintScreen } from "@/modules/invoice-print/screens/invoice-print-screen";

export const metadata: Metadata = {
  title: "Factura | Mi ERP",
  description: "Representación impresa de la factura",
};

export default async function InvoicePrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <InvoicePrintScreen id={id} />;
}
