"use client";

import { useState } from "react";

import { ERP_COLORS as C } from "@/constants/theme";
import { PageHeader } from "@/shared/ui";

import { DiscountFormModalContainer } from "../containers/discount-form-modal-container";
import { DiscountsTableContainer } from "../containers/discounts-table-container";
import type { Discount } from "../types/discount.types";

export function DiscountsScreen() {
  const [modalDiscount, setModalDiscount] = useState<
    Discount | null | undefined
  >(undefined);

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: C.pageBg,
        fontFamily: "inherit",
      }}
    >
      <PageHeader breadcrumb="Descuentos" title="Descuentos" />

      <div className="flex flex-col gap-4 p-4 sm:gap-5 sm:p-6 md:p-8 md:gap-6">
        <DiscountsTableContainer
          onEdit={setModalDiscount}
          onCreate={() => setModalDiscount(null)}
        />
      </div>

      {modalDiscount !== undefined && (
        <DiscountFormModalContainer
          discount={modalDiscount}
          onClose={() => setModalDiscount(undefined)}
        />
      )}
    </main>
  );
}
