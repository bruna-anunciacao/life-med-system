import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from 'services/mail.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRoleEnum } from '../auth/enums/user-role-enum';
import { UserStatusEnum } from '../auth/enums/user-status-enum';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) { }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        patientProfile: true,
        professionalProfile: true,
      },
    });

    if (!user) throw new NotFoundException('Usuário não encontrado');

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { professionalProfile: true, patientProfile: true },
    });

    if (!user) throw new NotFoundException('Usuário não encontrado');

    const {
      specialty,
      crm: professionalLicense,
      bio,
      status,
      modality,
      subspecialty,
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

    if (user.role === 'PROFESSIONAL' && user.status === 'PENDING') {
      const hasProfessionalLicense =
        professionalLicense || user.professionalProfile?.professionalLicense;
      const hasSpecialty = specialty || user.professionalProfile?.specialty;

      if (hasProfessionalLicense && hasSpecialty) {
        newStatus = UserStatusEnum.COMPLETED;
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
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
        subspecialty ||
        photoUrl
      ) {
        await this.prisma.professionalProfile.upsert({
          where: { userId: id },
          create: {
            userId: id,
            professionalLicense: professionalLicense || '',
            specialty: specialty || '',
            modality: modality || 'VIRTUAL',
            bio: bio,
            subspecialty: subspecialty,
            photoUrl: photoUrl,
            socialLinks: socialLinks,
          },
          update: {
            professionalLicense: professionalLicense,
            specialty: specialty,
            modality: modality,
            bio: bio,
            subspecialty: subspecialty,
            photoUrl: photoUrl ?? user.professionalProfile?.photoUrl,
            socialLinks: socialLinks,
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = updatedUser;
    return result;
  }

  async verifyUser(id: string, emailVerified: boolean) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) throw new NotFoundException('Usuário não encontrado');

    const updatedUser = await this.prisma.user.update({
      where: { id },
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = updatedUser;
    return result;
  }

  async findAllProfessionals() {
    return this.prisma.user.findMany({
      where: { role: UserRoleEnum.PROFESSIONAL },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        professionalProfile: {
          select: {
            id: true,
            specialty: true,
            professionalLicense: true,
            photoUrl: true,
          },
        },
      },
    });
  }

  async findAllPatients() {
    return this.prisma.user.findMany({
      where: { role: UserRoleEnum.PATIENT },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        patientProfile: true,
      },
    });
  }
}
