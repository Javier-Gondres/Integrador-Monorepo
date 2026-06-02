export type BranchListItem = {
  id: string;
  name: string;
  address: string | null;
  isActive: boolean;
  companyId: string;
  createdAt: string;
  updatedAt: string;
};

export type MyCompanyListItem = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  role: string;
  defaultBranchId: string | null;
};
