import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

import {
  renderInvitationEmail,
  renderResetPasswordEmail,
  renderVerifyEmail,
} from './email.templates';
import type {
  InvitationEmailData,
  ResetPasswordEmailData,
  VerifyEmailData,
} from './email.types';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend | null;
  private readonly from: string | null;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    this.from = this.config.get<string>('EMAIL_FROM') ?? null;
    this.resend = apiKey ? new Resend(apiKey) : null;
  }

  async sendInvitationEmail(data: InvitationEmailData): Promise<void> {
    const template = renderInvitationEmail(data);
    await this.send({
      to: data.to,
      subject: template.subject,
      html: template.html,
    });
  }

  async sendVerifyEmail(data: VerifyEmailData): Promise<void> {
    const template = renderVerifyEmail(data);
    await this.send({
      to: data.to,
      subject: template.subject,
      html: template.html,
    });
  }

  async sendResetPasswordEmail(data: ResetPasswordEmailData): Promise<void> {
    const template = renderResetPasswordEmail(data);
    await this.send({
      to: data.to,
      subject: template.subject,
      html: template.html,
    });
  }

  private async send(message: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    if (!this.resend || !this.from) {
      this.logger.warn(
        `Correo omitido para ${message.to}: RESEND_API_KEY o EMAIL_FROM no configurados.`,
      );
      return;
    }

    const { error } = await this.resend.emails.send({
      from: this.from,
      to: message.to,
      subject: message.subject,
      html: message.html,
    });

    if (error) {
      this.logger.error(
        `No se pudo enviar correo a ${message.to}: ${error.message}`,
      );
      throw new Error('No se pudo enviar el correo transaccional');
    }
  }
}
