"use client";

import { useEffect, useMemo, useState } from "react";

import { useSuppliers } from "@/modules/suppliers/hooks/use-suppliers";
import type { Supplier } from "@/modules/suppliers/types/supplier.types";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";

import { SupplierRail } from "../components/supplier-rail";

const RAIL_PAGE_SIZE = 100;

interface SupplierRailContainerProps {
  selectedId: string | null;
  onSelect: (supplier: Supplier) => void;
  onCreateSupplier: () => void;
}

export function SupplierRailContainer({
  selectedId,
  onSelect,
  onCreateSupplier,
}: SupplierRailContainerProps) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 450);

  const { data, isLoading } = useSuppliers({
    search: debouncedSearch || undefined,
    take: RAIL_PAGE_SIZE,
  });

  const suppliers = useMemo(() => data?.items ?? [], [data]);

  // Auto-select the first supplier once the list loads and nothing is selected.
  useEffect(() => {
    const first = suppliers[0];
    if (!selectedId && first) {
      onSelect(first);
    }
  }, [selectedId, suppliers, onSelect]);

  return (
    <SupplierRail
      suppliers={suppliers}
      selectedId={selectedId}
      search={search}
      loading={isLoading}
      onSearchChange={setSearch}
      onSelect={onSelect}
      onCreateSupplier={onCreateSupplier}
    />
  );
}
