"use client";

import { useState } from "react";

import { ERP_COLORS as C } from "@/constants/theme";
import { PageHeader } from "@/shared/ui";

import { ProductFormModalContainer } from "../containers/product-form-modal-container";
import { ProductsTableContainer } from "../containers/products-table-container";
import type { Product } from "../types/product.types";

export function ProductsScreen() {
  const [modalProduct, setModalProduct] = useState<Product | null | undefined>(
    undefined,
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: C.pageBg,
        fontFamily: "inherit",
      }}
    >
      <PageHeader breadcrumb="Productos" title="Productos" />

      <div className="flex flex-col gap-4 p-4 sm:gap-5 sm:p-6 md:p-8 md:gap-6">
        <ProductsTableContainer
          onEdit={setModalProduct}
          onCreate={() => setModalProduct(null)}
        />
      </div>

      {modalProduct !== undefined && (
        <ProductFormModalContainer
          product={modalProduct}
          onClose={() => setModalProduct(undefined)}
        />
      )}
    </main>
  );
}
