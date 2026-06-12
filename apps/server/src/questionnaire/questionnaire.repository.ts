import { Injectable } from '@nestjs/common';
import { Prisma, QuestionnaireAnsweredBy } from '@prisma/client';
import { SubmitQuestionnaireDto } from './dto/submit-questionnaire.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuestionnaireRepository {
  constructor(private readonly prisma: PrismaService) {}

  findActiveQuestionnaire() {
    return this.prisma.questionnaire.findFirst({
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
  }

  findResponseByPatientProfileId(patientProfileId: string) {
    return this.prisma.vulnerabilityQuestionnaire.findUnique({
      where: { patientProfileId },
    });
  }

  findResponseWithAnswersByPatientProfileId(patientProfileId: string) {
    return this.prisma.vulnerabilityQuestionnaire.findUnique({
      where: { patientProfileId },
      include: {
        patientProfile: { include: { user: true } },
        answers: { include: { question: true, option: true } },
      },
    });
  }

  findPatientWithProfile(patientUserId: string) {
    return this.prisma.user.findUnique({
      where: { id: patientUserId },
      include: { patientProfile: true },
    });
  }

  persistResponse(params: {
    dto: SubmitQuestionnaireDto;
    questionnaireId: string;
    answeredBy: QuestionnaireAnsweredBy;
    answeredByUserId: string;
    patientProfileId: string;
    totalScore: number;
    isVulnerable: boolean;
    replaceExistingId?: string;
  }) {
    const {
      dto,
      questionnaireId,
      answeredBy,
      answeredByUserId,
      patientProfileId,
      totalScore,
      isVulnerable,
      replaceExistingId,
    } = params;

    return this.prisma.$transaction(async (tx) => {
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
          questionnaireId,
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
  }
}
