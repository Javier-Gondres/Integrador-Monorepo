import { Injectable } from '@nestjs/common';
import {
  AuthException,
  BusinessException,
  ErrorCodes,
} from 'src/common/errors';

import { BranchRepository } from './branch.repository';

@Injectable()
export class BranchAccessService {
  constructor(private readonly branchRepository: BranchRepository) {}

  /**
   * Capa 2 de acceso tenant: sucursal en la empresa y activa.
   * Ver `common/tenant-access/tenant-access.policy.ts`.
   *
   * Usar en flujos branch-scoped (caja, empleados, switchBranch, etc.).
   * No aplica a catálogo company-wide ni a gestión admin de sucursales.
   */
  async assertBranchInCompany(
    branchId: string,
    companyId: string,
  ): Promise<void> {
    const branch = await this.branchRepository.findByIdInCompany(
      branchId,
      companyId,
    );

    if (!branch) {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'La sucursal no existe en esta empresa',
      );
    }

    if (!branch.isActive) {
      throw AuthException.unauthorizedCompanyAccess(
        'La sucursal está inactiva. No puedes realizar operaciones en este momento.',
      );
    }
  }

  /**
   * Resuelve el branchId efectivo y valida pertenencia + estado activo.
   */
  async resolveBranchId(
    companyId: string,
    branchId: string | undefined,
    fallbackBranchId: string | null | undefined,
  ): Promise<string> {
    const resolved = branchId?.trim() || fallbackBranchId;

    if (!resolved) {
      throw new BusinessException(
        ErrorCodes.UNAUTHORIZED,
        'Debe seleccionar una sucursal activa',
      );
    }

    await this.assertBranchInCompany(resolved, companyId);
    return resolved;
  }
}
