import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

import { createPasswordResetEmail } from 'templates/mail/password-reset.template';

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
export class MailService {
  private readonly logger = new Logger(MailService.name);

  async sendEmail(input: SendEmailInput): Promise<void> {
    const nodeEnv = process.env.NODE_ENV;

    let transporter: nodemailer.Transporter;

    if (nodeEnv === 'development') {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });
    } else {
      transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT),
        secure: process.env.MAIL_SECURE === 'true',
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      });
    }

    try {
      const info = await transporter.sendMail({
        from: input.from || '"Life Med" <noreply@lifemed.com>',
        to: input.to,
        cc: input.cc,
        subject: input.subject,
        html: input.html,
        attachments: input.attachments,
      });

      if (nodeEnv === 'development') {
        this.logger.log(
          `📧 Email de teste: ${nodemailer.getTestMessageUrl(info)}`,
        );
      } else {
        this.logger.log(`✅ Email enviado: ${info.messageId}`);
      }
    } catch (error) {
      this.logger.error('❌ Falha ao enviar email:', error);
      throw new Error('Erro no serviço de email');
    }
  }

  async sendPasswordResetEmail(
    user: { name: string; email: string },
    resetUrl: string,
  ) {
    const htmlBody = createPasswordResetEmail({
      nome: user.name,
      resetUrl: resetUrl,
    });

    await this.sendEmail({
      to: user.email,
      subject: 'Recuperação de Senha - LifeMed',
      html: htmlBody,
    });
  }
}
