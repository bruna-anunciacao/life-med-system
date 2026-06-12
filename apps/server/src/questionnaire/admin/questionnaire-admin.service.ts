import { Injectable } from '@nestjs/common';
import { QuestionnaireAdminRepository } from './questionnaire-admin.repository';
import { QuestionnaireService } from '../questionnaire.service';
import {
  CreateOptionDto,
  CreateQuestionDto,
  UpdateOptionDto,
  UpdateQuestionDto,
  UpdateQuestionnaireDto,
} from './dto/admin-questionnaire.dto';

@Injectable()
export class QuestionnaireAdminService {
  constructor(
    private readonly repository: QuestionnaireAdminRepository,
    private readonly questionnaireService: QuestionnaireService,
  ) {}

  async getActive() {
    const questionnaire =
      await this.questionnaireService.getActiveQuestionnaire();
    return this.questionnaireService.toDefinition(questionnaire);
  }

  async updateQuestionnaire(id: string, dto: UpdateQuestionnaireDto) {
    const questionnaire = await this.repository.updateQuestionnaire(id, dto);
    return this.questionnaireService.toDefinition(questionnaire);
  }

  async createQuestion(questionnaireId: string, dto: CreateQuestionDto) {
    const questionnaire = await this.repository.createQuestion(
      questionnaireId,
      dto,
    );
    return this.questionnaireService.toDefinition(questionnaire);
  }

  async updateQuestion(
    questionnaireId: string,
    questionId: string,
    dto: UpdateQuestionDto,
  ) {
    const questionnaire = await this.repository.updateQuestion(
      questionnaireId,
      questionId,
      dto,
    );
    return this.questionnaireService.toDefinition(questionnaire);
  }

  async deleteQuestion(questionnaireId: string, questionId: string) {
    const questionnaire = await this.repository.deleteQuestion(
      questionnaireId,
      questionId,
    );
    return this.questionnaireService.toDefinition(questionnaire);
  }

  async createOption(
    questionnaireId: string,
    questionId: string,
    dto: CreateOptionDto,
  ) {
    const questionnaire = await this.repository.createOption(
      questionnaireId,
      questionId,
      dto,
    );
    return this.questionnaireService.toDefinition(questionnaire);
  }

  async updateOption(
    questionnaireId: string,
    optionId: string,
    dto: UpdateOptionDto,
  ) {
    const questionnaire = await this.repository.updateOption(
      questionnaireId,
      optionId,
      dto,
    );
    return this.questionnaireService.toDefinition(questionnaire);
  }

  async deleteOption(questionnaireId: string, optionId: string) {
    const questionnaire = await this.repository.deleteOption(
      questionnaireId,
      optionId,
    );
    return this.questionnaireService.toDefinition(questionnaire);
  }
}
