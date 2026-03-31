import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { EmailVerificationService } from './email-verification.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [MailService, EmailVerificationService],
  exports: [MailService, EmailVerificationService],
})
export class MailModule {}
