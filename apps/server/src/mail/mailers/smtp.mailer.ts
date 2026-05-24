import { Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

import { Mailer, SendEmailInput } from './mailer';

export class SmtpMailer implements Mailer {
  private readonly logger = new Logger(SmtpMailer.name);

  constructor(
    private readonly transporter: nodemailer.Transporter,
    private readonly defaultFrom: string,
  ) {}

  async send(input: SendEmailInput): Promise<void> {
    const info = await this.transporter.sendMail({
      from: input.from || this.defaultFrom,
      to: input.to,
      cc: input.cc,
      subject: input.subject,
      html: input.html,
      attachments: input.attachments,
    });
    this.logger.log(`Email enviado via SMTP: ${info.messageId}`);
  }
}
