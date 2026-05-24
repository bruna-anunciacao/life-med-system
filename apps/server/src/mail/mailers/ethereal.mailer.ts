import { Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

import { Mailer, SendEmailInput } from './mailer';

export class EtherealMailer implements Mailer {
  private readonly logger = new Logger(EtherealMailer.name);

  constructor(
    private readonly transporter: nodemailer.Transporter,
    private readonly defaultFrom: string,
  ) {}

  static async create(defaultFrom: string): Promise<EtherealMailer> {
    const account = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: account.user, pass: account.pass },
    });
    return new EtherealMailer(transporter, defaultFrom);
  }

  async send(input: SendEmailInput): Promise<void> {
    const info = await this.transporter.sendMail({
      from: input.from || this.defaultFrom,
      to: input.to,
      cc: input.cc,
      subject: input.subject,
      html: input.html,
      attachments: input.attachments,
    });
    this.logger.log(
      `Email de teste enviado: ${nodemailer.getTestMessageUrl(info)}`,
    );
  }
}
