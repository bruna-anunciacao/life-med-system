import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, QuestionnaireAnsweredBy, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  QuestionnaireDefinitionResponseDto,
  QuestionnaireResponseDto,
} from './dto/questionnaire-response.dto';
import { SubmitQuestionnaireDto } from './dto/submit-questionnaire.dto';

type QuestionnaireWithSchema = Prisma.QuestionnaireGetPayload<{
  include: {
    questions: {
      include: { options: true };
    };
  };
}>;

type ResponseWithAnswers = Prisma.VulnerabilityQuestionnaireGetPayload<{
  include: {
    patientProfile: { include: { user: true } };
    answers: {
      include: { question: true; option: true };
    };
  };
}>;

@Injectable()
export class QuestionnaireService {
  constructor(private readonly prisma: PrismaService) {}

  async getActiveQuestionnaire(): Promise<QuestionnaireWithSchema> {
    const questionnaire = await this.prisma.questionnaire.findFirst({
      include: {
        questions: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
          include: {
            options: {
              where: { isActive: true },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
      orderBy: { id: 'asc' },
    });

    if (!questionnaire) {
      throw new NotFoundException('Questionário não configurado.');
    }

    return questionnaire;
  }

  async getQuestions(): Promise<QuestionnaireDefinitionResponseDto> {
    const q = await this.getActiveQuestionnaire();
    return this.toDefinition(q);
  }

  toDefinition(q: QuestionnaireWithSchema): QuestionnaireDefinitionResponseDto {
    const maxPossibleScore = q.questions.reduce((sum, question) => {
      const max = question.options.reduce(
        (m, opt) => (opt.score > m ? opt.score : m),
        0,
      );
      return sum + max;
    }, 0);

    return {
      id: q.id,
      vulnerabilityThreshold: q.vulnerabilityThreshold,
      maxPossibleScore,
      questions: q.questions.map((question) => ({
        id: question.id,
        label: question.label,
        order: question.order,
        options: question.options.map((opt) => ({
          id: opt.id,
          label: opt.label,
          score: opt.score,
          order: opt.order,
        })),
      })),
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

    return this.persistResponse({
      dto,
      answeredBy: QuestionnaireAnsweredBy.PATIENT,
      answeredByUserId: patientUserId,
      patientProfileId: patientProfile.id,
    });
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

    return this.persistResponse({
      dto,
      answeredBy: QuestionnaireAnsweredBy.MANAGER,
      answeredByUserId: managerUserId,
      patientProfileId: patientProfile.id,
    });
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

    return this.persistResponse({
      dto,
      answeredBy: QuestionnaireAnsweredBy.MANAGER,
      answeredByUserId: managerUserId,
      patientProfileId: patientProfile.id,
      replaceExistingId: existing.id,
    });
  }

  async getPatientResponse(
    patientUserId: string,
  ): Promise<QuestionnaireResponseDto | null> {
    const patientProfile = await this.getPatientProfileByUserId(patientUserId);
    const response = await this.prisma.vulnerabilityQuestionnaire.findUnique({
      where: { patientProfileId: patientProfile.id },
      include: {
        patientProfile: { include: { user: true } },
        answers: { include: { question: true, option: true } },
      },
    });

    if (!response) return null;
    return this.mapResponse(response);
  }

  private async persistResponse(params: {
    dto: SubmitQuestionnaireDto;
    answeredBy: QuestionnaireAnsweredBy;
    answeredByUserId: string;
    patientProfileId: string;
    replaceExistingId?: string;
  }): Promise<QuestionnaireResponseDto> {
    const {
      dto,
      answeredBy,
      answeredByUserId,
      patientProfileId,
      replaceExistingId,
    } = params;

    const active = await this.getActiveQuestionnaire();
    const questionsById = new Map(active.questions.map((q) => [q.id, q]));
    if (dto.answers.length !== active.questions.length) {
      throw new BadRequestException(
        'É necessário responder todas as perguntas ativas.',
      );
    }

    const answeredQuestionIds = new Set<string>();
    let totalScore = 0;

    for (const answer of dto.answers) {
      if (answeredQuestionIds.has(answer.questionId)) {
        throw new BadRequestException(
          `Pergunta ${answer.questionId} respondida mais de uma vez.`,
        );
      }
      answeredQuestionIds.add(answer.questionId);

      const question = questionsById.get(answer.questionId);
      if (!question) {
        throw new BadRequestException(
          `Pergunta ${answer.questionId} não pertence ao questionário ativo.`,
        );
      }
      const option = question.options.find((o) => o.id === answer.optionId);
      if (!option) {
        throw new BadRequestException(
          `Opção ${answer.optionId} inválida para a pergunta "${question.label}".`,
        );
      }
      totalScore += option.score;
    }

    for (const question of active.questions) {
      if (!answeredQuestionIds.has(question.id)) {
        throw new BadRequestException(
          `Pergunta "${question.label}" não foi respondida.`,
        );
      }
    }

    const isVulnerable = totalScore >= active.vulnerabilityThreshold;

    const created = await this.prisma.$transaction(async (tx) => {
      if (replaceExistingId) {
        await tx.questionnaireAnswer.deleteMany({
          where: { vulnerabilityQuestionnaireId: replaceExistingId },
        });
        await tx.vulnerabilityQuestionnaire.delete({
          where: { id: replaceExistingId },
        });
      }

      const response = await tx.vulnerabilityQuestionnaire.create({
        data: {
          patientProfileId,
          questionnaireId: active.id,
          answeredBy,
          answeredByUserId,
          totalScore,
          isVulnerable,
          responseDate: new Date(),
          answers: {
            create: dto.answers.map((a) => ({
              questionId: a.questionId,
              optionId: a.optionId,
            })),
          },
        },
        include: {
          patientProfile: { include: { user: true } },
          answers: { include: { question: true, option: true } },
        },
      });

      await tx.patientProfile.update({
        where: { id: patientProfileId },
        data: { questionnaireCompleted: true },
      });

      return response;
    });

    return this.mapResponse(created);
  }

  private async getPatientProfileByUserId(patientUserId: string) {
    const patient = await this.prisma.user.findUnique({
      where: { id: patientUserId },
      include: { patientProfile: true },
    });

    if (
      !patient ||
      patient.role !== UserRole.PATIENT ||
      !patient.patientProfile
    ) {
      throw new NotFoundException('Paciente não encontrado.');
    }

    return patient.patientProfile;
  }

  private mapResponse(
    response: ResponseWithAnswers,
  ): QuestionnaireResponseDto {
    return {
      id: response.id,
      patientId: response.patientProfile.userId,
      answeredBy: response.answeredBy,
      answeredByUserId: response.answeredByUserId,
      totalScore: response.totalScore,
      isVulnerable: response.isVulnerable,
      responseDate: response.responseDate,
      answers: response.answers.map((a) => ({
        questionId: a.questionId,
        questionLabel: a.question.label,
        optionId: a.optionId,
        optionLabel: a.option.label,
        score: a.option.score,
      })),
    };
  }
}
