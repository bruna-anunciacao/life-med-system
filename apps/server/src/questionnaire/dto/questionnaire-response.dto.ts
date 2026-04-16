import { ApiProperty } from '@nestjs/swagger';
import { QuestionnaireAnsweredBy } from '@prisma/client';
import {
  DependentsBracket,
  FamilyIncomeBracket,
} from './submit-questionnaire.dto';

class QuestionnaireAnswersDto {
  @ApiProperty({ enum: FamilyIncomeBracket })
  familyIncomeBracket!: FamilyIncomeBracket;

  @ApiProperty({ enum: DependentsBracket })
  dependentsBracket!: DependentsBracket;

  @ApiProperty()
  hasUnemployedFamilyMember!: boolean;

  @ApiProperty()
  hasCadUnico!: boolean;

  @ApiProperty()
  ownsHome!: boolean;

  @ApiProperty()
  hasPipedWater!: boolean;

  @ApiProperty()
  hasBasicSanitation!: boolean;
}

class QuestionnaireOptionDto {
  @ApiProperty()
  value!: string;

  @ApiProperty()
  label!: string;
}

class QuestionnaireQuestionDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  label!: string;

  @ApiProperty({ enum: ['select', 'boolean'] })
  type!: 'select' | 'boolean';

  @ApiProperty({ type: [QuestionnaireOptionDto] })
  options!: QuestionnaireOptionDto[];
}

export class QuestionnaireDefinitionResponseDto {
  @ApiProperty({ type: [QuestionnaireQuestionDto] })
  questions!: QuestionnaireQuestionDto[];

  @ApiProperty()
  vulnerabilityThreshold!: number;
}

export class QuestionnaireResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  patientId!: string;

  @ApiProperty({ enum: QuestionnaireAnsweredBy })
  answeredBy!: QuestionnaireAnsweredBy;

  @ApiProperty()
  answeredByUserId!: string;

  @ApiProperty()
  totalScore!: number;

  @ApiProperty()
  isVulnerable!: boolean;

  @ApiProperty()
  responseDate!: Date;

  @ApiProperty({ type: QuestionnaireAnswersDto })
  responses!: QuestionnaireAnswersDto;
}
