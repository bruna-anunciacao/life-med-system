import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsString,
  ValidateNested,
} from 'class-validator';

export class SubmitAnswerDto {
  @ApiProperty({ description: 'ID da pergunta respondida.' })
  @IsString()
  questionId!: string;

  @ApiProperty({ description: 'ID da opção escolhida.' })
  @IsString()
  optionId!: string;
}

export class SubmitQuestionnaireDto {
  @ApiProperty({ type: [SubmitAnswerDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SubmitAnswerDto)
  answers!: SubmitAnswerDto[];
}
