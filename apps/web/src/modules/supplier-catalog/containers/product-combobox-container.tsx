"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { getProducts } from "@/modules/products/api/get-products";
import { productKeys } from "@/modules/products/query-keys";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";

import { ProductCombobox } from "../components/product-combobox";
import { PRODUCTS_COMBOBOX_PAGE_SIZE } from "../constants";
import type { ProductOption } from "../types/supplier-product.types";

interface ProductComboboxContainerProps {
  /** Productos ya asignados a este proveedor se excluyen de la lista. */
  excludeSupplierId: string;
  selected: ProductOption | null;
  onChange: (product: ProductOption | null) => void;
}

export function ProductComboboxContainer({
  excludeSupplierId,
  selected,
  onChange,
}: ProductComboboxContainerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 450);

  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: productKeys.list({
        search: debouncedSearch || undefined,
        take: PRODUCTS_COMBOBOX_PAGE_SIZE,
        excludeSupplierId,
        isActive: true,
      }),
      queryFn: ({ pageParam }) =>
        getProducts({
          page: pageParam,
          take: PRODUCTS_COMBOBOX_PAGE_SIZE,
          search: debouncedSearch || undefined,
          excludeSupplierId,
          isActive: true,
        }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        const { page, totalPages } = lastPage.meta;
        return page < totalPages ? page + 1 : undefined;
      },
      enabled: open,
    });

  const products: ProductOption[] =
    data?.pages.flatMap((page) =>
      page.items.map((product) => ({
        id: product.id,
        code: product.code,
        name: product.name,
        description: product.description,
        price: Number(product.price),
        isActive: product.isActive,
      })),
    ) ?? [];

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  const handleListScroll: React.UIEventHandler<HTMLDivElement> = (e) => {
    const el = e.currentTarget;
    if (isFetchingNextPage || !hasNextPage) return;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 40;
    if (nearBottom) void fetchNextPage();
  };

  const handleSelect = (product: ProductOption) => {
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
