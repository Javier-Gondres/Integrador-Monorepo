"use client";

import { SaleDetailModal } from "../components/sale-detail-modal";
import { useSale } from "../hooks/use-sale";

interface SaleDetailModalContainerProps {
  saleId: string;
  fallbackTitle: string;
  onClose: () => void;
}

export function SaleDetailModalContainer({
  saleId,
  fallbackTitle,
  onClose,
}: SaleDetailModalContainerProps) {
  const { data, isLoading } = useSale(saleId);

  return (
    <SaleDetailModal
      sale={data}
      loading={isLoading}
      fallbackTitle={fallbackTitle}
      onClose={onClose}
    />
  );
}
