export type SortDirection = "asc" | "desc";

export interface SortParams {
  sortBy?: string;
  sortDirection?: SortDirection;
}
