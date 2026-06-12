import { Injectable } from '@nestjs/common';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  CreateOptionDto,
  CreateQuestionDto,
  UpdateOptionDto,
  UpdateQuestionDto,
  UpdateQuestionnaireDto,
} from './dto/admin-questionnaire.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class QuestionnaireAdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  updateQuestionnaire(id: string, dto: UpdateQuestionnaireDto) {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.questionnaire.findUnique({ where: { id } });
      if (!current) throw new NotFoundException('Questionário não encontrado.');

      if (dto.vulnerabilityThreshold !== undefined) {
        await tx.questionnaire.update({
          where: { id },
          data: { vulnerabilityThreshold: dto.vulnerabilityThreshold },
        });
      }
      await this.applyChange(tx, id);
      return this.fetchDefinition(tx, id);
    });
  }

  createQuestion(questionnaireId: string, dto: CreateQuestionDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.ensureQuestionnaireExists(tx, questionnaireId);
      await tx.question.create({
        data: {
          questionnaireId,
          label: dto.label,
          order: dto.order,
          options: {
            create: dto.options.map((opt) => ({
              label: opt.label,
              score: opt.score,
              order: opt.order,
            })),
          },
        },
      });
      await this.applyChange(tx, questionnaireId);
      return this.fetchDefinition(tx, questionnaireId);
    });
  }

  updateQuestion(
    questionnaireId: string,
    questionId: string,
    dto: UpdateQuestionDto,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const question = await tx.question.findFirst({
        where: { id: questionId, questionnaireId },
      });
      if (!question) {
        throw new NotFoundException('Pergunta não encontrada.');
      }
      await tx.question.update({
        where: { id: questionId },
        data: {
          label: dto.label,
          order: dto.order,
          isActive: dto.isActive,
        },
      });
      await this.applyChange(tx, questionnaireId);
      return this.fetchDefinition(tx, questionnaireId);
    });
  }

  deleteQuestion(questionnaireId: string, questionId: string) {
    return this.prisma.$transaction(async (tx) => {
      const question = await tx.question.findFirst({
        where: { id: questionId, questionnaireId },
      });
      if (!question) {
        throw new NotFoundException('Pergunta não encontrada.');
      }
      await tx.question.update({
        where: { id: questionId },
        data: { isActive: false },
      });
      await this.applyChange(tx, questionnaireId);
      return this.fetchDefinition(tx, questionnaireId);
    });
  }

  createOption(
    questionnaireId: string,
    questionId: string,
    dto: CreateOptionDto,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const question = await tx.question.findFirst({
        where: { id: questionId, questionnaireId },
      });
      if (!question) {
        throw new NotFoundException('Pergunta não encontrada.');
      }
      await tx.questionOption.create({
        data: {
          questionId,
          label: dto.label,
          score: dto.score,
          order: dto.order,
        },
      });
      await this.applyChange(tx, questionnaireId);
      return this.fetchDefinition(tx, questionnaireId);
    });
  }

  updateOption(
    questionnaireId: string,
    optionId: string,
    dto: UpdateOptionDto,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const option = await tx.questionOption.findUnique({
        where: { id: optionId },
        include: { question: true },
      });
      if (!option || option.question.questionnaireId !== questionnaireId) {
        throw new NotFoundException('Opção não encontrada.');
      }
      await tx.questionOption.update({
        where: { id: optionId },
        data: {
          label: dto.label,
          score: dto.score,
          order: dto.order,
          isActive: dto.isActive,
        },
      });
      await this.applyChange(tx, questionnaireId);
      return this.fetchDefinition(tx, questionnaireId);
    });
  }

  deleteOption(questionnaireId: string, optionId: string) {
    return this.prisma.$transaction(async (tx) => {
      const option = await tx.questionOption.findUnique({
        where: { id: optionId },
        include: { question: true },
      });
      if (!option || option.question.questionnaireId !== questionnaireId) {
        throw new NotFoundException('Opção não encontrada.');
      }
      await tx.questionOption.update({
        where: { id: optionId },
        data: { isActive: false },
      });
      await this.applyChange(tx, questionnaireId);
      return this.fetchDefinition(tx, questionnaireId);
    });
  }

  private async ensureQuestionnaireExists(
    tx: Prisma.TransactionClient,
    id: string,
  ) {
    const exists = await tx.questionnaire.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Questionário não encontrado.');
  }

  private async applyChange(
    tx: Prisma.TransactionClient,
    questionnaireId: string,
  ) {
    const questionnaire = await tx.questionnaire.findUnique({
      where: { id: questionnaireId },
      include: {
        questions: {
          where: { isActive: true },
          include: { options: { where: { isActive: true } } },
        },
      },
    });
    if (!questionnaire) {
      throw new NotFoundException('Questionário não encontrado.');
    }

    if (questionnaire.questions.length === 0) {
      throw new BadRequestException(
        'Questionário precisa ter ao menos uma pergunta ativa.',
      );
    }

    let maxPossibleScore = 0;
    for (const question of questionnaire.questions) {
      if (question.options.length < 2) {
        throw new BadRequestException(
          `A pergunta "${question.label}" precisa de pelo menos 2 opções ativas.`,
        );
      }
      const maxOpt = question.options.reduce(
        (m, o) => (o.score > m ? o.score : m),
        0,
      );
      maxPossibleScore += maxOpt;
    }

    if (
      questionnaire.vulnerabilityThreshold < 1 ||
      questionnaire.vulnerabilityThreshold > maxPossibleScore
    ) {
      throw new BadRequestException(
        `Limiar de vulnerabilidade (${questionnaire.vulnerabilityThreshold}) precisa estar entre 1 e ${maxPossibleScore}.`,
      );
    }

    const responses = await tx.vulnerabilityQuestionnaire.findMany({
      where: { questionnaireId },
      select: { patientProfileId: true },
    });
    if (responses.length > 0) {
      await tx.patientProfile.updateMany({
        where: {
          id: { in: responses.map((r) => r.patientProfileId) },
        },
        data: { questionnaireCompleted: false },
      });
    }

    await tx.questionnaire.update({
      where: { id: questionnaireId },
      data: { updatedAt: new Date() },
    });
  }

  private async fetchDefinition(tx: Prisma.TransactionClient, id: string) {
    const questionnaire = await tx.questionnaire.findUnique({
      where: { id },
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
    });
    if (!questionnaire) {
      throw new NotFoundException('Questionário não encontrado.');
    }
    return questionnaire;
  }
}
