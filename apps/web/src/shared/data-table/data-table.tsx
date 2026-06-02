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

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
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

      <DataTablePagination
        {...pagination}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    </div>
  );
}
