import { ChevronLeft, ChevronRight } from "lucide-react";

import { ERP_COLORS as C } from "@/constants/theme";
import { Button } from "@/shared/ui/button";
import { PageSizeSelect } from "@/shared/ui/select";

import type { DataTablePaginationState } from "./types";

interface DataTablePaginationProps extends DataTablePaginationState {
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
}

export function DataTablePagination({
  total,
  currentPage,
  totalPages,
  rowsPerPage,
  loading = false,
  onPageChange,
  onRowsPerPageChange,
}: DataTablePaginationProps) {
  const startIdx = total === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endIdx = Math.min(currentPage * rowsPerPage, total);

  return (
    <div
      className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-6"
      style={{ borderTop: `1px solid ${C.divider}` }}
    >
      {/* Filas por página */}
      <div
        className="flex w-full items-center justify-between gap-2 text-[13px] sm:w-auto sm:justify-start"
        style={{ color: C.headText }}
      >
        <span className="hidden sm:inline">Filas por página:</span>
        <span className="sm:hidden text-xs">Filas:</span>
        <PageSizeSelect
          value={rowsPerPage}
          onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
        />
      </div>

      {/* Rango + navegación */}
      <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
        <span className="text-[13px]" style={{ color: C.headText }}>
          {total === 0 ? "0–0" : `${startIdx}–${endIdx}`} de {total}
        </span>
        <div className="flex gap-1.5">
          {[
            {
              onClick: () => onPageChange(Math.max(currentPage - 1, 1)),
              disabled: currentPage === 1 || loading,
              Icon: ChevronLeft,
            },
            {
              onClick: () =>
                onPageChange(Math.min(currentPage + 1, totalPages)),
              disabled: currentPage === totalPages || loading,
              Icon: ChevronRight,
            },
          ].map(({ onClick, disabled, Icon }, i) => (
            <Button
              key={i}
              variant="icon"
              onClick={onClick}
              disabled={disabled}
              style={{
                width: "32px",
                height: "32px",
                color: disabled ? C.mutedText : C.bodyText,
                opacity: disabled ? 0.4 : 1,
              }}
            >
              <Icon style={{ width: "15px", height: "15px" }} />
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
