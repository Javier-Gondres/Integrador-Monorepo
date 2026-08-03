"use client";

import { Plus } from "lucide-react";
import Link from "next/link";

import { Permission } from "@/modules/auth";
import { Can } from "@/shared/ui/can";

import { SalesHistoryTableContainer } from "../containers/sales-history-table-container";

export function SalesHistoryScreen() {
  return (
    <main className="min-h-screen bg-page">
      <div className="border-b border-card-border bg-card px-4 py-4 sm:px-6 sm:py-5 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-[13px] text-muted">
              Panel / <span className="text-primary">Ventas</span>
            </p>
            <h1 className="text-2xl font-bold text-body">
              Historial de ventas
            </h1>
            <p className="mt-1 text-sm text-head">
              Consulta las ventas registradas por sucursal, cajero, caja y
              cliente.
            </p>
          </div>
          <Can permission={Permission.SALES_CREATE}>
            <Link
              href="/sales"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              <Plus className="h-4 w-4" />
              Nueva venta
            </Link>
          </Can>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-4 sm:gap-5 sm:p-6 md:p-8 md:gap-6">
        <SalesHistoryTableContainer />
      </div>
    </main>
  );
}
