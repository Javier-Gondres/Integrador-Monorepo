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
  actions,
}: DataTableToolbarProps) {
  const createButton = (
    <Button
      variant="primary"
      onClick={onCreate}
      className="w-full justify-center sm:w-auto"
    >
      <Plus style={{ width: "16px", height: "16px" }} />
      {createLabel}
    </Button>
  );

  return (
    <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="w-full min-w-0 lg:max-w-80">
        <SearchInput
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="flex w-full min-w-0 flex-wrap items-stretch gap-2 sm:items-center lg:w-auto lg:justify-end">
        <Button variant="icon" onClick={onRefresh} title="Refrescar">
          <RotateCw
            style={{ width: "16px", height: "16px" }}
            className={refreshing ? "animate-spin" : ""}
          />
        </Button>

        {actions ? (
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            {actions}
          </div>
        ) : null}

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
