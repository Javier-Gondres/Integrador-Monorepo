"use client";

import { Plus, RotateCw } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Can } from "@/shared/ui/can";
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
  createPermission,
}: DataTableToolbarProps) {
  const createButton = (
    <Button variant="primary" onClick={onCreate}>
      <Plus style={{ width: "16px", height: "16px" }} />
      {createLabel}
    </Button>
  );

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
        {createLabel ? (
          createPermission ? (
            <Can permission={createPermission}>{createButton}</Can>
          ) : (
            createButton
          )
        ) : null}
      </div>
    </div>
  );
}
