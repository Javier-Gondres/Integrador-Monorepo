import { Metadata } from "next";

import { AccountsReceivableScreen } from "@/modules/accounts-receivable/screens/accounts-receivable-screen";

export const metadata: Metadata = {
  title: "Cuentas por Cobrar",
};

export default function AccountsReceivablePage() {
  return <AccountsReceivableScreen />;
}
