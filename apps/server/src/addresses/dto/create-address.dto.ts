import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({
    example: '40170110',
    description: 'CEP com exatamente 8 dígitos numéricos',
    minLength: 8,
    maxLength: 8,
  })
  @IsString({ message: 'CEP deve ser texto' })
  @Length(8, 8, { message: 'CEP deve conter exatamente 8 dígitos' })
  @Matches(/^\d{8}$/, {
    message: 'CEP deve conter apenas dígitos numéricos',
  })
  zipCode!: string;

  @ApiProperty({
    example: 'Avenida Oceânica',
    description: 'Rua, avenida ou logradouro',
    minLength: 3,
    maxLength: 255,
  })
  @IsString({ message: 'Rua deve ser texto' })
  @MinLength(3, { message: 'Rua deve ter no mínimo 3 caracteres' })
  @MaxLength(255, { message: 'Rua deve ter no máximo 255 caracteres' })
  street!: string;

  @ApiProperty({
    example: '1000',
    description: 'Número do imóvel',
    maxLength: 20,
  })
  @IsString({ message: 'Número deve ser texto' })
  @MaxLength(20, { message: 'Número deve ter no máximo 20 caracteres' })
  number!: string;

  @ApiPropertyOptional({
    example: 'Apto 2501',
    description: 'Complemento do endereço (opcional)',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Complemento deve ser texto' })
  @MaxLength(100, { message: 'Complemento deve ter no máximo 100 caracteres' })
  complement?: string;

  @ApiProperty({
    example: 'Barra',
    description: 'Bairro',
    minLength: 3,
    maxLength: 100,
  })
  @IsString({ message: 'Bairro deve ser texto' })
  @MinLength(3, { message: 'Bairro deve ter no mínimo 3 caracteres' })
  @MaxLength(100, { message: 'Bairro deve ter no máximo 100 caracteres' })
  district!: string;

  @ApiProperty({
    example: 'Salvador',
    description: 'Cidade',
    minLength: 3,
    maxLength: 100,
  })
  @IsString({ message: 'Cidade deve ser texto' })
  @MinLength(3, { message: 'Cidade deve ter no mínimo 3 caracteres' })
  @MaxLength(100, { message: 'Cidade deve ter no máximo 100 caracteres' })
  city!: string;

  @ApiProperty({
    example: 'BA',
    description: 'Estado com exatamente 2 letras maiúsculas',
    minLength: 2,
    maxLength: 2,
  })
  @IsString({ message: 'Estado deve ser texto' })
  @Length(2, 2, { message: 'Estado deve conter exatamente 2 caracteres' })
  @Matches(/^[A-Z]{2}$/, {
    message: 'Estado deve conter 2 letras maiúsculas',
  })
  state!: string;
}
