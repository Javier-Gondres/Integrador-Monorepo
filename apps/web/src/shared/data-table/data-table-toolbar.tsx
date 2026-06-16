import { Plus, RotateCw } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { SearchInput } from "@/shared/ui/input";

import type { DataTableToolbarProps } from "./types";

export function DataTableToolbar({
  searchPlaceholder,
  searchValue,
  onSearchChange,
  onRefresh,
  refreshing = false,
  createLabel,
  onCreate,
}: DataTableToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
      <div className="w-full sm:w-auto flex-1">
        <SearchInput
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-2 sm:gap-3 justify-end">
        <Button variant="icon" onClick={onRefresh} title="Refrescar">
          <RotateCw
            style={{ width: "16px", height: "16px" }}
            className={refreshing ? "animate-spin" : ""}
          />
        </Button>
        <Button variant="primary" onClick={onCreate}>
          <Plus style={{ width: "16px", height: "16px" }} />
          {createLabel}
        </Button>
      </div>
    </div>
  );
}
