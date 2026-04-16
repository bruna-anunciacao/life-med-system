import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from 'src/mail/mail.service';
import { UpdateUserDto } from './dto/update-user.dto';

import { UserRole, UserStatus } from '@prisma/client';
@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) { }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      omit: {
        password: true,
      },
      include: {
        patientProfile: {
          include: {
            questionnaire: true,
          },
        },
        professionalProfile: {
          include: {
            specialities: true
          }
        }
      },
    });

    if (!user) throw new NotFoundException('Usuário não encontrado');

    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        patientProfile: {
          include: {
            questionnaire: true,
          },
        },
        professionalProfile: {
          include: {
            specialities: true
          }
        }
      },
    });

    if (!user) throw new NotFoundException('Usuário não encontrado');

    const {
      specialty,
      crm: professionalLicense,
      bio,
      status,
      modality,
      photoUrl,
      socialLinks,
      phone,
      dateOfBirth,
      gender,
      address,
      cpf,
      ...userData
    } = dto;

    let newStatus = status ? status : user.status;

    const specialtyIds = Array.isArray(specialty)
      ? specialty
      : (specialty ? [specialty] : []);

    if (user.role === 'PROFESSIONAL' && user.status === 'PENDING') {
      const hasProfessionalLicense =
        professionalLicense || user.professionalProfile?.professionalLicense;
      const hasSpecialty = (specialty && specialty.length > 0) || (user.professionalProfile?.specialities && user.professionalProfile.specialities.length > 0);

      if (hasProfessionalLicense && hasSpecialty) {
        newStatus = UserStatus.COMPLETED;
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      omit: {
        password: true,
      },
      data: {
        ...userData,
        cpf: cpf,
        status: newStatus,
      },
    });

    if (user.role === 'PROFESSIONAL') {
      if (
        specialty ||
        professionalLicense ||
        bio ||
        modality ||
        photoUrl
      ) {
        await this.prisma.professionalProfile.upsert({
          where: { userId: id },
          create: {
            userId: id,
            professionalLicense: professionalLicense || '',
            modality: modality || 'VIRTUAL',
            bio: bio,
            photoUrl: photoUrl,
            socialLinks: socialLinks,
            specialities: specialtyIds.length > 0 ? {
              connect: specialtyIds.map(id => ({ id }))
            } : undefined,
          },
          update: {
            professionalLicense: professionalLicense,
            modality: modality,
            bio: bio,
            photoUrl: photoUrl ?? user.professionalProfile?.photoUrl,
            socialLinks: socialLinks,
            specialities: specialtyIds.length > 0 ? {
              set: specialtyIds.map(id => ({ id }))
            } : undefined,
          },
        });
      }
    }

    if (user.role === 'PATIENT' && user.patientProfile) {
      if (phone || dateOfBirth || gender || address || cpf) {
        await this.prisma.patientProfile.update({
          where: { userId: id },
          data: {
            phone,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
            gender,
            address,
          },
        });
      }
    }

    return updatedUser;
  }

  async verifyUser(id: string, emailVerified: boolean) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) throw new NotFoundException('Usuário não encontrado');

    const updatedUser = await this.prisma.user.update({
      where: { id },
      omit: {
        password: true,
      },
      data: { emailVerified },
    });

    const emailData = { name: user.name, email: user.email };

    if (emailVerified) {
      this.mailService.sendAccountApprovedEmail(emailData).catch((err) => {
        console.error(
          `Falha ao enviar email de aprovação para ${user.email}:`,
          err.message,
        );
      });
    } else {
      this.mailService.sendAccountRejectedEmail(emailData).catch((err) => {
        console.error(
          `Falha ao enviar email de rejeição para ${user.email}:`,
          err.message,
        );
      });
    }

    return updatedUser;
  }

  async findAllProfessionals() {
    return this.prisma.user.findMany({
      where: { role: UserRole.PROFESSIONAL },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        professionalProfile: {
          include: {
            specialities: true
          }
        }
      },
    });
  }

  async findAllPatients() {
    return this.prisma.user.findMany({
      where: { role: UserRole.PATIENT },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        patientProfile: {
          include: {
            questionnaire: true,
          },
        },
      },
    });
  }
}
