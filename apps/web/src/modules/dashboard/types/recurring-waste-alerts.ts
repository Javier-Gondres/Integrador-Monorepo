export interface InventoryAlert {
  type: "RECURRING_WASTE" | "LOW_STOCK";
  company: {
    id: string;
    name: string;
  };
  branch: {
    id: string;
    name: string;
  };
  product: {
    id: string;
    code: string;
    name: string;
  };
  latestDate?: string;
  latestWasteDate?: string;
  wasteCount?: number;
  periodDays?: number;
}
