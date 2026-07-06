import { useQuery } from "@tanstack/react-query";

import { getSaleProducts } from "../api/get-sale-products";
import { saleKeys } from "../query-keys";

export function useSaleProducts(
  branchId: string | null,
  search: string,
  categoryId: string | null,
) {
  return useQuery({
    queryKey: saleKeys.products(branchId, search, categoryId),
    queryFn: () =>
      getSaleProducts({
        branchId: branchId as string,
        search: search.trim() || undefined,
        categoryId: categoryId ?? undefined,
      }),
    enabled: Boolean(branchId),
    // El stock disponible cambia con compras/ventas/devoluciones/ajustes en otros
    // módulos: refrescar siempre al entrar o volver a la página de facturación.
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
}
