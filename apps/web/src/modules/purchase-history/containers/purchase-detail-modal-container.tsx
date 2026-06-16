"use client";

import { PurchaseDetailModal } from "../components/purchase-detail-modal";
import { usePurchase } from "../hooks/use-purchase";

interface PurchaseDetailModalContainerProps {
  purchaseId: string;
  fallbackTitle: string;
  onClose: () => void;
}

export function PurchaseDetailModalContainer({
  purchaseId,
  fallbackTitle,
  onClose,
}: PurchaseDetailModalContainerProps) {
  const { data, isLoading } = usePurchase(purchaseId);

  return (
    <PurchaseDetailModal
      purchase={data}
      loading={isLoading}
      fallbackTitle={fallbackTitle}
      onClose={onClose}
    />
  );
}
