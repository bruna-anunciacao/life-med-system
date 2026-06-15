import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AppointmentStatus, UserRole } from '@prisma/client';
import { ManagerRepository } from './manager.repository';
import { ManagerService } from './manager.service';

describe('ManagerService', () => {
  const repository = {
    findAppointmentById: jest.fn(),
    findManagerProfileByUserId: jest.fn(),
    cancelAppointmentByManager: jest.fn(),
    findAllAppointmentsForManagerAndAdmin: jest.fn(),
    findProfessionalWithSpecialities: jest.fn(),
    findActiveAvailabilityByProfessionalId: jest.fn(),
  };

  let service: ManagerService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ManagerService(repository as unknown as ManagerRepository);
  });

  describe('cancelAppointment', () => {
    it('throws NotFound when the appointment does not exist', async () => {
      repository.findAppointmentById.mockResolvedValue(null);

      await expect(
        service.cancelAppointment('mgr-1', 'appt-1'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('rejects cancelling an already-cancelled appointment', async () => {
      repository.findAppointmentById.mockResolvedValue({
        status: AppointmentStatus.CANCELLED,
      });

      await expect(
        service.cancelAppointment('mgr-1', 'appt-1'),
      ).rejects.toThrow('já está cancelada');
    });

    it('throws NotFound when the manager profile is missing', async () => {
      repository.findAppointmentById.mockResolvedValue({
        status: AppointmentStatus.PENDING,
      });
      repository.findManagerProfileByUserId.mockResolvedValue(null);

      await expect(
        service.cancelAppointment('mgr-1', 'appt-1'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('cancels with a manager-tagged note including the reason', async () => {
      repository.findAppointmentById.mockResolvedValue({
        status: AppointmentStatus.PENDING,
      });
      repository.findManagerProfileByUserId.mockResolvedValue({ id: 'mp-1' });
      repository.cancelAppointmentByManager.mockResolvedValue({ ok: true });

      await service.cancelAppointment('mgr-1', 'appt-1', 'Paciente desistiu');

      expect(repository.cancelAppointmentByManager).toHaveBeenCalledWith(
        'appt-1',
        'mp-1',
        '[CANCELADO PELO GESTOR] Paciente desistiu',
      );
    });

    it('uses a default note when no reason is provided', async () => {
      repository.findAppointmentById.mockResolvedValue({
        status: AppointmentStatus.PENDING,
      });
      repository.findManagerProfileByUserId.mockResolvedValue({ id: 'mp-1' });
      repository.cancelAppointmentByManager.mockResolvedValue({ ok: true });

      await service.cancelAppointment('mgr-1', 'appt-1');

      expect(repository.cancelAppointmentByManager).toHaveBeenCalledWith(
        'appt-1',
        'mp-1',
        '[CANCELADO PELO GESTOR]',
      );
    });
  });

  describe('listAppointments vulnerability sorting', () => {
    const makeAppt = (
      id: string,
      dateTime: Date,
      totalScore: number | null,
    ) => ({
      id,
      dateTime,
      status: AppointmentStatus.PENDING,
      notes: null,
      modality: 'IN_PERSON',
      meetLink: null,
      createdAt: dateTime,
      patient: {
        id: `pat-${id}`,
        name: id,
        email: `${id}@x.com`,
        patientProfile:
          totalScore === null
            ? { questionnaire: null }
            : { questionnaire: { totalScore, isVulnerable: totalScore >= 5 } },
      },
      professional: { id: 'prof', name: 'Prof' },
      scheduledByManager: null,
      cancelledByManager: null,
    });

    it('keeps insertion order when not sorting by vulnerability', async () => {
      repository.findAllAppointmentsForManagerAndAdmin.mockResolvedValue([
        makeAppt('a', new Date('2026-01-01'), 2),
        makeAppt('b', new Date('2026-02-01'), 8),
      ]);

      const result = await service.listAppointments({} as any);

      expect(result.map((r) => r.id)).toEqual(['a', 'b']);
      expect(result[1].isVulnerable).toBe(true);
    });

    it('sorts by score descending and pushes null scores to the end', async () => {
      repository.findAllAppointmentsForManagerAndAdmin.mockResolvedValue([
        makeAppt('low', new Date('2026-01-01'), 2),
        makeAppt('none', new Date('2026-01-01'), null),
        makeAppt('high', new Date('2026-01-01'), 9),
      ]);

      const result = await service.listAppointments({
        sortBy: 'vulnerabilityScore',
        order: 'desc',
      } as any);

      expect(result.map((r) => r.id)).toEqual(['high', 'low', 'none']);
    });

    it('sorts ascending when order is asc', async () => {
      repository.findAllAppointmentsForManagerAndAdmin.mockResolvedValue([
        makeAppt('high', new Date('2026-01-01'), 9),
        makeAppt('low', new Date('2026-01-01'), 2),
      ]);

      const result = await service.listAppointments({
        sortBy: 'vulnerabilityScore',
        order: 'asc',
      } as any);

      expect(result.map((r) => r.id)).toEqual(['low', 'high']);
    });
  });

  describe('getProfessionalAvailability', () => {
    it('throws NotFound when the user is not a professional', async () => {
      repository.findProfessionalWithSpecialities.mockResolvedValue({
        role: UserRole.PATIENT,
      });

      await expect(
        service.getProfessionalAvailability('x'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('joins specialties and maps availability', async () => {
      repository.findProfessionalWithSpecialities.mockResolvedValue({
        id: 'prof-1',
        name: 'Dra. Ana',
        email: 'ana@x.com',
        role: UserRole.PROFESSIONAL,
        professionalProfile: {
          specialities: [{ name: 'Cardio' }, { name: 'Clínica' }],
        },
      });
      repository.findActiveAvailabilityByProfessionalId.mockResolvedValue([
        { dayOfWeek: 1, startTime: '09:00', endTime: '12:00' },
      ]);

      const result = await service.getProfessionalAvailability('prof-1');

      expect(result.professional.specialty).toBe('Cardio, Clínica');
      expect(result.availability).toHaveLength(1);
    });
  });
});
