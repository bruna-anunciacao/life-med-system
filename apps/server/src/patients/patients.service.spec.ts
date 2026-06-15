import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { MailService } from '../mail/mail.service';
import { ReportsService } from '../reports/reports.service';
import { PatientsRepository } from './patients.repository';
import { PatientsService } from './patients.service';

describe('PatientsService', () => {
  const repository = {
    findAppointmentsByStatus: jest.fn(),
    findUserByEmail: jest.fn(),
    findUserByCpf: jest.fn(),
    createAssistedPatient: jest.fn(),
    findPatientForUpdate: jest.fn(),
    updatePatient: jest.fn(),
    listPatients: jest.fn(),
    findPatientWithQuestionnaire: jest.fn(),
  };
  const reportsService = {};
  const mailService = {
    sendTempPasswordEmail: jest.fn().mockResolvedValue(undefined),
  };

  let service: PatientsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PatientsService(
      repository as unknown as PatientsRepository,
      reportsService as unknown as ReportsService,
      mailService as unknown as MailService,
    );
  });

  describe('createAssistedPatient', () => {
    const dto = { email: 'novo@lifemed.com', name: 'Novo', cpf: '123' } as any;

    it('rejects when the email already exists', async () => {
      repository.findUserByEmail.mockResolvedValue({ id: 'x' });

      await expect(service.createAssistedPatient(dto)).rejects.toThrow(
        'Email já cadastrado',
      );
      expect(repository.createAssistedPatient).not.toHaveBeenCalled();
    });

    it('rejects when the CPF already exists', async () => {
      repository.findUserByEmail.mockResolvedValue(null);
      repository.findUserByCpf.mockResolvedValue({ id: 'x' });

      await expect(service.createAssistedPatient(dto)).rejects.toThrow(
        'CPF já cadastrado',
      );
    });

    it('generates a hashed temp password and emails it', async () => {
      repository.findUserByEmail.mockResolvedValue(null);
      repository.findUserByCpf.mockResolvedValue(null);
      repository.createAssistedPatient.mockResolvedValue({
        id: 'p-1',
        email: dto.email,
        name: dto.name,
        role: UserRole.PATIENT,
        patientProfile: {},
        address: null,
      });

      const result = await service.createAssistedPatient(dto);

      const [, hashedPassword] =
        repository.createAssistedPatient.mock.calls[0];
      // É um hash bcrypt, não texto plano.
      expect(hashedPassword).toMatch(/^\$2[aby]\$/);
      expect(mailService.sendTempPasswordEmail).toHaveBeenCalled();
      const [, tempPassword] = mailService.sendTempPasswordEmail.mock.calls[0];
      expect(await bcrypt.compare(tempPassword, hashedPassword)).toBe(true);
      expect(result.id).toBe('p-1');
    });
  });

  describe('updatePatient', () => {
    it('throws NotFound when the user is not a patient', async () => {
      repository.findPatientForUpdate.mockResolvedValue({
        role: UserRole.PROFESSIONAL,
        patientProfile: {},
      });

      await expect(
        service.updatePatient('p-1', {} as any),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws NotFound when the patient profile is missing', async () => {
      repository.findPatientForUpdate.mockResolvedValue({
        role: UserRole.PATIENT,
        patientProfile: null,
      });

      await expect(
        service.updatePatient('p-1', {} as any),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('rejects updating to a CPF that belongs to another user', async () => {
      repository.findPatientForUpdate.mockResolvedValue({
        id: 'p-1',
        role: UserRole.PATIENT,
        cpf: '111',
        patientProfile: {},
      });
      repository.findUserByCpf.mockResolvedValue({ id: 'other' });

      await expect(
        service.updatePatient('p-1', { cpf: '999' } as any),
      ).rejects.toThrow('CPF já cadastrado');
    });

    it('allows keeping the same CPF (no duplicate check triggered)', async () => {
      repository.findPatientForUpdate.mockResolvedValue({
        id: 'p-1',
        role: UserRole.PATIENT,
        cpf: '111',
        patientProfile: {},
      });
      repository.updatePatient.mockResolvedValue({
        id: 'p-1',
        email: 'a@a.com',
        name: 'A',
        cpf: '111',
        patientProfile: {},
        address: null,
      });

      await service.updatePatient('p-1', { cpf: '111' } as any);

      expect(repository.findUserByCpf).not.toHaveBeenCalled();
    });
  });

  describe('getPatient', () => {
    it('throws NotFound when the user is not a patient', async () => {
      repository.findPatientWithQuestionnaire.mockResolvedValue({
        role: UserRole.ADMIN,
      });

      await expect(service.getPatient('p-1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
