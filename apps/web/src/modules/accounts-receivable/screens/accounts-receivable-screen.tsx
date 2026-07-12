import { PageHeader } from "@/shared/ui/page-header";

import { AccountsReceivableTableContainer } from "../containers/accounts-receivable-table-container";

export function AccountsReceivableScreen() {
  return (
    <main className="min-h-screen bg-page font-inherit">
      <PageHeader
        breadcrumb="Cuentas por Cobrar"
        title="Cuentas por Cobrar"
      />
      <div className="px-10 py-8 flex flex-col gap-5">
        <AccountsReceivableTableContainer />
      </div>
    </main>
  );
}
