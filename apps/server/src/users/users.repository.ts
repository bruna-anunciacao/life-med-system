import { Injectable } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { ListAdminUsersQueryDto } from 'src/admin/dto/list-admin-users-query-dto';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByIdWithProfiles(id: string) {
    return this.prisma.user.findUnique({
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
            specialities: true,
          },
        },
        managerProfile: true,
      },
    });
  }

  findForUpdate(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        patientProfile: true,
        professionalProfile: { include: { specialities: true } },
        managerProfile: true,
      },
    });
  }

  findForAdminUpdate(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        patientProfile: { include: { questionnaire: true } },
        professionalProfile: { include: { specialities: true } },
      },
    });
  }

  findByCpf(cpf: string) {
    return this.prisma.user.findUnique({ where: { cpf } });
  }

  updateUser(id: string, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({
      where: { id },
      omit: { password: true },
      data,
    });
  }

  upsertProfessionalProfile(
    userId: string,
    data: Pick<
      UpdateUserDto,
      'crm' | 'modality' | 'bio' | 'photoUrl' | 'socialLinks'
    > & { specialtyIds: string[]; currentPhotoUrl?: string | null },
  ) {
    return this.prisma.professionalProfile.upsert({
      where: { userId },
      create: {
        userId,
        professionalLicense: data.crm || '',
        modality: data.modality || 'VIRTUAL',
        bio: data.bio,
        photoUrl: data.photoUrl,
        socialLinks: data.socialLinks,
        specialities:
          data.specialtyIds.length > 0
            ? {
                connect: data.specialtyIds.map((id) => ({ id })),
              }
            : undefined,
      },
      update: {
        professionalLicense: data.crm,
        modality: data.modality,
        bio: data.bio,
        photoUrl: data.photoUrl ?? data.currentPhotoUrl,
        socialLinks: data.socialLinks,
        specialities:
          data.specialtyIds.length > 0
            ? {
                set: data.specialtyIds.map((id) => ({ id })),
              }
            : undefined,
      },
    });
  }

  updatePatientProfile(
    userId: string,
    data: Pick<UpdateUserDto, 'phone' | 'dateOfBirth' | 'gender'>,
  ) {
    return this.prisma.patientProfile.update({
      where: { userId },
      data: {
        phone: data.phone,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        gender: data.gender,
      },
    });
  }

  upsertManagerProfile(
    userId: string,
    data: Pick<UpdateUserDto, 'phone' | 'bio' | 'photoUrl'>,
  ) {
    return this.prisma.managerProfile.upsert({
      where: { userId },
      create: {
        userId,
        phone: data.phone,
        bio: data.bio,
        photoUrl: data.photoUrl,
      },
      update: {
        phone: data.phone,
        bio: data.bio,
        photoUrl: data.photoUrl,
      },
    });
  }

  findAllUsers(query: ListAdminUsersQueryDto) {
    return this.prisma.user.findMany({
      where: {
        role: query.role ?? { in: ['PATIENT', 'PROFESSIONAL', 'MANAGER'] },
        ...(query.status && { status: query.status }),
        ...(query.search && {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' } },
            { email: { contains: query.search, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        patientProfile: true,
        professionalProfile: { include: { specialities: true } },
      },
      orderBy: { [query.sortBy ?? 'name']: query.sortOrder ?? 'asc' },
    });
  }

  findAllProfessionals() {
    return this.prisma.user.findMany({
      where: { role: UserRole.PROFESSIONAL },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        professionalProfile: {
          include: {
            specialities: true,
          },
        },
      },
    });
  }
}
