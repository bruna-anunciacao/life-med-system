import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { PrismaService } from 'src/prisma/prisma.service';
import { UserRoleEnum } from './enums/user-role-enum';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register-dto';
import { RegisterProfessionalDto } from './dto/register-profissional-dto';
import { RegisterAdminDto } from './dto/register-admin-dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

import { MailService } from 'services/mail.service';

import { randomUUID } from 'crypto';
import { userStatusEnum } from './enums/user-status-enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

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

    const payload = {
      sub: user.id,
      role: user.role,
      email: user.email,
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

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: passwordHash,
        name: dto.name,
        role: UserRoleEnum.PATIENT,
        status: userStatusEnum.PENDING,
      },
    });

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

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: passwordHash,
        name: dto.name,
        role: UserRoleEnum.PROFESSIONAL,
        status: userStatusEnum.PENDING,
        professionalProfile: {
          create: {
            professionalLicense: dto.professionalLicense,
            specialty: dto.specialty,
            subspecialty: dto.subspecialty,
            modality: dto.modality,
            bio: dto.bio,
          },
        },
      },
      include: {
        professionalProfile: true,
      },
    });

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

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: passwordHash,
        name: dto.name,
        role: UserRoleEnum.ADMIN,
        status: userStatusEnum.VERIFIED,
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
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
}
