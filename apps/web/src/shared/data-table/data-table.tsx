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
      {/* Título + contador */}
      <div
        className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4"
        style={{ borderBottom: `1px solid ${C.divider}` }}
      >
        <h3
          className="text-sm sm:text-base font-semibold"
          style={{ margin: 0, color: C.bodyText }}
        >
          {title}
        </h3>
        <span className="text-[13px]" style={{ color: C.mutedText }}>
          {total} {total === 1 ? "resultado" : "resultados"}
        </span>
      </div>

      {/* ── Desktop: tabla normal ── */}
      <div className="hidden overflow-x-auto lg:block">
        <table style={{ minWidth: "100%", borderCollapse: "collapse" }}>
          <thead>
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
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={colSpan}
                  style={{
                    textAlign: "center",
                    padding: "48px",
                    color: C.mutedText,
                    fontSize: "14px",
                  }}
                >
                  {loadingMessage}
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={colSpan}
                  style={{
                    textAlign: "center",
                    padding: "48px",
                    color: C.mutedText,
                    fontSize: "14px",
                  }}
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
                  className="group hover:bg-[#F9FAFB] transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={col.id}
                      style={{
                        padding: "14px 20px",
                        textAlign: col.align ?? "center",
                        fontSize: "14px",
                        color: C.bodyText,
                      }}
                      className="max-w-[18rem] wrap-break-word align-middle"
                    >
                      {col.cell(row, i)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Mobile: tarjetas ── */}
      <div className="block p-3 lg:hidden">
        {loading ? (
          <div
            className="text-center py-8 text-sm"
            style={{ color: C.mutedText }}
          >
            {loadingMessage}
          </div>
        ) : data.length === 0 ? (
          <div
            className="text-center py-8 text-sm"
            style={{ color: C.mutedText }}
          >
            {emptyMessage}
          </div>
        ) : (
          <div className="flex min-w-0 flex-col gap-3">
            {data.map((row, index) => {
              const actionsCol = columns.find((c) => c.id === "actions");
              const contentCols = columns.filter((c) => c.id !== "actions");

              return (
                <div
                  key={getRowKey(row)}
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: "10px",
                    border: `1px solid ${C.cardBorder}`,
                    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                  }}
                  className="min-w-0 p-3"
                >
                  {contentCols.map((col) => (
                    <div
                      key={col.id}
                      className="grid grid-cols-1 gap-1 py-2 sm:grid-cols-[minmax(5.5rem,40%)_minmax(0,1fr)] sm:gap-3"
                      style={{
                        borderBottom: `1px solid ${C.divider}`,
                      }}
                    >
                      <span
                        className="text-[11px] font-semibold uppercase leading-5"
                        style={{ color: C.headText }}
                      >
                        {col.header}
                      </span>
                      <div
                        className="min-w-0 wrap-break-word text-left text-[13px] leading-5 sm:text-right"
                        style={{ color: C.bodyText }}
                      >
                        {col.cell(row, index)}
                      </div>
                    </div>
                  ))}

                  {actionsCol && (
                    <div className="mt-1 flex flex-wrap justify-stretch gap-2 pt-2 sm:justify-end [&_button]:min-w-0 [&_button]:flex-1 sm:[&_button]:flex-none">
                      {actionsCol.cell(row, index)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <DataTablePagination
        {...pagination}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    </div>
  );
}
