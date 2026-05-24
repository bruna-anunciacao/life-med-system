import { Logger } from '@nestjs/common';
import { Resend } from 'resend';

import { Mailer, SendEmailInput } from './mailer';

export class ResendMailer implements Mailer {
  private readonly logger = new Logger(ResendMailer.name);
  private readonly client: Resend;

  constructor(
    apiKey: string,
    private readonly defaultFrom: string,
  ) {
    this.client = new Resend(apiKey);
  }

  async send(input: SendEmailInput): Promise<void> {
    const result = await this.client.emails.send({
      from: input.from || this.defaultFrom,
      to: input.to,
      cc: input.cc,
      subject: input.subject,
      html: input.html,
      attachments: input.attachments?.map((a) => ({
        filename: a.filename,
        content: a.content,
      })),
    });
    if (result.error) throw new Error(result.error.message);
    this.logger.log(`Email enviado via Resend: ${result.data?.id}`);
  }
}
