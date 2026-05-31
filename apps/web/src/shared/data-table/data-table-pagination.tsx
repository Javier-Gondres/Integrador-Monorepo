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
      style={{
        padding: "14px 24px",
        borderTop: `1px solid ${C.divider}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "13px",
          color: C.headText,
        }}
      >
        <span>Filas por página:</span>
        <PageSizeSelect
          value={rowsPerPage}
          onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <span style={{ fontSize: "13px", color: C.headText }}>
          {total === 0 ? "0–0" : `${startIdx}–${endIdx}`} de {total}
        </span>
        <div style={{ display: "flex", gap: "6px" }}>
          {[
            {
              onClick: () => onPageChange(Math.max(currentPage - 1, 1)),
              disabled: currentPage === 1 || loading,
              Icon: ChevronLeft,
            },
            {
              onClick: () => onPageChange(Math.min(currentPage + 1, totalPages)),
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
