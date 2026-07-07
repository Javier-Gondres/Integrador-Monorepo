export const recurringWasteAlertsKeys = {
  all: ["recurring-waste-alerts"] as const,
  list: () => [...recurringWasteAlertsKeys.all, "list"] as const,
};
