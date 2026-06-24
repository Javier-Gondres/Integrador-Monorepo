import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type {
  CreateReturnPayload,
  ReturnDetailDto,
} from "../types/return.types";

export async function createReturn(payload: CreateReturnPayload) {
  return apiFetch<ReturnDetailDto>(ENDPOINTS.returns.root, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
