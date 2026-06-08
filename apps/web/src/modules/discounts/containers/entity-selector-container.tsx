"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { getCategories } from "@/modules/categories/api/get-categories";
import { mapCategoryDtoToUi } from "@/modules/categories/mappers/category.mapper";
import { categoryKeys } from "@/modules/categories/query-keys";
import { getProducts } from "@/modules/products/api/get-products";
import { mapProductDtoToUi } from "@/modules/products/mappers/product.mapper";
import { productKeys } from "@/modules/products/query-keys";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";

import { EntitySelector } from "../components/entity-selector";

const COMBOBOX_PAGE_SIZE = 10;

interface EntitySelectorContainerProps {
  entityType: "category" | "product";
  label: string;
  placeholder: string;
  searchPlaceholder: string;
  emptyMessage: string;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function EntitySelectorContainer({
  entityType,
  label,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  selectedIds,
  onChange,
}: EntitySelectorContainerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 450);

  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey:
        entityType === "category"
          ? categoryKeys.list({
              search: debouncedSearch || undefined,
              take: COMBOBOX_PAGE_SIZE,
              isActive: true,
            })
          : productKeys.list({
              search: debouncedSearch || undefined,
              take: COMBOBOX_PAGE_SIZE,
              isActive: true,
            }),
      queryFn: ({ pageParam }) =>
        entityType === "category"
          ? getCategories({
              page: pageParam,
              take: COMBOBOX_PAGE_SIZE,
              search: debouncedSearch || undefined,
              isActive: true,
            })
          : getProducts({
              page: pageParam,
              take: COMBOBOX_PAGE_SIZE,
              search: debouncedSearch || undefined,
              isActive: true,
            }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        const { page, totalPages } = lastPage.meta;
        return page < totalPages ? page + 1 : undefined;
      },
      enabled: open,
    });

  const options =
    data?.pages.flatMap((page) =>
      entityType === "category"
        ? page.items.map(mapCategoryDtoToUi)
        : page.items.map(mapProductDtoToUi),
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

  return (
    <EntitySelector
      label={label}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      emptyMessage={emptyMessage}
      open={open}
      onOpenChange={setOpen}
      search={search}
      onSearchChange={setSearch}
      selectedIds={selectedIds}
      onChange={onChange}
      options={options.map((option) => ({
        id: option.id,
        name: option.name,
        subtitle: entityType === "product" ? option.code : undefined,
      }))}
      loading={isFetching}
      loadingMore={isFetchingNextPage}
      onListScroll={handleListScroll}
    />
  );
}