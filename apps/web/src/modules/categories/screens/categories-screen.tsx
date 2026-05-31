"use client";

import { useState } from "react";

import { ERP_COLORS as C } from "@/constants/theme";
import { PageHeader } from "@/shared/ui";

import { CategoriesTableContainer } from "../containers/categories-table-container";
import { CategoryFormModalContainer } from "../containers/category-form-modal-container";
import type { Category } from "../types/category.types";

export function CategoriesScreen() {
  const [modalCategory, setModalCategory] = useState<Category | null | undefined>(
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
      <PageHeader breadcrumb="Categorías" title="Categorías" />

      <div
        style={{
          padding: "32px 40px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
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
