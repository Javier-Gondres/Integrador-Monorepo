"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { getInventories } from "@/modules/inventories/api/get-inventories";
import { ProductCombobox } from "@/modules/inventories/components/product-combobox";
import { PRODUCTS_COMBOBOX_PAGE_SIZE } from "@/modules/inventories/constants";
import { mapInventoriesPageToUi } from "@/modules/inventories/mappers/inventory.mapper";
import { inventoryKeys } from "@/modules/inventories/query-keys";
import type { InventoryProductOption } from "@/modules/inventories/types/inventory.types";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";

interface InventoryComboboxContainerProps {
  branchId: string;
  selected: InventoryProductOption | null;
  onChange: (product: InventoryProductOption | null) => void;
}

export function InventoryComboboxContainer({
  branchId,
  selected,
  onChange,
}: InventoryComboboxContainerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 450);

  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: [
        ...inventoryKeys.list({
          branchId,
          search: debouncedSearch || undefined,
          take: PRODUCTS_COMBOBOX_PAGE_SIZE,
        }),
        "infinite",
      ],
      queryFn: async ({ pageParam = 1 }) => {
        const response = await getInventories({
          branchId,
          page: pageParam,
          take: PRODUCTS_COMBOBOX_PAGE_SIZE,
          search: debouncedSearch || undefined,
        });
        return mapInventoriesPageToUi(response);
      },
      initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        if (lastPage.meta.page < lastPage.meta.totalPages) {
          return lastPage.meta.page + 1;
        }
        return undefined;
      },
      enabled: open && Boolean(branchId),
    });

  const products: InventoryProductOption[] =
    data?.pages.flatMap((page) =>
      page.items.map((inventory) => ({
        id: inventory.productId,
        code: `${inventory.code} · Disponible: ${inventory.available}`,
        name: inventory.name,
        price: inventory.price,
        isActive: inventory.isActive,
      })),
    ) ?? [];

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  useEffect(() => {
    setOpen(false);
    setSearch("");
    onChange(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset al cambiar sucursal
  }, [branchId]);

  const handleListScroll: React.UIEventHandler<HTMLDivElement> = (e) => {
    const el = e.currentTarget;
    if (isFetchingNextPage || !hasNextPage) return;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 40;
    if (nearBottom) void fetchNextPage();
  };

  const handleSelect = (product: InventoryProductOption) => {
    onChange(product);
    setOpen(false);
  };

  return (
    <ProductCombobox
      open={open}
      onOpenChange={setOpen}
      search={search}
      onSearchChange={setSearch}
      selected={selected}
      onSelect={handleSelect}
      products={products}
      loading={isFetching}
      loadingMore={isFetchingNextPage}
      onListScroll={handleListScroll}
    />
  );
}
