"use client";

import { ReturnDetailsModal } from "../components/return-details-modal";
import { useReturnDetail } from "../hooks/use-return-detail";

interface ReturnDetailsModalContainerProps {
  returnId: string;
  onClose: () => void;
}

export function ReturnDetailsModalContainer({
  returnId,
  onClose,
}: ReturnDetailsModalContainerProps) {
  const { data, isLoading } = useReturnDetail(returnId);

  return (
    <ReturnDetailsModal detail={data} loading={isLoading} onClose={onClose} />
  );
}
