export type EmailAttachment = {
  filename: string;
  content: string | Buffer;
  contentType: string;
};

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  cc?: string[];
  from?: string;
  attachments?: EmailAttachment[];
}

export interface Mailer {
  send(input: SendEmailInput): Promise<void>;
}

export const MAIL_PROVIDERS = ['resend', 'smtp', 'ethereal'] as const;
export type MailProvider = (typeof MAIL_PROVIDERS)[number];
