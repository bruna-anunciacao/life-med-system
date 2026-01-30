import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRoleEnum } from '../auth/enums/user-role-enum';
import { UserStatusEnum } from '../auth/enums/user-status-enum';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

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
      include: { professionalProfile: true },
    });

    if (!user) throw new NotFoundException('Usuário não encontrado');

    const {
      specialty,
      crm,
      bio,
      status,
      modality,
      subspecialty,
      photoUrl,
      ...userData
    } = dto;

    let newStatus = status ? status : user.status;

    if (user.role === 'PROFESSIONAL' && user.status === 'PENDING') {
      const hasCrm = crm || user.professionalProfile?.professionalLicense;
      const hasSpecialty = specialty || user.professionalProfile?.specialty;

      if (hasCrm && hasSpecialty) {
        newStatus = UserStatusEnum.COMPLETED;
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...userData,
        status: newStatus,
      },
    });

    if (user.role === 'PROFESSIONAL') {
      if (specialty || crm || bio || modality || subspecialty || photoUrl) {
        await this.prisma.professionalProfile.upsert({
          where: { userId: id },
          create: {
            userId: id,
            professionalLicense: crm || '',
            specialty: specialty || '',
            modality: modality || 'VIRTUAL',
            bio: bio,
            subspecialty: subspecialty,
            photoUrl: photoUrl,
          },
          update: {
            professionalLicense: crm,
            specialty: specialty,
            modality: modality,
            bio: bio,
            subspecialty: subspecialty,
            photoUrl: photoUrl,
          },
        });
      }
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
