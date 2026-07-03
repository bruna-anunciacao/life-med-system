import { AppointmentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AppointmentsRepository } from './appointments.repository';

describe('AppointmentsRepository', () => {
  const appointmentDate = new Date('2026-06-15T09:00:00');
  const dto = {
    patientId: 'pat-1',
    professionalId: 'prof-1',
    dateTime: '2026-06-15T09:00:00',
    notes: 'Consulta assistida',
  };

  function setupTransaction(professionalProfile: { modality: string } | null) {
    const tx = {
      user: {
        findUnique: jest.fn(({ where }: { where: { id: string } }) => {
          if (where.id === 'pat-1') {
            return Promise.resolve({ id: 'pat-1', name: 'João' });
          }
          if (where.id === 'prof-1') {
            return Promise.resolve({
              id: 'prof-1',
              name: 'Dra. Ana',
              professionalProfile,
            });
          }
          return Promise.resolve(null);
        }),
      },
      managerProfile: {
        findUnique: jest.fn().mockResolvedValue({ id: 'manager-profile-1' }),
      },
      availability: {
        findFirst: jest.fn().mockResolvedValue({
          startTime: '08:00',
          endTime: '18:00',
        }),
      },
      scheduleBlock: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      appointment: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn(({ data }) =>
          Promise.resolve({
            id: 'appt-1',
            ...data,
            createdAt: new Date('2026-06-01T00:00:00'),
            patient: { id: data.patientId },
            professional: { id: data.professionalId, professionalProfile },
          }),
        ),
      },
    };
    const prisma = {
      $transaction: jest.fn((callback) => callback(tx)),
    };

    return {
      repository: new AppointmentsRepository(
        prisma as unknown as PrismaService,
      ),
      tx,
    };
  }

  it('uses the professional profile modality when manager creates an appointment', async () => {
    const { repository, tx } = setupTransaction({ modality: 'HOME_VISIT' });

    await repository.createAppointmentByManager(
      'manager-user-1',
      dto,
      appointmentDate,
    );

    expect(tx.appointment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          patientId: 'pat-1',
          professionalId: 'prof-1',
          scheduledByManagerId: 'manager-profile-1',
          status: AppointmentStatus.PENDING,
          modality: 'HOME_VISIT',
        }),
      }),
    );
  });

  it('falls back to virtual modality when the professional has no profile modality', async () => {
    const { repository, tx } = setupTransaction(null);

    await repository.createAppointmentByManager(
      'manager-user-1',
      dto,
      appointmentDate,
    );

    expect(tx.appointment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          scheduledByManagerId: 'manager-profile-1',
          modality: 'VIRTUAL',
        }),
      }),
    );
  });
});
