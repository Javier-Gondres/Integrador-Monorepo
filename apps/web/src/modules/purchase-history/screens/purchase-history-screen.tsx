"use client";

import { Plus } from "lucide-react";
import Link from "next/link";

import { Permission } from "@/modules/auth";
import { Can } from "@/shared/ui/can";

import { PurchaseHistoryTableContainer } from "../containers/purchase-history-table-container";

export function PurchaseHistoryScreen() {
  return (
    <main className="min-h-screen bg-page">
      <div className="border-b border-card-border bg-card px-10 py-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-[13px] text-muted">
              Panel / <span className="text-primary">Compras</span>
            </p>
            <h1 className="text-2xl font-bold text-body">
              Historial de compras
            </h1>
            <p className="mt-1 text-sm text-head">
              Consulta las órdenes de compra registradas por sucursal.
            </p>
          </div>
          <Can permission={Permission.PURCHASES_CREATE}>
            <Link
              href="/purchase-orders"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              <Plus className="h-4 w-4" />
              Crear nueva orden
            </Link>
          </Can>
        </div>
      </div>

      <div className="flex flex-col gap-5 px-10 py-8">
        <PurchaseHistoryTableContainer />
      </div>
    </main>
  );
}
