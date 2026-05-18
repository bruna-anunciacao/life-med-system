import { ApiProperty } from '@nestjs/swagger';
import { QuestionnaireAnsweredBy } from '@prisma/client';

export class QuestionnaireOptionDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  label!: string;

  @ApiProperty()
  score!: number;

  @ApiProperty()
  order!: number;
}

export class QuestionnaireQuestionDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  label!: string;

  @ApiProperty()
  order!: number;

  @ApiProperty({ type: [QuestionnaireOptionDto] })
  options!: QuestionnaireOptionDto[];
}

export class QuestionnaireDefinitionResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  vulnerabilityThreshold!: number;

  @ApiProperty()
  maxPossibleScore!: number;

  @ApiProperty({ type: [QuestionnaireQuestionDto] })
  questions!: QuestionnaireQuestionDto[];
}

export class QuestionnaireAnswerSnapshotDto {
  @ApiProperty()
  questionId!: string;

  @ApiProperty()
  questionLabel!: string;

  @ApiProperty()
  optionId!: string;

  @ApiProperty()
  optionLabel!: string;

  @ApiProperty()
  score!: number;
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

  @ApiProperty({ type: [QuestionnaireAnswerSnapshotDto] })
  answers!: QuestionnaireAnswerSnapshotDto[];
}
