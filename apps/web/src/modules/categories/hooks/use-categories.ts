import { useQuery } from "@tanstack/react-query";

import { getCategories } from "../api/get-categories";
import { mapCategoriesPageToUi } from "../mappers/category.mapper";
import { categoryKeys } from "../query-keys";
import type { CategoryFilters } from "../types/category.types";

export function useCategories(filters?: CategoryFilters) {
  return useQuery({
    queryKey: categoryKeys.list(filters),
    queryFn: async () => mapCategoriesPageToUi(await getCategories(filters)),
  });
}
