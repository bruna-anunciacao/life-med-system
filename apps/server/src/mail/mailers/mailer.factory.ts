import { Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

import { EtherealMailer } from './ethereal.mailer';
import { Mailer, MAIL_PROVIDERS, MailProvider } from './mailer';
import { ResendMailer } from './resend.mailer';
import { SmtpMailer } from './smtp.mailer';

const logger = new Logger('MailerFactory');

export function resolveProvider(): MailProvider {
  const explicit = process.env.MAIL_PROVIDER?.toLowerCase();
  if ((MAIL_PROVIDERS as readonly string[]).includes(explicit ?? '')) {
    return explicit as MailProvider;
  }
  if (process.env.NODE_ENV === 'development') return 'ethereal';
  if (process.env.RESEND_API_KEY) return 'resend';
  if (process.env.MAIL_HOST) return 'smtp';
  return 'ethereal';
}

export async function createMailer(
  provider: MailProvider,
  defaultFrom: string,
): Promise<Mailer> {
  logger.log(`Mail provider: ${provider}`);

  if (provider === 'resend') {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error('RESEND_API_KEY não configurada');
    return new ResendMailer(apiKey, defaultFrom);
  }

  if (provider === 'smtp') {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: process.env.MAIL_SECURE === 'true',
      auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    });
    return new SmtpMailer(transporter, defaultFrom);
  }

  return EtherealMailer.create(defaultFrom);
}
