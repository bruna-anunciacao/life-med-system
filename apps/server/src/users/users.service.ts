import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { MailService } from 'src/mail/mail.service';
import { UpdateUserDto } from './dto/update-user.dto';

import { ListAdminUsersQueryDto } from 'src/admin/dto/list-admin-users-query-dto';
@Injectable()
export class UsersService {
  constructor(
    private repository: UsersRepository,
    private mailService: MailService,
  ) {}

  async findOne(id: string) {
    const user = await this.repository.findByIdWithProfiles(id);

    if (!user) throw new NotFoundException('Usuário não encontrado');

    return user;
  }

  async update(userId: string, dto: UpdateUserDto) {
    const user = await this.repository.findForUpdate(userId);

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
      cpf,
      ...userData
    } = dto;

    const specialtyIds = specialty ?? [];

    const updatedUser = await this.repository.updateUser(userId, {
      ...userData,
      cpf,
    });

    if (
      user.role === 'PROFESSIONAL' &&
      (specialty ||
        professionalLicense ||
        bio ||
        modality ||
        photoUrl ||
        socialLinks)
    ) {
      await this.repository.upsertProfessionalProfile(userId, {
        crm: professionalLicense,
        modality,
        bio,
        photoUrl,
        socialLinks,
        specialtyIds,
        currentPhotoUrl: user.professionalProfile?.photoUrl,
      });
    }

    if (
      user.role === 'PATIENT' &&
      user.patientProfile &&
      (phone || dateOfBirth || gender || cpf)
    ) {
      await this.repository.updatePatientProfile(userId, {
        phone,
        dateOfBirth,
        gender,
      });
    }

    if (
      user.role === 'MANAGER' &&
      (phone !== undefined || bio !== undefined || photoUrl !== undefined)
    ) {
      await this.repository.upsertManagerProfile(userId, {
        phone,
        bio,
        photoUrl,
      });
    }

    return updatedUser;
  }

  async updateUserAsAdmin(targetId: string, dto: UpdateUserDto) {
    const user = await this.repository.findForAdminUpdate(targetId);

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
      cpf,
      ...userData
    } = dto;

    if (cpf !== undefined && cpf && cpf !== user.cpf) {
      const cpfExists = await this.repository.findByCpf(cpf);
      if (cpfExists && cpfExists.id !== targetId) {
        throw new BadRequestException('CPF já cadastrado');
      }
    }

    let newStatus = status ? status : user.status;

    const specialtyIds = Array.isArray(specialty)
      ? specialty
      : specialty
        ? [specialty]
        : [];

    if (user.role === 'PROFESSIONAL' && user.status === 'PENDING') {
      const hasProfessionalLicense =
        professionalLicense || user.professionalProfile?.professionalLicense;
      const hasSpecialty =
        (specialty && specialty.length > 0) ||
        (user.professionalProfile?.specialities &&
          user.professionalProfile.specialities.length > 0);

      if (hasProfessionalLicense && hasSpecialty) {
        newStatus = 'COMPLETED';
      }
    }

    const updatedUser = await this.repository.updateUser(targetId, {
      ...userData,
      cpf,
      status: newStatus,
    });

    if (
      user.role === 'PROFESSIONAL' &&
      (specialty || professionalLicense || bio || modality || photoUrl)
    ) {
      await this.repository.upsertProfessionalProfile(targetId, {
        crm: professionalLicense,
        modality,
        bio,
        photoUrl,
        socialLinks,
        specialtyIds,
        currentPhotoUrl: user.professionalProfile?.photoUrl,
      });
    }

    if (
      user.role === 'PATIENT' &&
      user.patientProfile &&
      (phone || dateOfBirth || gender || cpf)
    ) {
      await this.repository.updatePatientProfile(targetId, {
        phone,
        dateOfBirth,
        gender,
      });
    }

    return updatedUser;
  }

  async verifyUser(id: string, emailVerified: boolean) {
    const user = await this.repository.findForUpdate(id);

    if (!user) throw new NotFoundException('Usuário não encontrado');

    const updatedUser = await this.repository.updateUser(id, {
      emailVerified,
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

  async findAllUsers(query: ListAdminUsersQueryDto) {
    return this.repository.findAllUsers(query);
  }

  async findAllProfessionals() {
    return this.repository.findAllProfessionals();
  }
}
