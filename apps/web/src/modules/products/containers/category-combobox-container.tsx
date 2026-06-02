"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { getCategories } from "@/modules/categories/api/get-categories";
import { mapCategoryDtoToUi } from "@/modules/categories/mappers/category.mapper";
import { categoryKeys } from "@/modules/categories/query-keys";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";

import { CategoryCombobox } from "../components/category-combobox";
import { CATEGORIES_COMBOBOX_PAGE_SIZE } from "../constants";

interface CategoryComboboxContainerProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function CategoryComboboxContainer({
  selectedIds,
  onChange,
}: CategoryComboboxContainerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 450);

  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: categoryKeys.list({
        search: debouncedSearch || undefined,
        take: CATEGORIES_COMBOBOX_PAGE_SIZE,
      }),
      queryFn: ({ pageParam }) =>
        getCategories({
          page: pageParam,
          take: CATEGORIES_COMBOBOX_PAGE_SIZE,
          search: debouncedSearch || undefined,
        }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        const { page, totalPages } = lastPage.meta;
        return page < totalPages ? page + 1 : undefined;
      },
      enabled: open,
    });

  const categories =
    data?.pages.flatMap((page) => page.items.map(mapCategoryDtoToUi)) ?? [];

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
    <CategoryCombobox
      open={open}
      onOpenChange={setOpen}
      search={search}
      onSearchChange={setSearch}
      selectedIds={selectedIds}
      onChange={onChange}
      categories={categories}
      loading={isFetching}
      loadingMore={isFetchingNextPage}
      onListScroll={handleListScroll}
    />
  );
}
