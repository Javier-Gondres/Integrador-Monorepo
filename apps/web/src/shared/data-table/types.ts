import type { ReactNode } from "react";

export type DataTableAlign = "left" | "center" | "right";

export interface DataTableColumn<T> {
  id: string;
  header: string;
  align?: DataTableAlign;
  cell: (row: T, index: number) => ReactNode;
}

export interface DataTablePaginationState {
  total: number;
  currentPage: number;
  totalPages: number;
  rowsPerPage: number;
  loading?: boolean;
}

export interface DataTableProps<T> {
  title: string;
  columns: DataTableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  loadingMessage?: string;
  total: number;
  getRowKey: (row: T) => string;
  pagination: DataTablePaginationState;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
}

export interface DataTableToolbarProps {
  searchPlaceholder: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  refreshing?: boolean;
  createLabel: string;
  onCreate: () => void;
}
