"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { getCategories } from "@/modules/categories/api/get-categories";
import { mapCategoryDtoToUi } from "@/modules/categories/mappers/category.mapper";
import { categoryKeys } from "@/modules/categories/query-keys";
import { CategoryDto } from "@/modules/categories/types/category.types";
import { getProducts } from "@/modules/products/api/get-products";
import { mapProductDtoToUi } from "@/modules/products/mappers/product.mapper";
import { productKeys } from "@/modules/products/query-keys";

import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";

import type { EntityOption } from "../components/entity-selector";
import { EntitySelector } from "../components/entity-selector";
import { ProductDto } from "@/modules/products/types/product.types";

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

function useCategoryOptions(open: boolean, debouncedSearch: string) {
  return useInfiniteQuery({
    queryKey: categoryKeys.list({
      search: debouncedSearch || undefined,
      take: COMBOBOX_PAGE_SIZE,
      isActive: true,
    }),
    queryFn: ({ pageParam }) =>
      getCategories({
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
}

function useProductOptions(open: boolean, debouncedSearch: string) {
  return useInfiniteQuery({
    queryKey: productKeys.list({
      search: debouncedSearch || undefined,
      take: COMBOBOX_PAGE_SIZE,
      isActive: true,
    }),
    queryFn: ({ pageParam }) =>
      getProducts({
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

  const isCategory = entityType === "category";

  const categoryQuery = useCategoryOptions(open && isCategory, debouncedSearch);
  const productQuery = useProductOptions(open && !isCategory, debouncedSearch);

  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } =
    isCategory ? categoryQuery : productQuery;

  const options: EntityOption[] =
    data?.pages.flatMap((page) => {
      if (isCategory) {
        return (page.items as CategoryDto[]).map((dto) => {
          const category = mapCategoryDtoToUi(dto);
          return {
            id: category.id,
            name: category.name,
          } satisfies EntityOption;
        });
      }
      return (page.items as ProductDto[]).map((dto) => {
        const product = mapProductDtoToUi(dto);
        return {
          id: product.id,
          name: product.name,
          subtitle: product.code,
        } satisfies EntityOption;
      });
    }) ?? [];

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
      options={options}
      loading={isFetching}
      loadingMore={isFetchingNextPage}
      onListScroll={handleListScroll}
    />
  );
}
