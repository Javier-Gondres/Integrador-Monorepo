"use client";

import { AccountsPayableTableContainer } from "../containers/accounts-payable-table-container";

export function AccountsPayableScreen() {
  return (
    <main className="min-h-screen bg-page">
      <div className="border-b border-card-border bg-card px-10 py-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-[13px] text-muted">
              Panel / <span className="text-primary">Finanzas</span>
            </p>
            <h1 className="text-2xl font-bold text-body">Cuentas por pagar</h1>
            <p className="mt-1 text-sm text-head">
              Consulta y administra el estado de tus cuentas con proveedores.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5 px-10 py-8">
        <AccountsPayableTableContainer />
      </div>
    </main>
  );
}
