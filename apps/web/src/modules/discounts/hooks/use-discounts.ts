import { useQuery } from "@tanstack/react-query";

import { getDiscounts } from "../api/get-discounts";
import { mapDiscountsPageToUi } from "../mappers/discount.mapper";
import { discountKeys } from "../query-keys";
import type { DiscountFilters } from "../types/discount.types";

export function useDiscounts(filters?: DiscountFilters) {
  return useQuery({
    queryKey: discountKeys.list(filters),
    queryFn: async () => mapDiscountsPageToUi(await getDiscounts(filters)),
  });
}
