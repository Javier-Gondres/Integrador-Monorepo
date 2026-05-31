/** Tipos del dominio roles — pendiente de implementación. */
export interface RoleEntity {
  id: string;
  name: string;
  description?: string | null;
  permissionIds: string[];
  isActive: boolean;
}
