import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PatientRoleGuard } from '../patients/guards/patient-role.guard';
import { QuestionnaireService } from './questionnaire.service';
import { SubmitQuestionnaireDto } from './dto/submit-questionnaire.dto';
import {
  QuestionnaireDefinitionResponseDto,
  QuestionnaireResponseDto,
} from './dto/questionnaire-response.dto';
import { RolesGuard } from '../auth/guards/roles-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Questionnaire')
@ApiBearerAuth('access-token')
@Controller()
export class QuestionnaireController {
  constructor(private readonly questionnaireService: QuestionnaireService) {}

  @Get('questionnaire/questions')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Listar definição do questionário de vulnerabilidade',
  })
  @ApiResponse({ status: 200, type: QuestionnaireDefinitionResponseDto })
  getQuestions() {
    return this.questionnaireService.getQuestions();
  }

  @Get('questionnaire/me')
  @UseGuards(JwtAuthGuard, PatientRoleGuard)
  @ApiOperation({ summary: 'Resposta do paciente autenticado' })
  @ApiResponse({ status: 200, type: QuestionnaireResponseDto })
  getOwnResponse(@Request() req) {
    return this.questionnaireService.getPatientResponse(
      req.user.userId as string,
    );
  }

  @Post('questionnaire')
  @UseGuards(JwtAuthGuard, PatientRoleGuard)
  @ApiOperation({ summary: 'Paciente envia seu próprio questionário' })
  @ApiResponse({ status: 201, type: QuestionnaireResponseDto })
  submitSelf(@Request() req, @Body() dto: SubmitQuestionnaireDto) {
    return this.questionnaireService.submitSelf(req.user.userId as string, dto);
  }

  @Post('manager/patients/:patientId/questionnaire')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'Gestor cria questionário para um paciente' })
  @ApiParam({ name: 'patientId', description: 'ID do usuário paciente' })
  @ApiResponse({ status: 201, type: QuestionnaireResponseDto })
  submitForManager(
    @Request() req,
    @Param('patientId') patientId: string,
    @Body() dto: SubmitQuestionnaireDto,
  ) {
    return this.questionnaireService.submitForManager(
      req.user.userId as string,
      patientId,
      dto,
    );
  }

  @Put('manager/patients/:patientId/questionnaire')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER)
  @ApiOperation({
    summary: 'Gestor atualiza questionário existente de um paciente',
  })
  @ApiParam({ name: 'patientId', description: 'ID do usuário paciente' })
  @ApiResponse({ status: 200, type: QuestionnaireResponseDto })
  updateForManager(
    @Request() req,
    @Param('patientId') patientId: string,
    @Body() dto: SubmitQuestionnaireDto,
  ) {
    return this.questionnaireService.updateForManager(
      req.user.userId as string,
      patientId,
      dto,
    );
  }
}
