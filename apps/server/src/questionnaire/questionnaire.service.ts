import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, QuestionnaireAnsweredBy, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { QuestionnaireDefinitionResponseDto } from './dto/questionnaire-response.dto';
import {
  DependentsBracket,
  FamilyIncomeBracket,
  SubmitQuestionnaireDto,
} from './dto/submit-questionnaire.dto';

const VULNERABILITY_THRESHOLD = 6;

const SCORE_MAP = {
  familyIncomeBracket: {
    [FamilyIncomeBracket.ATE_1_SM]: 3,
    [FamilyIncomeBracket.ENTRE_1_E_2_SM]: 2,
    [FamilyIncomeBracket.ENTRE_2_E_3_SM]: 1,
    [FamilyIncomeBracket.ACIMA_3_SM]: 0,
  },
  dependentsBracket: {
    [DependentsBracket.ATE_2]: 0,
    [DependentsBracket.TRES_OU_MAIS]: 1,
  },
} as const;

type QuestionnaireRecord = Prisma.VulnerabilityQuestionnaireGetPayload<{
  include: {
    patientProfile: {
      include: {
        user: true;
      };
    };
  };
}>;

@Injectable()
export class QuestionnaireService {
  constructor(private readonly prisma: PrismaService) {}

  getQuestions(): QuestionnaireDefinitionResponseDto {
    return {
      vulnerabilityThreshold: VULNERABILITY_THRESHOLD,
      questions: [
        {
          id: 'familyIncomeBracket',
          label: 'Qual é a renda mensal da família?',
          type: 'select',
          options: [
            { value: FamilyIncomeBracket.ATE_1_SM, label: 'Até 1 salário mínimo' },
            {
              value: FamilyIncomeBracket.ENTRE_1_E_2_SM,
              label: 'Entre 1 e 2 salários mínimos',
            },
            {
              value: FamilyIncomeBracket.ENTRE_2_E_3_SM,
              label: 'Entre 2 e 3 salários mínimos',
            },
            {
              value: FamilyIncomeBracket.ACIMA_3_SM,
              label: 'Acima de 3 salários mínimos',
            },
          ],
        },
        {
          id: 'dependentsBracket',
          label: 'Quantas pessoas dependem dessa renda?',
          type: 'select',
          options: [
            { value: DependentsBracket.ATE_2, label: 'Até 2 pessoas' },
            { value: DependentsBracket.TRES_OU_MAIS, label: '3 ou mais pessoas' },
          ],
        },
        {
          id: 'hasUnemployedFamilyMember',
          label: 'Você ou alguém da família está desempregado?',
          type: 'boolean',
          options: [
            { value: 'true', label: 'Sim' },
            { value: 'false', label: 'Não' },
          ],
        },
        {
          id: 'hasCadUnico',
          label: 'Possui CadUnico?',
          type: 'boolean',
          options: [
            { value: 'true', label: 'Sim' },
            { value: 'false', label: 'Não' },
          ],
        },
        {
          id: 'ownsHome',
          label: 'Sua moradia é própria?',
          type: 'boolean',
          options: [
            { value: 'true', label: 'Sim' },
            { value: 'false', label: 'Não' },
          ],
        },
        {
          id: 'hasPipedWater',
          label: 'A casa possui água encanada?',
          type: 'boolean',
          options: [
            { value: 'true', label: 'Sim' },
            { value: 'false', label: 'Não' },
          ],
        },
        {
          id: 'hasBasicSanitation',
          label: 'Há saneamento básico (esgoto)?',
          type: 'boolean',
          options: [
            { value: 'true', label: 'Sim' },
            { value: 'false', label: 'Não' },
          ],
        },
      ],
    };
  }

  async submitSelf(patientUserId: string, dto: SubmitQuestionnaireDto) {
    const patientProfile = await this.getPatientProfileByUserId(patientUserId);

    const existing = await this.prisma.vulnerabilityQuestionnaire.findUnique({
      where: { patientProfileId: patientProfile.id },
    });

    if (existing) {
      throw new ConflictException(
        'Questionário já foi respondido. Solicite a atualização a um gestor.',
      );
    }

    const payload = this.buildPersistencePayload(
      dto,
      QuestionnaireAnsweredBy.PATIENT,
      patientUserId,
      patientProfile.id,
    );

    const questionnaire = await this.prisma.$transaction(async (tx) => {
      const created = await tx.vulnerabilityQuestionnaire.create({
        data: payload,
        include: {
          patientProfile: {
            include: {
              user: true,
            },
          },
        },
      });

      await tx.patientProfile.update({
        where: { id: patientProfile.id },
        data: { questionnaireCompleted: true },
      });

      return created;
    });

    return this.mapResponse(questionnaire);
  }

  async submitForManager(
    managerUserId: string,
    patientUserId: string,
    dto: SubmitQuestionnaireDto,
  ) {
    const patientProfile = await this.getPatientProfileByUserId(patientUserId);

    const existing = await this.prisma.vulnerabilityQuestionnaire.findUnique({
      where: { patientProfileId: patientProfile.id },
    });

    if (existing) {
      throw new ConflictException(
        'Questionário já existe para este paciente. Use a rota de atualização.',
      );
    }

    const payload = this.buildPersistencePayload(
      dto,
      QuestionnaireAnsweredBy.MANAGER,
      managerUserId,
      patientProfile.id,
    );

    const questionnaire = await this.prisma.$transaction(async (tx) => {
      const created = await tx.vulnerabilityQuestionnaire.create({
        data: payload,
        include: {
          patientProfile: {
            include: {
              user: true,
            },
          },
        },
      });

      await tx.patientProfile.update({
        where: { id: patientProfile.id },
        data: { questionnaireCompleted: true },
      });

      return created;
    });

    return this.mapResponse(questionnaire);
  }

  async updateForManager(
    managerUserId: string,
    patientUserId: string,
    dto: SubmitQuestionnaireDto,
  ) {
    const patientProfile = await this.getPatientProfileByUserId(patientUserId);
    const existing = await this.prisma.vulnerabilityQuestionnaire.findUnique({
      where: { patientProfileId: patientProfile.id },
    });

    if (!existing) {
      throw new NotFoundException(
        'Questionário não encontrado para este paciente.',
      );
    }

    const payload = this.buildPersistencePayload(
      dto,
      QuestionnaireAnsweredBy.MANAGER,
      managerUserId,
      patientProfile.id,
    );

    const questionnaire = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.vulnerabilityQuestionnaire.update({
        where: { patientProfileId: patientProfile.id },
        data: payload,
        include: {
          patientProfile: {
            include: {
              user: true,
            },
          },
        },
      });

      await tx.patientProfile.update({
        where: { id: patientProfile.id },
        data: { questionnaireCompleted: true },
      });

      return updated;
    });

    return this.mapResponse(questionnaire);
  }

  private async getPatientProfileByUserId(patientUserId: string) {
    const patient = await this.prisma.user.findUnique({
      where: { id: patientUserId },
      include: {
        patientProfile: true,
      },
    });

    if (!patient || patient.role !== UserRole.PATIENT || !patient.patientProfile) {
      throw new NotFoundException('Paciente não encontrado.');
    }

    return patient.patientProfile;
  }

  private buildPersistencePayload(
    dto: SubmitQuestionnaireDto,
    answeredBy: QuestionnaireAnsweredBy,
    answeredByUserId: string,
    patientProfileId: string,
  ): Prisma.VulnerabilityQuestionnaireUncheckedCreateInput {
    const totalScore = this.calculateTotalScore(dto);

    return {
      patientProfileId,
      answeredBy,
      answeredByUserId,
      totalScore,
      isVulnerable: totalScore >= VULNERABILITY_THRESHOLD,
      responseDate: new Date(),
      responses: dto as unknown as Prisma.InputJsonValue,
    };
  }

  private calculateTotalScore(dto: SubmitQuestionnaireDto) {
    return (
      SCORE_MAP.familyIncomeBracket[dto.familyIncomeBracket] +
      SCORE_MAP.dependentsBracket[dto.dependentsBracket] +
      (dto.hasUnemployedFamilyMember ? 2 : 0) +
      (dto.hasCadUnico ? 4 : 0) +
      (dto.ownsHome ? 0 : 1) +
      (dto.hasPipedWater ? 0 : 1) +
      (dto.hasBasicSanitation ? 0 : 1)
    );
  }

  private mapResponse(questionnaire: QuestionnaireRecord) {
    return {
      id: questionnaire.id,
      patientId: questionnaire.patientProfile.userId,
      answeredBy: questionnaire.answeredBy,
      answeredByUserId: questionnaire.answeredByUserId,
      totalScore: questionnaire.totalScore,
      isVulnerable: questionnaire.isVulnerable,
      responseDate: questionnaire.responseDate,
      responses: questionnaire.responses as unknown as SubmitQuestionnaireDto,
    };
  }
}
