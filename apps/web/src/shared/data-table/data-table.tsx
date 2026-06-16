import { ERP_COLORS as C } from "@/constants/theme";

import { DataTablePagination } from "./data-table-pagination";
import type { DataTableProps } from "./types";

export function DataTable<T>({
  title,
  columns,
  data,
  loading = false,
  emptyMessage = "No se encontraron resultados.",
  loadingMessage = "Cargando...",
  total,
  getRowKey,
  pagination,
  onPageChange,
  onRowsPerPageChange,
}: DataTableProps<T>) {
  const colSpan = columns.length;

  return (
    <div
      style={{
        backgroundColor: C.cardBg,
        borderRadius: "10px",
        border: `1px solid ${C.cardBorder}`,
        boxShadow: C.cardShadow,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "16px 24px",
          borderBottom: `1px solid ${C.divider}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "16px",
            fontWeight: 600,
            color: C.bodyText,
          }}
        >
          {title}
        </h3>
        <span style={{ fontSize: "13px", color: C.mutedText }}>
          {total} {total === 1 ? "resultado" : "resultados"}
        </span>
      </div>

      <div className="overflow-x-auto w-full pb-4 md:pb-0">
        <table className="w-full border-collapse block md:table">
          <thead className="hidden md:table-header-group">
            <tr style={{ backgroundColor: C.tableHead }}>
              {columns.map((col) => (
                <th
                  key={col.id}
                  style={{
                    padding: "13px 20px",
                    textAlign: col.align ?? "center",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: C.headText,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    borderBottom: `1px solid ${C.divider}`,
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="block md:table-row-group">
            {loading ? (
              <tr className="block md:table-row">
                <td
                  colSpan={colSpan}
                  className="block md:table-cell text-center p-12 text-[14px] text-slate-500"
                >
                  {loadingMessage}
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr className="block md:table-row">
                <td
                  colSpan={colSpan}
                  className="block md:table-cell text-center p-12 text-[14px] text-slate-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={getRowKey(row)}
                  style={{
                    borderBottom:
                      i < data.length - 1 ? `1px solid ${C.divider}` : "none",
                  }}
                  className="group hover:bg-[#F9FAFB] transition-colors flex flex-col md:table-row mb-4 md:mb-0 border md:border-b-0 border-slate-200 md:border-transparent rounded-xl md:rounded-none bg-white md:bg-transparent overflow-hidden shadow-sm md:shadow-none"
                >
                  {columns.map((col) => (
                    <td
                      key={col.id}
                      className="flex md:table-cell justify-between items-center py-3 px-4 md:py-3.5 md:px-5 text-[14px] border-b border-slate-100 md:border-0 last:border-0"
                      style={{
                        textAlign: col.align ?? "center",
                        color: C.bodyText,
                      }}
                    >
                      <span className="md:hidden text-[11px] font-bold text-slate-500 uppercase tracking-wider">{col.header}</span>
                      <div className="text-right md:text-center w-full flex justify-end md:justify-center md:block">
                        {col.cell(row, i)}
                      </div>
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <DataTablePagination
        {...pagination}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    </div>
  );
}
