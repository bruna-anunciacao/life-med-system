import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty } from "class-validator";

export class CreateSpecialityDto {
    @ApiProperty({ example: 'Cardiologia', description: 'Nome da especialidade' })
    @IsString({ message: 'Nome deve ser texto' })
    @IsNotEmpty({ message: 'Nome é obrigatório' })
    name!: string;
}
