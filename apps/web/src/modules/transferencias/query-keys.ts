import type { TransferStatus } from "./types/transferencia.types";

export const transferKeys = {
  all: ["transferencias"] as const,

  list: (page: number, take: number, status?: TransferStatus) =>
    ["transferencias", "list", { page, take, status }] as const,

  inventoryForBranch: (branchId?: string) =>
    ["inventory-for-transfers", branchId] as const,
};
