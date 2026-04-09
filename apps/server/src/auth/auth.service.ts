import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register-dto';
import { RegisterProfessionalDto } from './dto/register-profissional-dto';
import { RegisterAdminDto } from './dto/register-admin-dto';
import { RegisterManagerDto } from './dto/register-manager.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { MailService } from 'src/mail/mail.service';
import { EmailVerificationService } from 'src/mail/email-verification.service';
import { randomUUID } from 'crypto';
import { UserRole, UserStatus } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly emailVerification: EmailVerificationService,
  ) { }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.password);

    if (!passwordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (!user.emailVerified) {
      throw new UnauthorizedException(
        'Sua conta ainda não foi aprovada. Aguarde a verificação do administrador.',
      );
    }

    const payload = {
      sub: user.id,
      role: user.role,
      email: user.email,
      status: user.status,
    };

    const accessToken = String(this.jwtService.sign(payload));

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

  async register(dto: RegisterDto) {
    const emailExists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (emailExists) {
      throw new BadRequestException('E-mail já cadastrado');
    }

    const cpfExists = await this.prisma.user.findFirst({
      where: { cpf: dto.cpf },
    });

    if (cpfExists) {
      throw new BadRequestException('CPF já cadastrado');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

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

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
    };
  }

  async registerProfessional(dto: RegisterProfessionalDto) {
    const emailExists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (emailExists) {
      throw new BadRequestException('E-mail já cadastrado');
    }

    const cpfExists = await this.prisma.user.findFirst({
      where: { cpf: dto.cpf },
    });

    if (cpfExists) {
      throw new BadRequestException('CPF já cadastrado');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const specialtyIds = Array.isArray(dto.specialty)
      ? dto.specialty
      : [dto.specialty];

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
            specialities: {
              connect: specialtyIds.map((id) => ({ id })),
            },
            modality: dto.modality,
            bio: dto.bio,
            socialLinks: dto.socialLinks,
          },
        },
      },
      include: {
        professionalProfile: {
          include: {
            specialities: true,
          },
        },
      },
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
    const emailExists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (emailExists) {
      throw new BadRequestException('E-mail já cadastrado');
    }

    const cpfExists = await this.prisma.user.findFirst({
      where: { cpf: dto.cpf },
    });

    if (cpfExists) {
      throw new BadRequestException('CPF já cadastrado');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

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

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  async registerManager(dto: RegisterManagerDto) {
    const emailExists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (emailExists) {
      throw new BadRequestException('E-mail já cadastrado');
    }

    const cpfExists = await this.prisma.user.findFirst({
      where: { cpf: dto.cpf },
    });

    if (cpfExists) {
      throw new BadRequestException('CPF já cadastrado');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        cpf: dto.cpf,
        password: passwordHash,
        name: dto.name,
        role: UserRole.MANAGER,
        status: UserStatus.VERIFIED,
        managerProfile: {
          create: {
            phone: dto.phone,
            address: dto.address,
            bio: dto.bio,
          },
        },
      },
      include: { managerProfile: true },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      return { message: 'Se o e-mail existir, enviaremos instruções' };
    }

    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 2);

    await this.prisma.passwordReset.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/auth/reset-password?token=${token}`;

    await this.mailService.sendPasswordResetEmail(
      { name: user.name, email: user.email },
      resetUrl,
    );

    return { message: 'Se o e-mail existir, enviaremos instruções' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const reset = await this.prisma.passwordReset.findUnique({
      where: { token: dto.token },
      include: { user: true },
    });

    if (!reset) {
      throw new BadRequestException('Token inválido');
    }

    if (reset.expiresAt < new Date()) {
      throw new BadRequestException('Token expirado');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: reset.userId },
        data: { password: passwordHash },
      }),
      this.prisma.passwordReset.delete({
        where: { id: reset.id },
      }),
    ]);

    return { message: 'Senha atualizada com sucesso' };
  }
  async verifyEmail(token: string) {
    const user = await this.emailVerification.validateToken(token);

    if (user.role === UserRole.PATIENT) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      });
      return {
        message: 'E-mail verificado com sucesso. Você já pode fazer login.',
      };
    }

    this.notifyAdminsOfNewUser({
      name: user.name,
      email: user.email,
      role: user.role,
    }).catch((err) =>
      console.error(
        `Falha ao notificar admins sobre ${user.email}:`,
        err.message,
      ),
    );

    this.mailService
      .sendAccountPendingEmail({ name: user.name, email: user.email })
      .catch((err) =>
        console.error(
          `Falha ao enviar email pendente para ${user.email}:`,
          err.message,
        ),
      );

    return {
      message:
        'E-mail verificado. Sua conta será analisada pelo administrador.',
    };
  }

  async resendVerificationEmail(email: string) {
    return this.emailVerification.resend(email);
  }

  async notifyAdminsOfNewUser(newUser: {
    name: string;
    email: string;
    role: string;
  }) {
    const admins = await this.prisma.user.findMany({
      where: { role: UserRole.ADMIN },
      select: { name: true, email: true },
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const approveUrl = `${frontendUrl}/dashboard/admin`;

    for (const admin of admins) {
      this.mailService
        .sendNewUserNotificationEmail(admin, newUser, approveUrl)
        .catch((err) => {
          console.error(
            `Falha ao notificar admin ${admin.email}:`,
            err.message,
          );
        });
    }
  }
}
