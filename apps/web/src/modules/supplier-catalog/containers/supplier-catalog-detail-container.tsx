"use client";

import { useState } from "react";

import type { Supplier } from "@/modules/suppliers/types/supplier.types";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";

import { SupplierCatalogDetail } from "../components/supplier-catalog-detail";
import { SUPPLIER_PRODUCTS_PAGE_SIZE } from "../constants";
import { useSupplierProducts } from "../hooks/use-supplier-products";
import { useToggleSupplierProductStatus } from "../hooks/use-toggle-supplier-product-status";
import type { SupplierProduct } from "../types/supplier-product.types";
import { AssignProductDialogContainer } from "./assign-product-dialog-container";
import { CreateSupplierProductContainer } from "./create-supplier-product-container";

interface SupplierCatalogDetailContainerProps {
  supplier: Supplier;
}

export function SupplierCatalogDetailContainer({
  supplier,
}: SupplierCatalogDetailContainerProps) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 450);
  const [assignOpen, setAssignOpen] = useState(false);
  const [createProductOpen, setCreateProductOpen] = useState(false);

  const { data, isLoading } = useSupplierProducts(supplier.id, {
    search: debouncedSearch || undefined,
    take: SUPPLIER_PRODUCTS_PAGE_SIZE,
  });
  const toggleMutation = useToggleSupplierProductStatus(supplier.id);

  const products = data?.items ?? [];

  const handleToggle = (product: SupplierProduct) => {
    toggleMutation.mutate({
      productId: product.productId,
      isActive: product.isActive,
    });
  };

  return (
    <>
      <SupplierCatalogDetail
        supplier={supplier}
        products={products}
        loading={isLoading}
        search={search}
        onSearchChange={setSearch}
        onAssignClick={() => setAssignOpen(true)}
        onCreateProductClick={() => setCreateProductOpen(true)}
        onToggleStatus={handleToggle}
      />
      {assignOpen && (
        <AssignProductDialogContainer
          supplierId={supplier.id}
          supplierName={supplier.name}
          onClose={() => setAssignOpen(false)}
        />
      )}
      {createProductOpen && (
        <CreateSupplierProductContainer
          supplierId={supplier.id}
          supplierName={supplier.name}
          onClose={() => setCreateProductOpen(false)}
        />
      )}
    </>
  );
}
