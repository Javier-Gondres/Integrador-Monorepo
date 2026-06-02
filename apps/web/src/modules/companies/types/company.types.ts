export type CompanyListItem = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  role: string;
  defaultBranchId: string | null;
  rnc?: string | null;
};
