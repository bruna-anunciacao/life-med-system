import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register-dto';
import { RegisterProfessionalDto } from './dto/register-profissional-dto';
import { RegisterAdminDto } from './dto/register-admin-dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { MailService } from 'src/mail/mail.service';
import { EmailVerificationService } from 'src/mail/email-verification.service';
import { randomUUID } from 'crypto';
import { UserRole, UserStatus } from '@prisma/client';

const PASSWORD_RESET_TTL_HOURS = 2;
const getFrontendUrl = () => process.env.FRONTEND_URL || 'http://localhost:3000';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly emailVerification: EmailVerificationService,
  ) {}

  // ─── Helpers privados ──────────────────────────────────────────────────────

  private async validateUniqueUserFields(email: string, cpf: string) {
    const emailExists = await this.prisma.user.findUnique({ where: { email } });
    if (emailExists) throw new BadRequestException('E-mail já cadastrado');

    const cpfExists = await this.prisma.user.findFirst({ where: { cpf } });
    if (cpfExists) throw new BadRequestException('CPF já cadastrado');
  }

  private async hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }

  // ─── Autenticação ──────────────────────────────────────────────────────────

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });

    if (!user) throw new UnauthorizedException('Credenciais inválidas');

    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) throw new UnauthorizedException('Credenciais inválidas');

    if (!user.emailVerified) {
      if (user.role === UserRole.PATIENT) {
        throw new UnauthorizedException(
          'Seu e-mail ainda não foi verificado. Verifique sua caixa de entrada.',
        );
      }
      throw new UnauthorizedException(
        'Sua conta ainda não foi aprovada. Aguarde a verificação do administrador.',
      );
    }

    const accessToken = String(
      this.jwtService.sign({ sub: user.id, role: user.role, email: user.email, status: user.status }),
    );

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        emailVerified: user.emailVerified,
      },
    };
  }

  // ─── Registro ──────────────────────────────────────────────────────────────

  async register(dto: RegisterDto) {
    await this.validateUniqueUserFields(dto.email, dto.cpf);

    const passwordHash = await this.hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        cpf: dto.cpf,
        password: passwordHash,
        name: dto.name,
        role: UserRole.PATIENT,
        status: UserStatus.COMPLETED,
        patientProfile: {
          create: {
            phone: dto.phone,
            dateOfBirth: dto.dateOfBirth,
            gender: dto.gender,
          },
        },
      },
      include: { patientProfile: true },
    });

    await this.emailVerification.sendVerification(user);

    return { id: user.id, email: user.email, name: user.name, role: user.role, status: user.status };
  }

  async registerProfessional(dto: RegisterProfessionalDto) {
    await this.validateUniqueUserFields(dto.email, dto.cpf);

    const passwordHash = await this.hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        cpf: dto.cpf,
        password: passwordHash,
        name: dto.name,
        role: UserRole.PROFESSIONAL,
        status: UserStatus.COMPLETED,
        professionalProfile: {
          create: {
            professionalLicense: dto.professionalLicense,
            specialty: dto.specialty,
            subspecialty: dto.subspecialty,
            modality: dto.modality,
            bio: dto.bio,
            socialLinks: dto.socialLinks,
          },
        },
      },
      include: { professionalProfile: true },
    });

    await this.emailVerification.sendVerification(user);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      professionalProfile: user.professionalProfile,
      status: user.status,
    };
  }

  async registerAdmin(dto: RegisterAdminDto) {
    await this.validateUniqueUserFields(dto.email, dto.cpf);

    const passwordHash = await this.hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        cpf: dto.cpf,
        password: passwordHash,
        name: dto.name,
        role: UserRole.ADMIN,
        status: UserStatus.VERIFIED,
      },
    });

    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }

  // ─── Verificação de e-mail ─────────────────────────────────────────────────

  async verifyEmail(token: string) {
    const user = await this.emailVerification.validateToken(token);

    if (user.role === UserRole.PATIENT) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      });
      return { message: 'E-mail verificado com sucesso. Você já pode fazer login.' };
    }

    // Profissional verificou o e-mail — notifica admins e aguarda aprovação manual
    await this.notifyAdminsOfNewProfessional({ name: user.name, email: user.email });
    await this.mailService.sendAccountPendingEmail({ name: user.name, email: user.email });

    return { message: 'E-mail verificado. Sua conta será analisada pelo administrador.' };
  }

  async resendVerificationEmail(email: string) {
    return this.emailVerification.resend(email);
  }

  // ─── Recuperação de senha ──────────────────────────────────────────────────

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });

    if (!user) return { message: 'Se o e-mail existir, enviaremos instruções' };

    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + PASSWORD_RESET_TTL_HOURS);

    await this.prisma.passwordReset.create({ data: { userId: user.id, token, expiresAt } });

    const resetUrl = `${getFrontendUrl()}/auth/reset-password?token=${token}`;
    await this.mailService.sendPasswordResetEmail({ name: user.name, email: user.email }, resetUrl);

    return { message: 'Se o e-mail existir, enviaremos instruções' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const reset = await this.prisma.passwordReset.findUnique({
      where: { token: dto.token },
      include: { user: true },
    });

    if (!reset) throw new BadRequestException('Token inválido');
    if (reset.expiresAt < new Date()) throw new BadRequestException('Token expirado');

    const passwordHash = await this.hashPassword(dto.newPassword);

    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: reset.userId }, data: { password: passwordHash } }),
      this.prisma.passwordReset.delete({ where: { id: reset.id } }),
    ]);

    return { message: 'Senha atualizada com sucesso' };
  }

  // ─── Notificações internas ─────────────────────────────────────────────────

  private async notifyAdminsOfNewProfessional(professional: { name: string; email: string }) {
    const admins = await this.prisma.user.findMany({
      where: { role: UserRole.ADMIN },
      select: { name: true, email: true },
    });

    const approveUrl = `${getFrontendUrl()}/dashboard/admin`;

    await Promise.allSettled(
      admins.map((admin) =>
        this.mailService
          .sendNewUserNotificationEmail(admin, professional, approveUrl)
          .catch((err: Error) =>
            this.logger.error(`Falha ao notificar admin ${admin.email}: ${err.message}`),
          ),
      ),
    );
  }
}
