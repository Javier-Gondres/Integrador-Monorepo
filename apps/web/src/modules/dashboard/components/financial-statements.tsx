import React from "react";

interface FinancialStatementsProps {
  comparisonData: Array<{
    date: string;
    sales: number;
    purchases: number;
  }>;
  kpis?: {
    salesToday: number;
    salesYesterday: number;
    receivablesBalance: number;
    payablesBalance: number;
    cashOnHand?: number;
    avgCollectionDays?: number;
    avgPaymentDays?: number;
  };
  isLoading?: boolean;
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
  }).format(val);
};

export function FinancialStatements({
  comparisonData,
  kpis,
  isLoading,
}: FinancialStatementsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-7">
        <div className="h-[260px] bg-slate-100 animate-pulse rounded-[20px]"></div>
        <div className="h-[260px] bg-slate-100 animate-pulse rounded-[20px]"></div>
      </div>
    );
  }

  const totalSales = comparisonData.reduce((sum, item) => sum + item.sales, 0);
  const totalPurchases = comparisonData.reduce(
    (sum, item) => sum + item.purchases,
    0,
  );
  const netIncome = totalSales - totalPurchases;
  const profitMargin = totalSales > 0 ? (netIncome / totalSales) * 100 : 0;

  const cashOnHand = kpis?.cashOnHand ?? 0;
  const receivables = kpis?.receivablesBalance ?? 0;
  const totalAssets = cashOnHand + receivables;
  const totalLiabilities = kpis?.payablesBalance ?? 0;
  const equity = totalAssets - totalLiabilities;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-7">
      {/* 1. ESTADO DE RESULTADOS */}
      <div className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200 rounded-[20px] p-6">
        <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="w-6 h-6 text-blue-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 3v16.5m0 0a1.5 1.5 0 001.5 1.5h16.5M5.25 7.5h13.5m-13.5 4h13.5m-13.5 4h13.5"
              />
            </svg>
            <h3 className="text-base font-bold text-slate-800">
              Estado de Resultados
            </h3>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600">
            Periodo Seleccionado
          </span>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 font-medium">
              (+) Ingresos Operacionales (Ventas)
            </span>
            <span className="font-semibold text-emerald-600 tabular-nums">
              {formatCurrency(totalSales)}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 font-medium">
              (-) Costos y Gastos (Compras)
            </span>
            <span className="font-semibold text-rose-600 tabular-nums">
              {formatCurrency(totalPurchases)}
            </span>
          </div>
          <div className="h-px bg-slate-200 my-2"></div>
          <div className="flex justify-between items-center bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
            <span className="text-sm font-bold text-slate-700">
              (=) Resultado Neto (Utilidad)
            </span>
            <div className="flex flex-col items-end">
              <span
                className={
                  "text-base font-extrabold tabular-nums " +
                  (netIncome >= 0 ? "text-emerald-600" : "text-rose-600")
                }
              >
                {formatCurrency(netIncome)}
              </span>
              <span
                className={
                  "text-[11px] font-bold px-2 py-0.5 mt-0.5 rounded-full " +
                  (netIncome >= 0
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                    : "bg-rose-50 text-rose-600 border border-rose-100")
                }
              >
                Margen: {profitMargin.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ESTADO DE SITUACION FINANCIERA */}
      <div className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200 rounded-[20px] p-6">
        <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="w-6 h-6 text-emerald-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z"
              />
            </svg>
            <h3 className="text-base font-bold text-slate-800">
              Estado de Situacion Financiera
            </h3>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">
            Al Dia de Hoy
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <div className="border-l-4 border-slate-300 pl-2 py-0.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Activo
            </span>
          </div>
          <div className="flex justify-between items-center text-sm pl-4">
            <span className="text-slate-500">Efectivo en Caja</span>
            <span className="font-semibold text-slate-700 tabular-nums">
              {formatCurrency(cashOnHand)}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm pl-4">
            <span className="text-slate-500">
              Cuentas por Cobrar (Clientes)
            </span>
            <span className="font-semibold text-slate-700 tabular-nums">
              {formatCurrency(receivables)}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm pl-4 border-t border-dashed border-slate-200 mt-1 pt-1">
            <span className="font-bold text-slate-600">Total Activos</span>
            <span className="font-bold text-slate-700 tabular-nums">
              {formatCurrency(totalAssets)}
            </span>
          </div>
          <div className="h-2"></div>
          <div className="border-l-4 border-slate-300 pl-2 py-0.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Pasivo
            </span>
          </div>
          <div className="flex justify-between items-center text-sm pl-4">
            <span className="text-slate-500">
              Cuentas por Pagar (Proveedores)
            </span>
            <span className="font-semibold text-slate-700 tabular-nums">
              {formatCurrency(totalLiabilities)}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm pl-4 border-t border-dashed border-slate-200 mt-1 pt-1">
            <span className="font-bold text-slate-600">Total Pasivos</span>
            <span className="font-bold text-slate-700 tabular-nums">
              {formatCurrency(totalLiabilities)}
            </span>
          </div>
          <div className="h-2"></div>
          <div className="border-l-4 border-slate-300 pl-2 py-0.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Patrimonio Neto
            </span>
          </div>
          <div className="flex justify-between items-center text-sm pl-4">
            <span className="text-slate-500">
              Capital / Diferencia Patrimonial
            </span>
            <span className="font-semibold text-slate-700 tabular-nums">
              {formatCurrency(equity)}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm pl-4 border-t border-dashed border-slate-200 mt-1 pt-1">
            <span className="font-bold text-slate-600">Total Patrimonio</span>
            <span className="font-bold text-slate-700 tabular-nums">
              {formatCurrency(equity)}
            </span>
          </div>
          <div className="h-px bg-slate-200 my-2"></div>
          <div className="flex justify-between items-center bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
            <span className="text-sm font-bold text-slate-700">
              Total Pasivo y Patrimonio
            </span>
            <span className="text-base font-extrabold text-slate-800 tabular-nums">
              {formatCurrency(totalLiabilities + equity)}
            </span>
          </div>
        </div>
      </div>

      {/* 3. PERIODOS PROMEDIO */}
      <div className="lg:col-span-2 border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200 rounded-[20px] p-6">
        <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="w-6 h-6 text-indigo-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-base font-bold text-slate-800">
              Periodos Promedio de Cobros y Pagos
            </h3>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600">
            Eficiencia Operativa
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Periodo Promedio de Cobro
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Tiempo medio en cobrar a clientes
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-extrabold text-indigo-600 tabular-nums">
                {kpis?.avgCollectionDays ?? 0}
              </span>
              <span className="text-xs font-bold text-slate-500 ml-1">
                dias
              </span>
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Periodo Promedio de Pago
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Tiempo medio en pagar a proveedores
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-extrabold text-rose-500 tabular-nums">
                {kpis?.avgPaymentDays ?? 0}
              </span>
              <span className="text-xs font-bold text-slate-500 ml-1">
                dias
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
