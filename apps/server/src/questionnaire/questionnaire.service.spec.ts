import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import {
  PatientApprovalStatus,
  QuestionnaireAnsweredBy,
  UserRole,
} from '@prisma/client';
import { QuestionnaireRepository } from './questionnaire.repository';
import { QuestionnaireService } from './questionnaire.service';

describe('QuestionnaireService', () => {
  const repository = {
    findActiveQuestionnaire: jest.fn(),
    findResponseByPatientProfileId: jest.fn(),
    findResponseWithAnswersByPatientProfileId: jest.fn(),
    findPatientWithProfile: jest.fn(),
    persistResponse: jest.fn(),
  };

  let service: QuestionnaireService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new QuestionnaireService(
      repository as unknown as QuestionnaireRepository,
    );
  });

  // Questionário com 2 perguntas; opções com scores distintos.
  const makeActiveQuestionnaire = (vulnerabilityThreshold = 5) => ({
    id: 'questionnaire-1',
    vulnerabilityThreshold,
    questions: [
      {
        id: 'q1',
        label: 'Pergunta 1',
        order: 1,
        options: [
          { id: 'q1-a', label: 'Baixo', score: 1, order: 1 },
          { id: 'q1-b', label: 'Alto', score: 4, order: 2 },
        ],
      },
      {
        id: 'q2',
        label: 'Pergunta 2',
        order: 2,
        options: [
          { id: 'q2-a', label: 'Baixo', score: 0, order: 1 },
          { id: 'q2-b', label: 'Alto', score: 3, order: 2 },
        ],
      },
    ],
  });

  const makePersistedResponse = (
    overrides: Partial<{ totalScore: number; isVulnerable: boolean }> = {},
  ) => ({
    id: 'response-1',
    answeredBy: QuestionnaireAnsweredBy.PATIENT,
    answeredByUserId: 'patient-user-1',
    totalScore: overrides.totalScore ?? 0,
    isVulnerable: overrides.isVulnerable ?? false,
    responseDate: new Date('2026-06-14T00:00:00Z'),
    patientProfile: { userId: 'patient-user-1' },
    answers: [],
  });

  describe('getQuestions / toDefinition', () => {
    it('computes maxPossibleScore from the highest option score per question', async () => {
      repository.findActiveQuestionnaire.mockResolvedValue(
        makeActiveQuestionnaire(),
      );

      const definition = await service.getQuestions();

      // q1 max = 4, q2 max = 3 => 7
      expect(definition.maxPossibleScore).toBe(7);
      expect(definition.questions).toHaveLength(2);
    });

    it('throws NotFound when no questionnaire is configured', async () => {
      repository.findActiveQuestionnaire.mockResolvedValue(null);

      await expect(service.getQuestions()).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('submitSelf score & vulnerability', () => {
    const patientUserId = 'patient-user-1';

    beforeEach(() => {
      repository.findPatientWithProfile.mockResolvedValue({
        role: UserRole.PATIENT,
        patientProfile: { id: 'profile-1' },
      });
      repository.findResponseByPatientProfileId.mockResolvedValue(null);
      repository.findActiveQuestionnaire.mockResolvedValue(
        makeActiveQuestionnaire(5),
      );
    });

    it('sums option scores and flags vulnerable when score >= threshold', async () => {
      repository.persistResponse.mockResolvedValue(
        makePersistedResponse({ totalScore: 7, isVulnerable: true }),
      );

      await service.submitSelf(patientUserId, {
        answers: [
          { questionId: 'q1', optionId: 'q1-b' }, // 4
          { questionId: 'q2', optionId: 'q2-b' }, // 3
        ],
      } as any);

      expect(repository.persistResponse).toHaveBeenCalledWith(
        expect.objectContaining({ totalScore: 7, isVulnerable: true }),
      );
    });

    it('flags NOT vulnerable when score is below threshold', async () => {
      repository.persistResponse.mockResolvedValue(
        makePersistedResponse({ totalScore: 1, isVulnerable: false }),
      );

      await service.submitSelf(patientUserId, {
        answers: [
          { questionId: 'q1', optionId: 'q1-a' }, // 1
          { questionId: 'q2', optionId: 'q2-a' }, // 0
        ],
      } as any);

      expect(repository.persistResponse).toHaveBeenCalledWith(
        expect.objectContaining({ totalScore: 1, isVulnerable: false }),
      );
    });

    it('treats score exactly equal to threshold as vulnerable', async () => {
      repository.findActiveQuestionnaire.mockResolvedValue(
        makeActiveQuestionnaire(4),
      );
      repository.persistResponse.mockResolvedValue(
        makePersistedResponse({ totalScore: 4, isVulnerable: true }),
      );

      await service.submitSelf(patientUserId, {
        answers: [
          { questionId: 'q1', optionId: 'q1-b' }, // 4
          { questionId: 'q2', optionId: 'q2-a' }, // 0
        ],
      } as any);

      expect(repository.persistResponse).toHaveBeenCalledWith(
        expect.objectContaining({ totalScore: 4, isVulnerable: true }),
      );
    });

    it('keeps approval PENDING even when the patient is vulnerable', async () => {
      repository.persistResponse.mockResolvedValue(
        makePersistedResponse({ totalScore: 7, isVulnerable: true }),
      );

      await service.submitSelf(patientUserId, {
        answers: [
          { questionId: 'q1', optionId: 'q1-b' }, // 4
          { questionId: 'q2', optionId: 'q2-b' }, // 3
        ],
      } as any);

      expect(repository.persistResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          isVulnerable: true,
          approvalStatus: PatientApprovalStatus.PENDING,
        }),
      );
    });

    it('keeps approval PENDING when the patient is not vulnerable', async () => {
      repository.persistResponse.mockResolvedValue(
        makePersistedResponse({ totalScore: 1, isVulnerable: false }),
      );

      await service.submitSelf(patientUserId, {
        answers: [
          { questionId: 'q1', optionId: 'q1-a' }, // 1
          { questionId: 'q2', optionId: 'q2-a' }, // 0
        ],
      } as any);

      expect(repository.persistResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          isVulnerable: false,
          approvalStatus: PatientApprovalStatus.PENDING,
        }),
      );
    });
  });

  describe('submitSelf validation', () => {
    const patientUserId = 'patient-user-1';

    beforeEach(() => {
      repository.findPatientWithProfile.mockResolvedValue({
        role: UserRole.PATIENT,
        patientProfile: { id: 'profile-1' },
      });
      repository.findResponseByPatientProfileId.mockResolvedValue(null);
      repository.findActiveQuestionnaire.mockResolvedValue(
        makeActiveQuestionnaire(5),
      );
    });

    it('rejects when not all questions are answered', async () => {
      await expect(
        service.submitSelf(patientUserId, {
          answers: [{ questionId: 'q1', optionId: 'q1-a' }],
        } as any),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(repository.persistResponse).not.toHaveBeenCalled();
    });

    it('rejects when the same question is answered twice', async () => {
      await expect(
        service.submitSelf(patientUserId, {
          answers: [
            { questionId: 'q1', optionId: 'q1-a' },
            { questionId: 'q1', optionId: 'q1-b' },
          ],
        } as any),
      ).rejects.toThrow('respondida mais de uma vez');
    });

    it('rejects an option that does not belong to the question', async () => {
      await expect(
        service.submitSelf(patientUserId, {
          answers: [
            { questionId: 'q1', optionId: 'q2-a' }, // opção de outra pergunta
            { questionId: 'q2', optionId: 'q2-b' },
          ],
        } as any),
      ).rejects.toThrow('inválida');
    });

    it('rejects a question that is not part of the active questionnaire', async () => {
      await expect(
        service.submitSelf(patientUserId, {
          answers: [
            { questionId: 'q1', optionId: 'q1-a' },
            { questionId: 'unknown', optionId: 'q2-a' },
          ],
        } as any),
      ).rejects.toThrow('não pertence ao questionário ativo');
    });
  });

  describe('duplicate submission rules', () => {
    beforeEach(() => {
      repository.findPatientWithProfile.mockResolvedValue({
        role: UserRole.PATIENT,
        patientProfile: { id: 'profile-1' },
      });
      repository.findActiveQuestionnaire.mockResolvedValue(
        makeActiveQuestionnaire(5),
      );
    });

    it('rejects self-submission when a response already exists', async () => {
      repository.findResponseByPatientProfileId.mockResolvedValue({
        id: 'existing',
      });

      await expect(
        service.submitSelf('patient-user-1', { answers: [] } as any),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('rejects manager update when no response exists yet', async () => {
      repository.findResponseByPatientProfileId.mockResolvedValue(null);

      await expect(
        service.updateForManager('manager-1', 'patient-user-1', {
          answers: [],
        } as any),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('getPatientProfileByUserId guard', () => {
    it('throws NotFound when the user is not a patient', async () => {
      repository.findPatientWithProfile.mockResolvedValue({
        role: UserRole.PROFESSIONAL,
        patientProfile: { id: 'profile-1' },
      });

      await expect(
        service.getPatientResponse('not-a-patient'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
