import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class UpdateQuestionnaireDto {
  @ApiPropertyOptional({ description: 'Novo limiar de vulnerabilidade.' })
  @IsOptional()
  @IsInt()
  @Min(1)
  vulnerabilityThreshold?: number;
}

export class OptionInputDto {
  @ApiProperty()
  @IsString()
  label!: string;

  @ApiProperty()
  @IsInt()
  @Min(0)
  score!: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  order!: number;
}

export class CreateQuestionDto {
  @ApiProperty()
  @IsString()
  label!: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  order!: number;

  @ApiProperty({ type: [OptionInputDto] })
  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => OptionInputDto)
  options!: OptionInputDto[];
}

export class UpdateQuestionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  order?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateOptionDto extends OptionInputDto {}

export class UpdateOptionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  score?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  order?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
