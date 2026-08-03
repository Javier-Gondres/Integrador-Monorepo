import { Permission } from "@repo/shared";
import { useQuery } from "@tanstack/react-query";

import { usePermissions } from "@/modules/auth/hooks/use-permissions";

import { getRecurringWasteAlerts } from "../api/recurring-waste-alerts";
import { recurringWasteAlertsKeys } from "../query-keys";

export function useRecurringWasteAlerts() {
  const { can } = usePermissions();
  const enabled = can(Permission.INVENTORY_READ);

  return useQuery({
    queryKey: recurringWasteAlertsKeys.list(),
    queryFn: getRecurringWasteAlerts,
    enabled,
  });
}
