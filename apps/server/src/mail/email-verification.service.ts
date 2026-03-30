import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from './mail.service';

@Injectable()
export class EmailVerificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async sendVerification(user: { id: string; name: string; email: string }) {
    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await this.prisma.emailVerification.create({
      data: { userId: user.id, token, expiresAt },
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verificationUrl = `${frontendUrl}/auth/verify-email?token=${token}`;

    this.mailService
      .sendEmailVerificationEmail(
        { name: user.name, email: user.email },
        verificationUrl,
      )
      .catch((err) => {
        console.error(
          `Falha ao enviar email de verificação para ${user.email}:`,
          err.message,
        );
      });
  }

  async validateToken(token: string) {
    const verification = await this.prisma.emailVerification.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verification) throw new BadRequestException('Token inválido');
    if (verification.expiresAt < new Date())
      throw new BadRequestException('Token expirado');

    await this.prisma.emailVerification.delete({
      where: { id: verification.id },
    });

    return verification.user;
  }

  async resend(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || user.emailVerified) {
      return {
        message:
          'Se o e-mail estiver cadastrado e pendente, enviaremos um novo link.',
      };
    }

    await this.prisma.emailVerification.deleteMany({
      where: { userId: user.id },
    });
    await this.sendVerification(user);

    return {
      message:
        'Se o e-mail estiver cadastrado e pendente, enviaremos um novo link.',
    };
  }
}
