import { useQuery } from "@tanstack/react-query";

import { getRecurringWasteAlerts } from "../api/recurring-waste-alerts";
import { recurringWasteAlertsKeys } from "../query-keys";

export function useRecurringWasteAlerts() {
  return useQuery({
    queryKey: recurringWasteAlertsKeys.list(),
    queryFn: getRecurringWasteAlerts,
  });
}
