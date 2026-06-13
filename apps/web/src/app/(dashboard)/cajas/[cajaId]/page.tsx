import { Metadata } from "next";
import { HistorialCajaScreen } from "@/modules/cajas/screens/historial-caja-screen";

export const metadata: Metadata = {
  title: "Historial de Caja | Mi ERP",
  description: "Historial de turnos de la caja seleccionada",
};

export default async function HistorialCajaPage({
  params,
}: {
  params: Promise<{ cajaId: string }>;
}) {
  const { cajaId } = await params;
  return <HistorialCajaScreen cajaId={cajaId} />;
}
