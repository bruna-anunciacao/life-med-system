import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AppointmentStatus } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import { ProfessionalRepository } from './professional.repository';
import { ProfessionalService } from './professional.service';

describe('ProfessionalService', () => {
  const repository = {
    findSettingsProfile: jest.fn(),
    findActiveAvailability: jest.fn(),
    findAppointmentsWithPatients: jest.fn(),
    updateSettings: jest.fn(),
    findScheduleBlockById: jest.fn(),
    deleteScheduleBlock: jest.fn(),
  };
  const mailService = {};
  const meetService = { cancelMeetEvent: jest.fn() };

  let service: ProfessionalService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ProfessionalService(
      repository as unknown as ProfessionalRepository,
      mailService as unknown as MailService,
      meetService as any,
    );
  });

  describe('getSettings', () => {
    it('throws NotFound when the professional profile does not exist', async () => {
      repository.findSettingsProfile.mockResolvedValue(null);

      await expect(service.getSettings('u-1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('applies defaults for payments and price when missing', async () => {
      repository.findSettingsProfile.mockResolvedValue({
        modality: 'VIRTUAL',
        payments: null,
        price: 0,
      });
      repository.findActiveAvailability.mockResolvedValue([
        { dayOfWeek: 1, startTime: '09:00', endTime: '12:00' },
      ]);

      const result = await service.getSettings('u-1');

      expect(result.payments).toEqual(['pix']);
      expect(result.price).toBe(0);
      expect(result.availability).toEqual([
        { dayOfWeek: 1, start: '09:00', end: '12:00' },
      ]);
    });
  });

  describe('updateSettings validation', () => {
    it('rejects when availability is empty', async () => {
      await expect(
        service.updateSettings('u-1', { availability: [] } as any),
      ).rejects.toThrow('At least one availability');
    });

    it('rejects duplicate dayOfWeek entries', async () => {
      await expect(
        service.updateSettings('u-1', {
          availability: [
            { dayOfWeek: 1, start: '09:00', end: '12:00' },
            { dayOfWeek: 1, start: '13:00', end: '15:00' },
          ],
        } as any),
      ).rejects.toThrow('Duplicate dayOfWeek');
    });

    it('rejects when start is not before end', async () => {
      await expect(
        service.updateSettings('u-1', {
          availability: [{ dayOfWeek: 1, start: '12:00', end: '09:00' }],
        } as any),
      ).rejects.toThrow('Invalid time range');
    });

    it('persists when availability is valid', async () => {
      repository.updateSettings.mockResolvedValue({ ok: true });

      const result = await service.updateSettings('u-1', {
        availability: [{ dayOfWeek: 1, start: '09:00', end: '12:00' }],
      } as any);

      expect(repository.updateSettings).toHaveBeenCalled();
      expect(result).toEqual({ ok: true });
    });
  });

  describe('getPatients aggregation', () => {
    it('dedups patients and computes last/next visit correctly', async () => {
      const now = Date.now();
      const past = new Date(now - 86400000); // ontem
      const future = new Date(now + 86400000); // amanhã

      repository.findAppointmentsWithPatients.mockResolvedValue([
        {
          dateTime: past,
          status: AppointmentStatus.COMPLETED,
          patient: {
            id: 'pat-1',
            name: 'João',
            email: 'joao@x.com',
            cpf: null,
            patientProfile: { phone: '111' },
          },
        },
        {
          dateTime: future,
          status: AppointmentStatus.CONFIRMED,
          patient: {
            id: 'pat-1',
            name: 'João',
            email: 'joao@x.com',
            cpf: null,
            patientProfile: { phone: '111' },
          },
        },
      ]);

      const result = await service.getPatients('u-1');

      expect(result).toHaveLength(1);
      expect(result[0].lastVisit).toBe(past.toISOString());
      expect(result[0].nextVisit).toBe(future.toISOString());
      expect(result[0].phone).toBe('111');
    });

    it('falls back to "Não informado" when phone is missing', async () => {
      repository.findAppointmentsWithPatients.mockResolvedValue([
        {
          dateTime: new Date(Date.now() - 1000),
          status: AppointmentStatus.COMPLETED,
          patient: {
            id: 'pat-2',
            name: 'Maria',
            email: 'maria@x.com',
            cpf: null,
            patientProfile: null,
          },
        },
      ]);

      const result = await service.getPatients('u-1');

      expect(result[0].phone).toBe('Não informado');
    });
  });

  describe('deleteScheduleBlock', () => {
    it('throws NotFound when the block does not exist', async () => {
      repository.findScheduleBlockById.mockResolvedValue(null);

      await expect(
        service.deleteScheduleBlock('u-1', 'b-1'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('forbids deleting a block owned by another professional', async () => {
      repository.findScheduleBlockById.mockResolvedValue({
        professionalId: 'other',
      });

      await expect(service.deleteScheduleBlock('u-1', 'b-1')).rejects.toThrow(
        'Sem permissão',
      );
    });

    it('deletes the block when owned by the requester', async () => {
      repository.findScheduleBlockById.mockResolvedValue({
        professionalId: 'u-1',
      });
      repository.deleteScheduleBlock.mockResolvedValue(undefined);

      const result = await service.deleteScheduleBlock('u-1', 'b-1');

      expect(repository.deleteScheduleBlock).toHaveBeenCalledWith('b-1');
      expect(result.message).toMatch(/removido/);
    });
  });
});
