import { Metadata } from "next";

import { CajasScreen } from "@/modules/cajas/screens/cajas-screen";

export const metadata: Metadata = {
  title: "Cajas | Mi ERP",
  description: "Gestión de cajas y turnos",
};

export default function CajasPage() {
  return <CajasScreen />;
}
