import type {
  InvitationEmailData,
  ResetPasswordEmailData,
  VerifyEmailData,
} from './email.types';

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-DO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function renderLayout(title: string, body: string): string {
  return `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
      <h1 style="font-size: 20px;">${title}</h1>
      ${body}
    </div>
  `;
}

function renderActionLink(label: string, href: string): string {
  return `
    <p>
      <a href="${href}" style="display: inline-block; background: #111827; color: #ffffff; padding: 10px 16px; border-radius: 6px; text-decoration: none;">
        ${label}
      </a>
    </p>
    <p style="font-size: 12px; color: #6b7280;">Si el botón no funciona, copia este enlace: ${href}</p>
  `;
}

export function renderInvitationEmail(data: InvitationEmailData) {
  return {
    subject: `Invitación para unirte a ${data.companyName}`,
    html: renderLayout(
      `Te invitaron a ${data.companyName}`,
      `
        <p>${data.inviterName} te invitó a unirte a ${data.companyName} con el rol ${data.roleName}.</p>
        <p>Esta invitación vence el ${formatDate(data.expiresAt)}.</p>
        ${renderActionLink('Aceptar invitación', data.acceptUrl)}
      `,
    ),
  };
}

export function renderVerifyEmail(data: VerifyEmailData) {
  return {
    subject: 'Activa tu cuenta',
    html: renderLayout(
      'Activa tu cuenta',
      `
        <p>Hola ${data.firstName}, tu cuenta fue creada por el administrador de la plataforma.</p>
        <p>Activa tu cuenta para iniciar sesión y continuar con el onboarding.</p>
        ${renderActionLink('Activar cuenta', data.verifyUrl)}
      `,
    ),
  };
}

export function renderResetPasswordEmail(data: ResetPasswordEmailData) {
  return {
    subject: 'Restablece tu contraseña',
    html: renderLayout(
      'Restablece tu contraseña',
      `
        <p>Hola ${data.firstName}, recibimos una solicitud para configurar o restablecer tu contraseña.</p>
        ${renderActionLink('Restablecer contraseña', data.resetUrl)}
      `,
    ),
  };
}
