import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { AppointmentStatus, Prisma, UserRole } from '@prisma/client';
import { MedicalRecordPdfService } from './medical-record-pdf.service';
import { MedicalRecordsRepository } from './medical-records.repository';
import { MedicalRecordsService } from './medical-records.service';

describe('MedicalRecordsService', () => {
  const repository = {
    findAppointmentById: jest.fn(),
    createForAppointment: jest.fn(),
    findByAppointmentId: jest.fn(),
    findById: jest.fn(),
    listForRequester: jest.fn(),
    findByPatient: jest.fn(),
    updateRecord: jest.fn(),
    findPatientPdfRecordByAppointment: jest.fn(),
    hasValidPriorAppointment: jest.fn(),
  };
  const pdfService = { generate: jest.fn() };

  let service: MedicalRecordsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new MedicalRecordsService(
      repository as unknown as MedicalRecordsRepository,
      pdfService as unknown as MedicalRecordPdfService,
    );
  });

  const makeRecord = (overrides: Record<string, unknown> = {}) => ({
    id: 'rec-1',
    appointmentId: 'appt-1',
    patientId: 'patient-1',
    authorId: 'prof-1',
    chiefComplaint: 'Dor',
    diagnosis: 'Dx',
    treatmentPlan: 'Plano',
    prescriptions: 'Rx',
    internalNotes: 'Notas internas',
    createdAt: new Date(),
    updatedAt: new Date(),
    author: { id: 'prof-1', name: 'Dra. Ana', email: 'ana@lifemed.com' },
    patient: { id: 'patient-1', name: 'João' },
    appointment: { id: 'appt-1', dateTime: new Date(), modality: 'IN_PERSON' },
    ...overrides,
  });

  describe('create', () => {
    it('throws NotFound when the appointment does not exist', async () => {
      repository.findAppointmentById.mockResolvedValue(null);

      await expect(
        service.create('prof-1', { appointmentId: 'x' } as any),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('forbids creating a record for an appointment of another professional', async () => {
      repository.findAppointmentById.mockResolvedValue({
        professionalId: 'other-prof',
        patientId: 'patient-1',
      });

      await expect(
        service.create('prof-1', { appointmentId: 'appt-1' } as any),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('maps a Prisma P2002 unique violation to a Conflict', async () => {
      repository.findAppointmentById.mockResolvedValue({
        professionalId: 'prof-1',
        patientId: 'patient-1',
      });
      repository.createForAppointment.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('dup', {
          code: 'P2002',
          clientVersion: 'test',
        }),
      );

      await expect(
        service.create('prof-1', { appointmentId: 'appt-1' } as any),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('creates and returns the record for the responsible professional', async () => {
      repository.findAppointmentById.mockResolvedValue({
        professionalId: 'prof-1',
        patientId: 'patient-1',
      });
      repository.createForAppointment.mockResolvedValue(makeRecord());

      const result = await service.create('prof-1', {
        appointmentId: 'appt-1',
      } as any);

      expect(result.id).toBe('rec-1');
    });
  });

  describe('findById authorization (patient access to health data)', () => {
    it('forbids a role that is neither professional nor patient', async () => {
      await expect(
        service.findById('rec-1', 'admin-1', UserRole.ADMIN),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it("forbids a patient from reading another patient's record", async () => {
      repository.findById.mockResolvedValue(
        makeRecord({ patientId: 'someone-else' }),
      );

      await expect(
        service.findById('rec-1', 'patient-1', UserRole.PATIENT),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('lets a patient read their own record (without internalNotes)', async () => {
      repository.findById.mockResolvedValue(
        makeRecord({ patientId: 'patient-1' }),
      );

      const result = (await service.findById(
        'rec-1',
        'patient-1',
        UserRole.PATIENT,
      )) as any;

      expect(result.id).toBe('rec-1');
      expect(result.internalNotes).toBeUndefined();
    });

    it('lets the author professional read the record (with internalNotes)', async () => {
      repository.findById.mockResolvedValue(makeRecord({ authorId: 'prof-1' }));

      const result = (await service.findById(
        'rec-1',
        'prof-1',
        UserRole.PROFESSIONAL,
      )) as any;

      expect(result.internalNotes).toBe('Notas internas');
    });

    it('forbids a non-author professional without a prior appointment link', async () => {
      repository.findById.mockResolvedValue(makeRecord({ authorId: 'other' }));
      repository.hasValidPriorAppointment.mockResolvedValue(false);

      await expect(
        service.findById('rec-1', 'prof-2', UserRole.PROFESSIONAL),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('lets a non-author professional read when there is a prior appointment link', async () => {
      repository.findById.mockResolvedValue(makeRecord({ authorId: 'other' }));
      repository.hasValidPriorAppointment.mockResolvedValue(true);

      const result = await service.findById(
        'rec-1',
        'prof-2',
        UserRole.PROFESSIONAL,
      );

      expect(result.id).toBe('rec-1');
    });
  });

  describe('list', () => {
    it('forbids a professional from filtering by another author', async () => {
      await expect(
        service.list('prof-1', UserRole.PROFESSIONAL, {
          authorId: 'other-prof',
        } as any),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('update', () => {
    it('forbids editing a record the requester did not author', async () => {
      repository.findById.mockResolvedValue(makeRecord({ authorId: 'someone' }));

      await expect(
        service.update('rec-1', 'prof-1', {} as any),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('generatePatientPdf', () => {
    it("forbids generating a PDF for another patient's record", async () => {
      repository.findPatientPdfRecordByAppointment.mockResolvedValue({
        patientId: 'someone-else',
      });

      await expect(
        service.generatePatientPdf('appt-1', 'patient-1'),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  // Garante que o status de vínculo usado é CONFIRMED/COMPLETED.
  describe('findByPatient link check', () => {
    it('forbids when there is no valid prior appointment', async () => {
      repository.hasValidPriorAppointment.mockResolvedValue(false);

      await expect(
        service.findByPatient('patient-1', 'prof-1'),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(repository.hasValidPriorAppointment).toHaveBeenCalledWith(
        'prof-1',
        'patient-1',
        [AppointmentStatus.CONFIRMED, AppointmentStatus.COMPLETED],
      );
    });
  });
});
