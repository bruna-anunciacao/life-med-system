import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles-auth.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import {
  CreateOptionDto,
  CreateQuestionDto,
  UpdateOptionDto,
  UpdateQuestionDto,
  UpdateQuestionnaireDto,
} from './dto/admin-questionnaire.dto';
import { QuestionnaireAdminService } from './questionnaire-admin.service';

@ApiTags('Questionnaire Admin')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER)
@Controller('admin/questionnaire')
export class QuestionnaireAdminController {
  constructor(private readonly service: QuestionnaireAdminService) {}

  @Get()
  @ApiOperation({ summary: 'Buscar questionário ativo com perguntas/opções' })
  getActive() {
    return this.service.getActive();
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar limiar de vulnerabilidade' })
  updateQuestionnaire(
    @Param('id') id: string,
    @Body() dto: UpdateQuestionnaireDto,
  ) {
    return this.service.updateQuestionnaire(id, dto);
  }

  @Post(':id/questions')
  @ApiOperation({ summary: 'Criar pergunta (com opções inline)' })
  createQuestion(@Param('id') id: string, @Body() dto: CreateQuestionDto) {
    return this.service.createQuestion(id, dto);
  }

  @Patch(':id/questions/:questionId')
  @ApiOperation({ summary: 'Editar pergunta' })
  updateQuestion(
    @Param('id') id: string,
    @Param('questionId') questionId: string,
    @Body() dto: UpdateQuestionDto,
  ) {
    return this.service.updateQuestion(id, questionId, dto);
  }

  @Delete(':id/questions/:questionId')
  @ApiOperation({ summary: 'Soft delete de pergunta' })
  deleteQuestion(
    @Param('id') id: string,
    @Param('questionId') questionId: string,
  ) {
    return this.service.deleteQuestion(id, questionId);
  }

  @Post(':id/questions/:questionId/options')
  @ApiOperation({ summary: 'Criar opção em uma pergunta' })
  createOption(
    @Param('id') id: string,
    @Param('questionId') questionId: string,
    @Body() dto: CreateOptionDto,
  ) {
    return this.service.createOption(id, questionId, dto);
  }

  @Patch(':id/options/:optionId')
  @ApiOperation({ summary: 'Editar opção' })
  updateOption(
    @Param('id') id: string,
    @Param('optionId') optionId: string,
    @Body() dto: UpdateOptionDto,
  ) {
    return this.service.updateOption(id, optionId, dto);
  }

  @Delete(':id/options/:optionId')
  @ApiOperation({ summary: 'Soft delete de opção' })
  deleteOption(
    @Param('id') id: string,
    @Param('optionId') optionId: string,
  ) {
    return this.service.deleteOption(id, optionId);
  }
}
