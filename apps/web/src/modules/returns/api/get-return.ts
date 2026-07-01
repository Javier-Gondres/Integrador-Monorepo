import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { ReturnDetailDto } from "../types/return.types";

export async function getReturn(id: string) {
  return apiFetch<ReturnDetailDto>(ENDPOINTS.returns.byId(id));
}
