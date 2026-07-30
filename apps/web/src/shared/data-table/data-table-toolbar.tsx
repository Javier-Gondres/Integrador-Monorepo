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
    <Button variant="primary" onClick={onCreate} className="w-full sm:w-auto justify-center">
      <Plus style={{ width: "16px", height: "16px" }} />
      {createLabel}
    </Button>
  );

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <div className="w-full sm:w-80">
        <SearchInput
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-2 justify-between sm:justify-end">
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

