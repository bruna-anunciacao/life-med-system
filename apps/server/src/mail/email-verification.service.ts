import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from './mail.service';

const VERIFICATION_TOKEN_TTL_HOURS = 24;
const getFrontendUrl = () =>
  process.env.FRONTEND_URL || 'http://localhost:3000';

@Injectable()
export class EmailVerificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async sendVerification(user: {
    id: string;
    name: string;
    email: string;
  }): Promise<void> {
    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + VERIFICATION_TOKEN_TTL_HOURS);

    await this.prisma.emailVerification.create({
      data: { userId: user.id, token, expiresAt },
    });

    const verificationUrl = `${getFrontendUrl()}/auth/verify-email?token=${token}`;

    await this.mailService.sendEmailVerificationEmail(
      { name: user.name, email: user.email },
      verificationUrl,
    );
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
