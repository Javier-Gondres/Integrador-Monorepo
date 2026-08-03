const InvitationStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  EXPIRED: 'EXPIRED',
  REVOKED: 'REVOKED',
} as const;

const RoleName = {
  CASHIER: 'CASHIER',
} as const;

jest.mock('@repo/db', () => ({
  InvitationStatus,
  RoleName,
}));

jest.mock('../auth/auth.service', () => ({
  AuthService: class AuthService {},
}));

jest.mock('../users/helpers/assert-assignable-role', () => ({
  assertAssignableRole: jest.fn(),
}));

import type { InvitationWithTokenRecord } from './invitations.repository';
import { InvitationsService } from './invitations.service';

const futureDate = () => new Date(Date.now() + 60_000);
const pastDate = () => new Date(Date.now() - 60_000);

function invitation(
  overrides: Partial<InvitationWithTokenRecord> = {},
): InvitationWithTokenRecord {
  return {
    id: 'invitation-1',
    email: 'juan@example.com',
    tokenHash: 'hash',
    expiresAt: futureDate(),
    acceptedAt: null,
    revokedAt: null,
    status: InvitationStatus.PENDING,
    createdAt: new Date(),
    company: { id: 'company-1', name: 'Empresa Demo', isActive: true },
    role: { id: 'role-1', name: RoleName.CASHIER },
    invitedBy: {
      id: 'owner-1',
      email: 'owner@example.com',
      firstName: 'Owner',
      lastName: 'Demo',
    },
    ...overrides,
  };
}

describe('InvitationsService', () => {
  const repository = {
    findManyByCompany: jest.fn(),
    findByTokenHash: jest.fn(),
    findUserByEmail: jest.fn(),
    findDefaultBranch: jest.fn(),
    findPendingByCompanyAndEmail: jest.fn(),
    markExpired: jest.fn(),
    create: jest.fn(),
    acceptForExistingUser: jest.fn(),
    registerFromInvitation: jest.fn(),
  };
  const emailService = { sendInvitationEmail: jest.fn() };
  const config = { get: jest.fn(() => 'http://localhost:3000') };
  const authService = { issueAccessToken: jest.fn() };

  const service = new InvitationsService(
    repository as never,
    emailService as never,
    config as never,
    authService as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rechaza aceptar una invitación vencida', async () => {
    repository.findByTokenHash.mockResolvedValue(
      invitation({ expiresAt: pastDate() }),
    );

    await expect(
      service.accept('token', {
        userId: 'user-1',
        email: 'juan@example.com',
      } as never),
    ).rejects.toThrow('La invitación ha vencido');
  });

  it('rechaza aceptar una invitación revocada', async () => {
    repository.findByTokenHash.mockResolvedValue(
      invitation({ status: InvitationStatus.REVOKED }),
    );

    await expect(
      service.accept('token', {
        userId: 'user-1',
        email: 'juan@example.com',
      } as never),
    ).rejects.toThrow('La invitación fue revocada');
  });

  it('rechaza aceptar una invitación ya aceptada', async () => {
    repository.findByTokenHash.mockResolvedValue(
      invitation({ status: InvitationStatus.ACCEPTED }),
    );

    await expect(
      service.accept('token', {
        userId: 'user-1',
        email: 'juan@example.com',
      } as never),
    ).rejects.toThrow('La invitación ya fue aceptada');
  });

  it('rechaza aceptar si la empresa está inactiva', async () => {
    repository.findByTokenHash.mockResolvedValue(
      invitation({
        company: { id: 'company-1', name: 'Empresa Demo', isActive: false },
      }),
    );

    await expect(
      service.accept('token', {
        userId: 'user-1',
        email: 'juan@example.com',
      } as never),
    ).rejects.toThrow('La empresa no está activa');
  });

  it('rechaza aceptar si el usuario ya pertenece a otra empresa', async () => {
    repository.findByTokenHash.mockResolvedValue(invitation());
    repository.findUserByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'juan@example.com',
      isActive: true,
      memberships: [{ id: 'membership-1', companyId: 'other-company' }],
    });

    await expect(
      service.accept('token', {
        userId: 'user-1',
        email: 'juan@example.com',
      } as never),
    ).rejects.toThrow('Este usuario ya pertenece a otra empresa');
  });

  it('acepta una invitación válida y emite un nuevo access token', async () => {
    const record = invitation();
    repository.findByTokenHash.mockResolvedValue(record);
    repository.findUserByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'juan@example.com',
      isActive: true,
      memberships: [],
    });
    repository.findDefaultBranch.mockResolvedValue({ id: 'branch-1' });
    repository.acceptForExistingUser.mockResolvedValue({
      status: 'ok',
      invitation: record,
    });
    authService.issueAccessToken.mockResolvedValue('access-token');

    await expect(
      service.accept('token', {
        userId: 'user-1',
        email: 'juan@example.com',
      } as never),
    ).resolves.toMatchObject({ accessToken: 'access-token' });
  });

  it('rechaza crear invitación si el usuario ya pertenece a otra empresa', async () => {
    repository.findUserByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'juan@example.com',
      isActive: true,
      memberships: [{ id: 'membership-1', companyId: 'other-company' }],
    });

    await expect(
      service.create(
        { userId: 'owner-1', role: 'OWNER' } as never,
        'company-1',
        { email: 'juan@example.com', role: RoleName.CASHIER },
      ),
    ).rejects.toThrow('Este usuario ya pertenece a otra empresa');
  });

  it('expone recipientFlow login cuando el usuario existe sin empresa', async () => {
    repository.findByTokenHash.mockResolvedValue(invitation());
    repository.findUserByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'juan@example.com',
      isActive: true,
      memberships: [],
    });

    await expect(service.findByToken('token')).resolves.toMatchObject({
      recipientFlow: 'login',
    });
  });

  it('expone recipientFlow register cuando el email no existe', async () => {
    repository.findByTokenHash.mockResolvedValue(invitation());
    repository.findUserByEmail.mockResolvedValue(null);

    await expect(service.findByToken('token')).resolves.toMatchObject({
      recipientFlow: 'register',
    });
  });

  it('expone recipientFlow blocked cuando el usuario ya tiene empresa', async () => {
    repository.findByTokenHash.mockResolvedValue(invitation());
    repository.findUserByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'juan@example.com',
      isActive: true,
      memberships: [{ id: 'membership-1', companyId: 'other-company' }],
    });

    await expect(service.findByToken('token')).resolves.toMatchObject({
      recipientFlow: 'blocked',
    });
  });
});
