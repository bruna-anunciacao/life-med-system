import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MailService } from 'src/mail/mail.service';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

describe('UsersService', () => {
  const repository = {
    findByIdWithProfiles: jest.fn(),
    findForUpdate: jest.fn(),
    findForAdminUpdate: jest.fn(),
    findByCpf: jest.fn(),
    updateUser: jest.fn(),
    upsertProfessionalProfile: jest.fn(),
    updatePatientProfile: jest.fn(),
    findAllUsers: jest.fn(),
    findAllProfessionals: jest.fn(),
  };
  const mailService = {
    sendAccountApprovedEmail: jest.fn().mockResolvedValue(undefined),
    sendAccountRejectedEmail: jest.fn().mockResolvedValue(undefined),
  };

  let service: UsersService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UsersService(
      repository as unknown as UsersRepository,
      mailService as unknown as MailService,
    );
  });

  describe('findOne', () => {
    it('throws NotFound when the user does not exist', async () => {
      repository.findByIdWithProfiles.mockResolvedValue(null);

      await expect(service.findOne('x')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('returns the user when found', async () => {
      repository.findByIdWithProfiles.mockResolvedValue({ id: 'u-1' });

      await expect(service.findOne('u-1')).resolves.toEqual({ id: 'u-1' });
    });
  });

  describe('update', () => {
    it('throws NotFound when the user does not exist', async () => {
      repository.findForUpdate.mockResolvedValue(null);

      await expect(service.update('x', {} as any)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('upserts the professional profile only for professionals with profile fields', async () => {
      repository.findForUpdate.mockResolvedValue({
        role: 'PROFESSIONAL',
        professionalProfile: { photoUrl: 'old.png' },
      });
      repository.updateUser.mockResolvedValue({ id: 'u-1' });

      await service.update('u-1', { bio: 'Nova bio' } as any);

      expect(repository.upsertProfessionalProfile).toHaveBeenCalled();
      expect(repository.updatePatientProfile).not.toHaveBeenCalled();
    });

    it('updates the patient profile only for patients with profile fields', async () => {
      repository.findForUpdate.mockResolvedValue({
        role: 'PATIENT',
        patientProfile: {},
      });
      repository.updateUser.mockResolvedValue({ id: 'u-1' });

      await service.update('u-1', { phone: '99999' } as any);

      expect(repository.updatePatientProfile).toHaveBeenCalled();
      expect(repository.upsertProfessionalProfile).not.toHaveBeenCalled();
    });
  });

  describe('updateUserAsAdmin', () => {
    it('rejects a CPF that already belongs to another user', async () => {
      repository.findForAdminUpdate.mockResolvedValue({
        id: 'u-1',
        role: 'PATIENT',
        cpf: '111',
        patientProfile: {},
      });
      repository.findByCpf.mockResolvedValue({ id: 'other' });

      await expect(
        service.updateUserAsAdmin('u-1', { cpf: '999' } as any),
      ).rejects.toThrow('CPF já cadastrado');
    });

    it('promotes a PENDING professional to COMPLETED when license and specialty are present', async () => {
      repository.findForAdminUpdate.mockResolvedValue({
        id: 'u-1',
        role: 'PROFESSIONAL',
        status: 'PENDING',
        cpf: null,
        professionalProfile: { specialities: [] },
      });
      repository.updateUser.mockResolvedValue({ id: 'u-1' });

      await service.updateUserAsAdmin('u-1', {
        crm: 'CRM-123',
        specialty: ['spec-1'],
      } as any);

      expect(repository.updateUser).toHaveBeenCalledWith(
        'u-1',
        expect.objectContaining({ status: 'COMPLETED' }),
      );
    });

    it('keeps the existing status when license/specialty are incomplete', async () => {
      repository.findForAdminUpdate.mockResolvedValue({
        id: 'u-1',
        role: 'PROFESSIONAL',
        status: 'PENDING',
        cpf: null,
        professionalProfile: { specialities: [] },
      });
      repository.updateUser.mockResolvedValue({ id: 'u-1' });

      await service.updateUserAsAdmin('u-1', { crm: 'CRM-123' } as any);

      expect(repository.updateUser).toHaveBeenCalledWith(
        'u-1',
        expect.objectContaining({ status: 'PENDING' }),
      );
    });
  });

  describe('verifyUser', () => {
    it('sends an approval email when verifying', async () => {
      repository.findForUpdate.mockResolvedValue({
        name: 'A',
        email: 'a@a.com',
      });
      repository.updateUser.mockResolvedValue({ id: 'u-1' });

      await service.verifyUser('u-1', true);

      expect(mailService.sendAccountApprovedEmail).toHaveBeenCalled();
      expect(mailService.sendAccountRejectedEmail).not.toHaveBeenCalled();
    });

    it('sends a rejection email when not verifying', async () => {
      repository.findForUpdate.mockResolvedValue({
        name: 'A',
        email: 'a@a.com',
      });
      repository.updateUser.mockResolvedValue({ id: 'u-1' });

      await service.verifyUser('u-1', false);

      expect(mailService.sendAccountRejectedEmail).toHaveBeenCalled();
      expect(mailService.sendAccountApprovedEmail).not.toHaveBeenCalled();
    });

    it('throws NotFound when the user does not exist', async () => {
      repository.findForUpdate.mockResolvedValue(null);

      await expect(service.verifyUser('x', true)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
