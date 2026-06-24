import type { PaginatedResponse } from "@/types/pagination";

import { getReturnReasonLabel } from "../constants";
import type {
  ReturnDetail,
  ReturnDetailDto,
  ReturnListItem,
  ReturnListItemDto,
} from "../types/return.types";

export function mapReturnListItemToUi(dto: ReturnListItemDto): ReturnListItem {
  return {
    id: dto.id,
    reason: dto.reason,
    reasonLabel: getReturnReasonLabel(dto.reason),
    createdAt: dto.createdAt,
    total: dto.total,
    branchName: dto.branch.name,
    ncf: dto.ncf,
    saleNcf: dto.saleNcf,
    customerName: dto.customerName,
    itemsCount: dto.itemsCount,
  };
}

export function mapReturnsPageToUi(
  response: PaginatedResponse<ReturnListItemDto>,
): PaginatedResponse<ReturnListItem> {
  return {
    items: response.items.map(mapReturnListItemToUi),
    meta: response.meta,
  };
}

export function mapReturnDetailToUi(dto: ReturnDetailDto): ReturnDetail {
  return {
    id: dto.id,
    reason: dto.reason,
    reasonLabel: getReturnReasonLabel(dto.reason),
    notes: dto.notes,
    createdAt: dto.createdAt,
    subtotal: dto.subtotal,
    total: dto.total,
    branchName: dto.branch.name,
    ncf: dto.ncf,
    saleNcf: dto.saleNcf,
    customerName: dto.customerName,
    creditNote: dto.creditNote,
    items: dto.items,
  };
}
