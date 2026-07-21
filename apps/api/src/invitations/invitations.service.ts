import { createHash, randomBytes } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InvitationStatus } from '@repo/db';
import * as bcrypt from 'bcrypt';

import { AuthService } from '../auth/auth.service';
import { AuthContext } from '../auth/auth.types';
import { BusinessException, ErrorCodes } from '../common/errors';
import { EmailService } from '../email/email.service';
import { assertAssignableRole } from '../users/helpers/assert-assignable-role';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { RegisterInvitationDto } from './dto/register-invitation.dto';
import {
  InvitationRecord,
  InvitationsRepository,
  InvitationWithTokenRecord,
  PlatformInvitationsQuery,
} from './invitations.repository';

const INVITATION_TOKEN_BYTES = 32;
const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const PASSWORD_HASH_ROUNDS = 10;

export type InvitationRecipientFlow = 'register' | 'login' | 'blocked';

@Injectable()
export class InvitationsService {
  constructor(
    private readonly invitationsRepository: InvitationsRepository,
    private readonly emailService: EmailService,
    private readonly config: ConfigService,
    private readonly authService: AuthService,
  ) {}

  findAll(companyId: string) {
    return this.invitationsRepository.findManyByCompany(companyId);
  }

  async findAllForPlatform(query: PlatformInvitationsQuery) {
    const { items, total } =
      await this.invitationsRepository.findManyForPlatform(query);
    return {
      items,
      meta: {
        page: query.page,
        take: query.take,
        total,
        totalPages: Math.ceil(total / query.take) || 0,
      },
    };
  }

  async findByToken(token: string) {
    const invitation = await this.getInvitationByToken(token);
    return this.toPublicInvitation(invitation);
  }

  async create(auth: AuthContext, companyId: string, dto: CreateInvitationDto) {
    assertAssignableRole(auth.role, dto.role);

    const email = this.normalizeEmail(dto.email);
    const existingUser =
      await this.invitationsRepository.findUserByEmail(email);

    if (existingUser?.memberships[0]) {
      throw BusinessException.conflict(
        ErrorCodes.DUPLICATE_RECORD,
        'Este usuario ya pertenece a otra empresa',
      );
    }

    const pending =
      await this.invitationsRepository.findPendingByCompanyAndEmail(
        companyId,
        email,
      );

    if (pending && pending.expiresAt > new Date()) {
      throw BusinessException.conflict(
        ErrorCodes.DUPLICATE_RECORD,
        'Ya existe una invitación pendiente para este email',
      );
    }

    if (pending) {
      await this.invitationsRepository.markExpired(pending.id);
    }

    const token = this.generateToken();
    const invitation = await this.invitationsRepository.create({
      companyId,
      email,
      roleName: dto.role,
      invitedById: auth.userId,
      tokenHash: this.hashToken(token),
      expiresAt: new Date(Date.now() + INVITATION_TTL_MS),
    });

    if (!invitation) {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'El rol no existe',
      );
    }

    await this.sendInvitation(invitation, token);
    return invitation;
  }

  async resend(id: string, companyId: string) {
    const invitation = await this.getInvitationByIdInCompany(id, companyId);
    this.assertCanResend(invitation);

    const token = this.generateToken();
    const updated = await this.invitationsRepository.resend(
      invitation.id,
      this.hashToken(token),
      new Date(Date.now() + INVITATION_TTL_MS),
    );

    await this.sendInvitation(updated, token);
    return updated;
  }

  async revoke(id: string, companyId: string) {
    const invitation = await this.getInvitationByIdInCompany(id, companyId);
    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BusinessException(
        ErrorCodes.VALIDATION_ERROR,
        'Solo se pueden revocar invitaciones pendientes',
      );
    }

    return this.invitationsRepository.revoke(id);
  }

  async resendForPlatform(id: string, actor: AuthContext) {
    const invitation = await this.getInvitationByIdForPlatform(id);
    this.assertCanResend(invitation);

    const token = this.generateToken();
    const updated = await this.invitationsRepository.resend(
      invitation.id,
      this.hashToken(token),
      new Date(Date.now() + INVITATION_TTL_MS),
    );

    await this.sendInvitation(updated, token);
    await this.invitationsRepository.auditPlatformAction({
      actorId: actor.userId,
      invitationId: updated.id,
      companyId: updated.company.id,
      action: 'PLATFORM_INVITATION_RESENT',
      metadata: { email: updated.email },
    });
    return updated;
  }

  async revokeForPlatform(id: string, actor: AuthContext) {
    const invitation = await this.getInvitationByIdForPlatform(id);
    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BusinessException(
        ErrorCodes.VALIDATION_ERROR,
        'Solo se pueden revocar invitaciones pendientes',
      );
    }

    const revoked = await this.invitationsRepository.revoke(id);
    await this.invitationsRepository.auditPlatformAction({
      actorId: actor.userId,
      invitationId: revoked.id,
      companyId: revoked.company.id,
      action: 'PLATFORM_INVITATION_REVOKED',
      metadata: { email: revoked.email },
    });
    return revoked;
  }

  async accept(token: string, auth: AuthContext) {
    const invitation = await this.getUsableInvitation(token);

    if (this.normalizeEmail(auth.email) !== invitation.email) {
      throw BusinessException.forbidden(
        ErrorCodes.UNAUTHORIZED,
        'Esta invitación pertenece a otro email',
      );
    }

    const user = await this.invitationsRepository.findUserByEmail(
      invitation.email,
    );
    if (!user?.isActive || user.id !== auth.userId) {
      throw BusinessException.forbidden(
        ErrorCodes.UNAUTHORIZED,
        'El usuario no está habilitado para aceptar esta invitación',
      );
    }

    if (user.memberships[0]) {
      throw BusinessException.conflict(
        ErrorCodes.DUPLICATE_RECORD,
        'Este usuario ya pertenece a otra empresa. Debe abandonar su empresa actual antes de unirse a una nueva.',
      );
    }

    const defaultBranchId = await this.getDefaultBranchId(
      invitation.company.id,
    );
    const result = await this.invitationsRepository.acceptForExistingUser({
      invitationId: invitation.id,
      userId: user.id,
      companyId: invitation.company.id,
      roleId: invitation.role.id,
      roleName: invitation.role.name,
      defaultBranchId,
    });

    if (result.status === 'user_has_membership') {
      throw BusinessException.conflict(
        ErrorCodes.DUPLICATE_RECORD,
        'Este usuario ya pertenece a otra empresa. Debe abandonar su empresa actual antes de unirse a una nueva.',
      );
    }

    const accessToken = await this.authService.issueAccessToken(auth.userId);
    return { invitation: result.invitation, accessToken };
  }

  async register(token: string, dto: RegisterInvitationDto) {
    const invitation = await this.getUsableInvitation(token);
    const existingUser = await this.invitationsRepository.findUserByEmail(
      invitation.email,
    );

    if (existingUser) {
      throw BusinessException.conflict(
        ErrorCodes.EMAIL_ALREADY_EXISTS,
        'Ya existe un usuario con este email. Inicia sesión para aceptar la invitación.',
      );
    }

    const defaultBranchId = await this.getDefaultBranchId(
      invitation.company.id,
    );
    const result = await this.invitationsRepository.registerFromInvitation({
      invitationId: invitation.id,
      email: invitation.email,
      passwordHash: await bcrypt.hash(dto.password, PASSWORD_HASH_ROUNDS),
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      companyId: invitation.company.id,
      roleId: invitation.role.id,
      roleName: invitation.role.name,
      defaultBranchId,
    });

    if (result.status === 'user_exists') {
      throw BusinessException.conflict(
        ErrorCodes.EMAIL_ALREADY_EXISTS,
        'Ya existe un usuario con este email. Inicia sesión para aceptar la invitación.',
      );
    }

    return result.invitation;
  }

  private async getInvitationByIdInCompany(id: string, companyId: string) {
    const invitation = await this.invitationsRepository.findByIdInCompany(
      id,
      companyId,
    );
    if (!invitation) {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'La invitación no existe',
      );
    }
    return invitation;
  }

  private async getInvitationByIdForPlatform(id: string) {
    const invitation = await this.invitationsRepository.findByIdForPlatform(id);
    if (!invitation) {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'La invitación no existe',
      );
    }
    return invitation;
  }

  private async getInvitationByToken(token: string) {
    const invitation = await this.invitationsRepository.findByTokenHash(
      this.hashToken(token),
    );
    if (!invitation) {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'La invitación no existe o el enlace no es válido',
      );
    }
    return invitation;
  }

  private async getUsableInvitation(token: string) {
    const invitation = await this.getInvitationByToken(token);
    this.assertInvitationUsable(invitation);
    return invitation;
  }

  private assertInvitationUsable(invitation: InvitationWithTokenRecord): void {
    if (!invitation.company.isActive) {
      throw BusinessException.forbidden(
        ErrorCodes.UNAUTHORIZED_COMPANY_ACCESS,
        'La empresa no está activa',
      );
    }

    if (invitation.status === InvitationStatus.ACCEPTED) {
      throw new BusinessException(
        ErrorCodes.VALIDATION_ERROR,
        'La invitación ya fue aceptada',
      );
    }

    if (invitation.status === InvitationStatus.REVOKED) {
      throw new BusinessException(
        ErrorCodes.VALIDATION_ERROR,
        'La invitación fue revocada',
      );
    }

    if (
      invitation.status === InvitationStatus.EXPIRED ||
      invitation.expiresAt <= new Date()
    ) {
      throw new BusinessException(
        ErrorCodes.VALIDATION_ERROR,
        'La invitación ha vencido',
      );
    }
  }

  private assertCanResend(invitation: InvitationWithTokenRecord): void {
    if (invitation.status === InvitationStatus.ACCEPTED) {
      throw new BusinessException(
        ErrorCodes.VALIDATION_ERROR,
        'No se puede reenviar una invitación aceptada',
      );
    }
  }

  private async getDefaultBranchId(companyId: string): Promise<string | null> {
    const branch =
      await this.invitationsRepository.findDefaultBranch(companyId);
    return branch?.id ?? null;
  }

  private async sendInvitation(
    invitation: InvitationRecord,
    token: string,
  ): Promise<void> {
    await this.emailService.sendInvitationEmail({
      to: invitation.email,
      inviteeEmail: invitation.email,
      companyName: invitation.company.name,
      inviterName:
        `${invitation.invitedBy.firstName} ${invitation.invitedBy.lastName}`.trim(),
      roleName: invitation.role.name,
      acceptUrl: `${this.getWebUrl()}/invite/${token}`,
      expiresAt: invitation.expiresAt,
    });
  }

  private async toPublicInvitation(invitation: InvitationWithTokenRecord) {
    const user = await this.invitationsRepository.findUserByEmail(
      invitation.email,
    );

    return {
      id: invitation.id,
      email: invitation.email,
      company: {
        id: invitation.company.id,
        name: invitation.company.name,
        isActive: invitation.company.isActive,
      },
      role: invitation.role.name,
      expiresAt: invitation.expiresAt,
      status:
        invitation.status === InvitationStatus.PENDING &&
        invitation.expiresAt <= new Date()
          ? InvitationStatus.EXPIRED
          : invitation.status,
      recipientFlow: this.resolveRecipientFlow(user),
    };
  }

  private resolveRecipientFlow(
    user: Awaited<ReturnType<InvitationsRepository['findUserByEmail']>>,
  ): InvitationRecipientFlow {
    if (!user) {
      return 'register';
    }

    if (user.memberships[0]) {
      return 'blocked';
    }

    return 'login';
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private generateToken(): string {
    return randomBytes(INVITATION_TOKEN_BYTES).toString('base64url');
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private getWebUrl(): string {
    return this.config.get<string>('APP_WEB_URL') ?? 'http://localhost:3000';
  }
}
