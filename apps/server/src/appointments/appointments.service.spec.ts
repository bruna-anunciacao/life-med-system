import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { AppointmentStatus } from '@prisma/client';
import { AppointmentsRepository } from './appointments.repository';
import { AppointmentsService } from './appointments.service';

describe('AppointmentsService', () => {
  const repository = {
    findAppointmentById: jest.fn(),
    cancelAppointment: jest.fn(),
    updateAppointmentStatus: jest.fn(),
    findProfessionalById: jest.fn(),
    findAvailabilityForSlots: jest.fn(),
    findBookedTimes: jest.fn(),
    findScheduleBlocksForDate: jest.fn(),
  };
  const mailService = {
    sendAppointmentCancelledEmail: jest.fn().mockResolvedValue(undefined),
  };
  const meetService = {
    cancelMeetEvent: jest.fn().mockResolvedValue(undefined),
  };

  let service: AppointmentsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AppointmentsService(
      repository as unknown as AppointmentsRepository,
      mailService as any,
      meetService as any,
    );
  });

  const hoursFromNow = (h: number) => new Date(Date.now() + h * 60 * 60 * 1000);

  const makeAppointment = (overrides: Record<string, unknown> = {}) => ({
    id: 'appt-1',
    dateTime: hoursFromNow(48),
    status: AppointmentStatus.SCHEDULED,
    notes: null,
    modality: 'IN_PERSON',
    googleEventId: null,
    professionalId: 'prof-1',
    createdAt: new Date(),
    professional: {
      id: 'prof-1',
      name: 'Dra. Ana',
      email: 'ana@lifemed.com',
      professionalProfile: { specialities: [], photoUrl: null, bio: null },
    },
    patient: { id: 'pat-1', name: 'João', email: 'joao@lifemed.com' },
    ...overrides,
  });

  describe('cancelAppointment', () => {
    it('throws NotFound when the appointment does not exist', async () => {
      repository.findAppointmentById.mockResolvedValue(null);

      await expect(
        service.cancelAppointment('missing', {} as any),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('rejects cancelling an already-cancelled appointment', async () => {
      repository.findAppointmentById.mockResolvedValue(
        makeAppointment({ status: AppointmentStatus.CANCELLED }),
      );

      await expect(
        service.cancelAppointment('appt-1', {} as any),
      ).rejects.toThrow('já foi cancelado');
    });

    it('rejects cancellation with less than the minimum advance notice', async () => {
      repository.findAppointmentById.mockResolvedValue(
        makeAppointment({ dateTime: hoursFromNow(2) }),
      );

      await expect(
        service.cancelAppointment('appt-1', {} as any),
      ).rejects.toThrow('antecedência');

      expect(repository.cancelAppointment).not.toHaveBeenCalled();
    });

    it('cancels when within the allowed window and notifies both parties', async () => {
      repository.findAppointmentById.mockResolvedValue(makeAppointment());
      repository.cancelAppointment.mockResolvedValue(
        makeAppointment({ status: AppointmentStatus.CANCELLED }),
      );

      const result = await service.cancelAppointment('appt-1', {
        reason: 'Imprevisto',
      } as any);

      expect(repository.cancelAppointment).toHaveBeenCalledWith(
        'appt-1',
        'Imprevisto',
      );
      expect(mailService.sendAppointmentCancelledEmail).toHaveBeenCalledTimes(2);
      expect(result.status).toBe(AppointmentStatus.CANCELLED);
    });

    it('cancels the Google Calendar event when one exists', async () => {
      repository.findAppointmentById.mockResolvedValue(makeAppointment());
      repository.cancelAppointment.mockResolvedValue(
        makeAppointment({
          status: AppointmentStatus.CANCELLED,
          googleEventId: 'gcal-123',
        }),
      );

      await service.cancelAppointment('appt-1', { reason: 'x' } as any);

      expect(meetService.cancelMeetEvent).toHaveBeenCalledWith('gcal-123');
    });
  });

  describe('updateAppointmentStatus', () => {
    it('throws NotFound when the appointment does not exist', async () => {
      repository.findAppointmentById.mockResolvedValue(null);

      await expect(
        service.updateAppointmentStatus('missing', 'prof-1', {
          status: AppointmentStatus.COMPLETED,
        } as any),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('forbids a professional from changing another professional appointment', async () => {
      repository.findAppointmentById.mockResolvedValue(makeAppointment());

      await expect(
        service.updateAppointmentStatus('appt-1', 'other-prof', {
          status: AppointmentStatus.COMPLETED,
        } as any),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('rejects changing the status of a cancelled appointment', async () => {
      repository.findAppointmentById.mockResolvedValue(
        makeAppointment({ status: AppointmentStatus.CANCELLED }),
      );

      await expect(
        service.updateAppointmentStatus('appt-1', 'prof-1', {
          status: AppointmentStatus.COMPLETED,
        } as any),
      ).rejects.toThrow('cancelado');
    });

    it('rejects marking COMPLETED before the appointment time', async () => {
      repository.findAppointmentById.mockResolvedValue(
        makeAppointment({ dateTime: hoursFromNow(24) }),
      );

      await expect(
        service.updateAppointmentStatus('appt-1', 'prof-1', {
          status: AppointmentStatus.COMPLETED,
        } as any),
      ).rejects.toThrow('após o horário agendado');
    });

    it('allows marking COMPLETED after the appointment time', async () => {
      repository.findAppointmentById.mockResolvedValue(
        makeAppointment({ dateTime: hoursFromNow(-1) }),
      );
      repository.updateAppointmentStatus.mockResolvedValue(
        makeAppointment({
          dateTime: hoursFromNow(-1),
          status: AppointmentStatus.COMPLETED,
        }),
      );

      const result = await service.updateAppointmentStatus('appt-1', 'prof-1', {
        status: AppointmentStatus.COMPLETED,
      } as any);

      expect(result.status).toBe(AppointmentStatus.COMPLETED);
    });
  });

  describe('getAvailableSlots', () => {
    beforeEach(() => {
      repository.findProfessionalById.mockResolvedValue({ id: 'prof-1' });
    });

    it('throws NotFound when the professional does not exist', async () => {
      repository.findProfessionalById.mockResolvedValue(null);

      await expect(
        service.getAvailableSlots('missing', { date: '2026-06-15' } as any),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('returns empty slots when there is no availability for the day', async () => {
      repository.findAvailabilityForSlots.mockResolvedValue(null);

      const result = await service.getAvailableSlots('prof-1', {
        date: '2026-06-15',
      } as any);

      expect(result.slots).toEqual([]);
    });

    it('generates 30-min slots and marks booked/blocked times unavailable', async () => {
      repository.findAvailabilityForSlots.mockResolvedValue({
        startTime: '09:00',
        endTime: '11:00',
      });
      repository.findBookedTimes.mockResolvedValue([
        { dateTime: new Date('2026-06-15T09:30:00') },
      ]);
      repository.findScheduleBlocksForDate.mockResolvedValue([
        { startTime: '10:00', endTime: '10:30' },
      ]);

      const result = await service.getAvailableSlots('prof-1', {
        date: '2026-06-15',
      } as any);

      // 09:00-11:00 em passos de 30min => 4 slots
      expect(result.slots).toHaveLength(4);
      const byTime = Object.fromEntries(
        result.slots.map((s) => [s.time, s.available]),
      );
      expect(byTime['09:00']).toBe(true);
      expect(byTime['09:30']).toBe(false); // booked
      expect(byTime['10:00']).toBe(false); // blocked
      expect(byTime['10:30']).toBe(true);
    });

    it('blocks the whole day when a block has no start/end time', async () => {
      repository.findAvailabilityForSlots.mockResolvedValue({
        startTime: '09:00',
        endTime: '10:00',
      });
      repository.findBookedTimes.mockResolvedValue([]);
      repository.findScheduleBlocksForDate.mockResolvedValue([
        { startTime: null, endTime: null },
      ]);

      const result = await service.getAvailableSlots('prof-1', {
        date: '2026-06-15',
      } as any);

      expect(result.slots.every((s) => s.available === false)).toBe(true);
    });
  });
});
