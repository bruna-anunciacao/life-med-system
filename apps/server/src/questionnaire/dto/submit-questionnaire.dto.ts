import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum } from 'class-validator';

export enum FamilyIncomeBracket {
  ATE_1_SM = 'ATE_1_SM',
  ENTRE_1_E_2_SM = 'ENTRE_1_E_2_SM',
  ENTRE_2_E_3_SM = 'ENTRE_2_E_3_SM',
  ACIMA_3_SM = 'ACIMA_3_SM',
}

export enum DependentsBracket {
  ATE_2 = 'ATE_2',
  TRES_OU_MAIS = 'TRES_OU_MAIS',
}

export class SubmitQuestionnaireDto {
  @ApiProperty({
    enum: FamilyIncomeBracket,
    description: 'Faixa de renda mensal da família.',
  })
  @IsEnum(FamilyIncomeBracket)
  familyIncomeBracket!: FamilyIncomeBracket;

  @ApiProperty({
    enum: DependentsBracket,
    description: 'Quantidade de pessoas que dependem da renda.',
  })
  @IsEnum(DependentsBracket)
  dependentsBracket!: DependentsBracket;

  @ApiProperty({
    description: 'Você ou alguém da família está desempregado?',
  })
  @IsBoolean()
  hasUnemployedFamilyMember!: boolean;

  @ApiProperty({
    description: 'Possui CadUnico?',
  })
  @IsBoolean()
  hasCadUnico!: boolean;

  @ApiProperty({
    description: 'Sua moradia é própria?',
  })
  @IsBoolean()
  ownsHome!: boolean;

  @ApiProperty({
    description: 'A casa possui água encanada?',
  })
  @IsBoolean()
  hasPipedWater!: boolean;

  @ApiProperty({
    description: 'Há saneamento básico (esgoto)?',
  })
  @IsBoolean()
  hasBasicSanitation!: boolean;
}
