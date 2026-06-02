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
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
      }}
    >
      <SearchInput
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
