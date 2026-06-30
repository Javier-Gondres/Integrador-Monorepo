"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";

import { getCategories } from "@/modules/categories/api/get-categories";
import { mapCategoryDtoToUi } from "@/modules/categories/mappers/category.mapper";
import { categoryKeys } from "@/modules/categories/query-keys";
import type { Category } from "@/modules/categories/types/category.types";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";

import { CategoryCombobox } from "../components/category-combobox";
import { CATEGORIES_COMBOBOX_PAGE_SIZE } from "../constants";

interface CategoryComboboxContainerProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  onCreateClick?: () => void;
  newlyCreatedCategory?: Category | null;
}

export function CategoryComboboxContainer({
  selectedIds,
  onChange,
  onCreateClick,
  newlyCreatedCategory,
}: CategoryComboboxContainerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [extraCategories, setExtraCategories] = useState<
    { id: string; name: string }[]
  >([]);
  const debouncedSearch = useDebouncedValue(search, 450);
  const selectedIdsRef = useRef(selectedIds);
  const onChangeRef = useRef(onChange);

  selectedIdsRef.current = selectedIds;
  onChangeRef.current = onChange;

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

  const categoriesFromQuery =
    data?.pages.flatMap((page) => page.items.map(mapCategoryDtoToUi)) ?? [];

  const categories = useMemo(() => {
    const byId = new Map<string, { id: string; name: string }>();
    for (const category of extraCategories) {
      byId.set(category.id, category);
    }
    for (const category of categoriesFromQuery) {
      byId.set(category.id, { id: category.id, name: category.name });
    }
    return Array.from(byId.values());
  }, [categoriesFromQuery, extraCategories]);

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  useEffect(() => {
    if (!newlyCreatedCategory) return;

    setExtraCategories((prev) => {
      if (prev.some((item) => item.id === newlyCreatedCategory.id)) return prev;
      return [
        ...prev,
        { id: newlyCreatedCategory.id, name: newlyCreatedCategory.name },
      ];
    });

    const currentSelectedIds = selectedIdsRef.current;
    if (!currentSelectedIds.includes(newlyCreatedCategory.id)) {
      onChangeRef.current([...currentSelectedIds, newlyCreatedCategory.id]);
    }
  }, [newlyCreatedCategory]);

  const handleListScroll: React.UIEventHandler<HTMLDivElement> = (e) => {
    const el = e.currentTarget;
    if (isFetchingNextPage || !hasNextPage) return;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 40;
    if (nearBottom) void fetchNextPage();
  };

  const handleCreateClick = () => {
    setOpen(false);
    onCreateClick?.();
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
      onCreateClick={onCreateClick ? handleCreateClick : undefined}
    />
  );
}
