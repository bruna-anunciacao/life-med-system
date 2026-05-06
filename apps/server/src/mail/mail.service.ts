import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

import { createPasswordResetEmail } from './templates/password-reset.template';
import { createNewUserNotificationEmail } from './templates/new-user-notification.template';
import { createAccountPendingEmail } from './templates/account-pending.template';
import { createAccountApprovedEmail } from './templates/account-approved.template';
import { createAccountRejectedEmail } from './templates/account-rejected.template';
import { createEmailVerificationEmail } from './templates/email-verification.template';
import { createTempPasswordEmail } from './templates/temp-password.template';
import { createAppointmentCreatedPatientEmail } from './templates/appointment-created-patient.template';
import { createAppointmentCreatedProfessionalEmail } from './templates/appointment-created-professional.template';
import { createAppointmentCancelledEmail } from './templates/appointment-cancelled.template';
import { createMassCancellationEmail } from './templates/mass-cancellation.template';

export type EmailAttachment = {
  filename: string;
  content: string | Buffer;
  contentType: string;
};

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  cc?: string[];
  from?: string;
  attachments?: EmailAttachment[];
}

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;
  private isDevelopment = process.env.NODE_ENV === 'development';

  async onModuleInit() {
    if (this.isDevelopment) {
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });
      this.logger.log(
        'Transporter de email configurado (modo desenvolvimento)',
      );
    } else {
      this.transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT),
        secure: process.env.MAIL_SECURE === 'true',
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      });
      this.logger.log('Transporter de email configurado (modo produção)');
    }
  }

  async sendEmail(input: SendEmailInput): Promise<void> {
    try {
      const info = await this.transporter.sendMail({
        from: input.from || '"Life Med" <noreply@lifemed.com>',
        to: input.to,
        cc: input.cc,
        subject: input.subject,
        html: input.html,
        attachments: input.attachments,
      });

      if (this.isDevelopment) {
        this.logger.log(
          `Email de teste enviado: ${nodemailer.getTestMessageUrl(info)}`,
        );
      } else {
        this.logger.log(`Email enviado: ${info.messageId}`);
      }
    } catch (error) {
      this.logger.error(
        `Falha ao enviar email para ${input.to}: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  async sendPasswordResetEmail(
    user: { name: string; email: string },
    resetUrl: string,
  ) {
    const htmlBody = createPasswordResetEmail({ nome: user.name, resetUrl });
    await this.sendEmail({
      to: user.email,
      subject: 'Recuperação de Senha - LifeMed',
      html: htmlBody,
    });
  }

  async sendAccountPendingEmail(user: { name: string; email: string }) {
    const htmlBody = createAccountPendingEmail({ userName: user.name });
    await this.sendEmail({
      to: user.email,
      subject: 'Conta em Análise - LifeMed',
      html: htmlBody,
    });
  }

  async sendAccountApprovedEmail(user: { name: string; email: string }) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const loginUrl = `${frontendUrl}/auth/login`;
    const htmlBody = createAccountApprovedEmail({
      userName: user.name,
      loginUrl,
    });
    await this.sendEmail({
      to: user.email,
      subject: 'Conta Aprovada - LifeMed',
      html: htmlBody,
    });
  }

  async sendAccountRejectedEmail(user: { name: string; email: string }) {
    const htmlBody = createAccountRejectedEmail({
      userName: user.name,
      contactEmail: process.env.MAIL_CONTACT,
    });
    await this.sendEmail({
      to: user.email,
      subject: 'Cadastro Não Aprovado - LifeMed',
      html: htmlBody,
    });
  }

  async sendNewUserNotificationEmail(
    admin: { name: string; email: string },
    user: { name: string; email: string },
    approveUrl: string,
  ) {
    const htmlBody = createNewUserNotificationEmail({
      adminName: admin.name,
      userName: user.name,
      userEmail: user.email,
      approveUrl,
    });
    await this.sendEmail({
      to: admin.email,
      subject: 'Nova Solicitação de Cadastro - LifeMed',
      html: htmlBody,
    });
  }

  async sendTempPasswordEmail(
    user: { name: string; email: string },
    tempPassword: string,
  ) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const loginUrl = `${frontendUrl}/auth/login`;
    const htmlBody = createTempPasswordEmail({
      userName: user.name,
      email: user.email,
      tempPassword,
      loginUrl,
    });
    await this.sendEmail({
      to: user.email,
      subject: 'Bem-vindo ao LifeMed - Suas Credenciais de Acesso',
      html: htmlBody,
    });
  }

  async sendEmailVerificationEmail(
    user: { name: string; email: string },
    verificationUrl: string,
  ) {
    const htmlBody = createEmailVerificationEmail({
      userName: user.name,
      verificationUrl,
    });
    await this.sendEmail({
      to: user.email,
      subject: 'Confirme seu E-mail - LifeMed',
      html: htmlBody,
    });
  }

  async sendAppointmentCreatedPatientEmail(
    patient: { name: string; email: string },
    appointment: {
      professionalName: string;
      dateTime: Date;
      modality: string;
    },
  ) {
    const date = appointment.dateTime.toLocaleDateString('pt-BR', {
      timeZone: 'America/Bahia',
    });
    const time = appointment.dateTime.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Bahia',
    });
    const htmlBody = createAppointmentCreatedPatientEmail({
      patientName: patient.name,
      professionalName: appointment.professionalName,
      date,
      time,
      modality: this.formatModality(appointment.modality),
    });
    await this.sendEmail({
      to: patient.email,
      subject: 'Agendamento Realizado - LifeMed',
      html: htmlBody,
    });
  }

  async sendAppointmentCreatedProfessionalEmail(
    professional: { name: string; email: string },
    appointment: {
      patientName: string;
      dateTime: Date;
      modality: string;
      notes?: string | null;
    },
  ) {
    const date = appointment.dateTime.toLocaleDateString('pt-BR', {
      timeZone: 'America/Bahia',
    });
    const time = appointment.dateTime.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Bahia',
    });
    const htmlBody = createAppointmentCreatedProfessionalEmail({
      professionalName: professional.name,
      patientName: appointment.patientName,
      date,
      time,
      modality: this.formatModality(appointment.modality),
      notes: appointment.notes ?? undefined,
    });
    await this.sendEmail({
      to: professional.email,
      subject: 'Novo Agendamento - LifeMed',
      html: htmlBody,
    });
  }

  async sendAppointmentCancelledEmail(
    recipient: { name: string; email: string },
    appointment: {
      patientName: string;
      professionalName: string;
      dateTime: Date;
      reason?: string;
    },
  ) {
    const date = appointment.dateTime.toLocaleDateString('pt-BR', {
      timeZone: 'America/Bahia',
    });
    const time = appointment.dateTime.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Bahia',
    });
    const htmlBody = createAppointmentCancelledEmail({
      recipientName: recipient.name,
      patientName: appointment.patientName,
      professionalName: appointment.professionalName,
      date,
      time,
      reason: appointment.reason,
    });
    await this.sendEmail({
      to: recipient.email,
      subject: 'Agendamento Cancelado - LifeMed',
      html: htmlBody,
    });
  }

  async sendMassCancellationEmail(
    recipient: { name: string; email: string },
    appointment: {
      professionalName: string;
      dateTime: Date;
    },
  ) {
    const date = appointment.dateTime.toLocaleDateString('pt-BR', {
      timeZone: 'America/Bahia',
    });
    const time = appointment.dateTime.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Bahia',
    });
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const rescheduleUrl = `${frontendUrl}/dashboard/patient/search`;

    const htmlBody = createMassCancellationEmail({
      recipientName: recipient.name,
      professionalName: appointment.professionalName,
      date,
      time,
      rescheduleUrl,
    });
    
    await this.sendEmail({
      to: recipient.email,
      subject: 'Aviso Importante: Cancelamento de Consulta - LifeMed',
      html: htmlBody,
    });
  }

  private formatModality(modality: string): string {
    const map: Record<string, string> = {
      VIRTUAL: 'Teleconsulta',
      HOME_VISIT: 'Visita Domiciliar',
      CLINIC: 'Presencial',
    };
    return map[modality] ?? modality;
  }
}
