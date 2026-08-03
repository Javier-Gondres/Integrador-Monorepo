"use client";

import { useState } from "react";

import { ERP_COLORS as C } from "@/constants/theme";
import { PageHeader } from "@/shared/ui";

import { CategoriesTableContainer } from "../containers/categories-table-container";
import { CategoryFormModalContainer } from "../containers/category-form-modal-container";
import type { Category } from "../types/category.types";

export function CategoriesScreen() {
  const [modalCategory, setModalCategory] = useState<
    Category | null | undefined
  >(undefined);

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: C.pageBg,
        fontFamily: "inherit",
      }}
    >
      <PageHeader breadcrumb="Categorías" title="Categorías" />

      <div className="flex flex-col gap-4 p-4 sm:gap-5 sm:p-6 md:p-8 md:gap-6">
        <CategoriesTableContainer
          onEdit={setModalCategory}
          onCreate={() => setModalCategory(null)}
        />
      </div>

      {modalCategory !== undefined && (
        <CategoryFormModalContainer
          category={modalCategory}
          onClose={() => setModalCategory(undefined)}
        />
      )}
    </main>
  );
}
