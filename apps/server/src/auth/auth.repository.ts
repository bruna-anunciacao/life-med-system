import { Injectable } from '@nestjs/common';
import { UserRole, UserStatus } from '@prisma/client';
import { RegisterAdminDto } from './dto/register-admin-dto';
import { RegisterDto } from './dto/register-dto';
import { RegisterManagerDto } from './dto/register-manager.dto';
import { RegisterProfessionalDto } from './dto/register-profissional-dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUserForLogin(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        patientProfile: {
          select: {
            questionnaireCompleted: true,
            approvalStatus: true,
          },
        },
      },
    });
  }

  findUserByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findUserByCpf(cpf: string) {
    return this.prisma.user.findFirst({ where: { cpf } });
  }

  createPatient(dto: RegisterDto, passwordHash: string) {
    return this.prisma.user.create({
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
  }

  createProfessional(dto: RegisterProfessionalDto, passwordHash: string) {
    const specialtyIds = Array.isArray(dto.specialty)
      ? dto.specialty
      : [dto.specialty];

    return this.prisma.user.create({
      data: {
        email: dto.email,
        cpf: dto.cpf,
        password: passwordHash,
        name: dto.name,
        role: UserRole.PROFESSIONAL,
        status: UserStatus.PENDING,
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
  }

  createAdmin(dto: RegisterAdminDto, passwordHash: string) {
    return this.prisma.user.create({
      data: {
        email: dto.email,
        cpf: dto.cpf,
        password: passwordHash,
        name: dto.name,
        role: UserRole.ADMIN,
        status: UserStatus.VERIFIED,
      },
    });
  }

  createManager(dto: RegisterManagerDto, passwordHash: string) {
    return this.prisma.user.create({
      data: {
        email: dto.email,
        cpf: dto.cpf,
        password: passwordHash,
        name: dto.name,
        role: UserRole.MANAGER,
        status: UserStatus.VERIFIED,
        emailVerified: true,
        managerProfile: {
          create: {
            phone: dto.phone,
            bio: dto.bio,
          },
        },
      },
      include: { managerProfile: true },
    });
  }

  createPasswordReset(userId: string, token: string, expiresAt: Date) {
    return this.prisma.passwordReset.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }

  findPasswordResetByToken(token: string) {
    return this.prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  resetPassword(resetId: string, userId: string, passwordHash: string) {
    return this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { password: passwordHash },
      }),
      this.prisma.passwordReset.delete({
        where: { id: resetId },
      }),
    ]);
  }

  markEmailVerified(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true },
    });
  }

  findAdminsForNotification() {
    return this.prisma.user.findMany({
      where: { role: UserRole.ADMIN },
      select: { name: true, email: true },
    });
  }
}
