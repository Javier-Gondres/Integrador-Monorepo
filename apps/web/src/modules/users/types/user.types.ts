/** Tipos del dominio users — pendiente de implementación. */
export interface User {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  roleId?: string;
  companyId?: string;
  branchId?: string;
  isActive: boolean;
}
