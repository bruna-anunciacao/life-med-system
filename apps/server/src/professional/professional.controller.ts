import {
  Body,
  Controller,
  Patch,
  Get,
  UseGuards,
  Req,
  Query,
  Param,
  Delete,
  Post,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ProfessionalService } from './professional.service';
import { UpdateProfessionalSettingsDto } from './dto/update-setting.dto';
import { CreateScheduleBlockDto } from './dto/schedule-block.dto';
import { ProfessionalRoleGuard } from './guards/professional-role.guard';
import { EmailVerifiedGuard } from '../auth/guards/email-verified.guard';

@ApiTags('Professional')
@ApiBearerAuth('access-token')
@Controller('professional')
export class ProfessionalController {
  constructor(private readonly professionalService: ProfessionalService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), EmailVerifiedGuard)
  @ApiOperation({ summary: 'Listar todos os profissionais' })
  @ApiResponse({ status: 200, description: 'Lista de profissionais.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  listAll() {
    return this.professionalService.listAll();
  }

  @Get('settings')
  @UseGuards(AuthGuard('jwt'), ProfessionalRoleGuard, EmailVerifiedGuard)
  @ApiOperation({
    summary: 'Obter configurações do profissional autenticado',
    description:
      'Retorna modalidade, disponibilidade, preço e formas de pagamento.',
  })
  @ApiResponse({ status: 200, description: 'Configurações do profissional.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado — somente PROFESSIONAL.',
  })
  getSettings(@Req() req) {
    return this.professionalService.getSettings(req.user.id as string);
  }

  @Get('schedule')
  @UseGuards(AuthGuard('jwt'), ProfessionalRoleGuard, EmailVerifiedGuard)
  @ApiOperation({
    summary: 'Obter agenda diária do profissional',
    description:
      'Retorna os agendamentos do dia informado para o profissional autenticado.',
  })
  @ApiQuery({
    name: 'date',
    required: true,
    example: '2024-06-15',
    description: 'Data no formato YYYY-MM-DD',
  })
  @ApiResponse({ status: 200, description: 'Lista de agendamentos do dia.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado — somente PROFESSIONAL.',
  })
  getDailySchedule(@Req() req, @Query('date') date: string) {
    return this.professionalService.getDailySchedule(
      req.user.id as string,
      date,
    );
  }

  @Get(':id/schedule')
  @UseGuards(AuthGuard('jwt'), EmailVerifiedGuard)
  @ApiOperation({
    summary: 'Obter agenda diária de um profissional específico',
    description:
      'Retorna os agendamentos do dia informado para um profissional específico. Acessível por gerentes (managers) e profissionais consultando a si mesmos.',
  })
  @ApiQuery({
    name: 'date',
    required: true,
    example: '2024-06-15',
    description: 'Data no formato YYYY-MM-DD',
  })
  @ApiResponse({ status: 200, description: 'Lista de agendamentos do dia.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 404, description: 'Profissional não encontrado.' })
  getDailyScheduleForProfessional(
    @Param('id') professionalId: string,
    @Query('date') date: string,
  ) {
    return this.professionalService.getDailySchedule(professionalId, date);
  }

  @Get('patients')
  @UseGuards(AuthGuard('jwt'), ProfessionalRoleGuard, EmailVerifiedGuard)
  @ApiOperation({
    summary: 'Obter lista de pacientes do profissional',
    description:
      'Retorna todos os pacientes que já tiveram consulta com este profissional.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de pacientes com última visita.',
  })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado — somente PROFESSIONAL.',
  })
  getPatients(@Req() req) {
    return this.professionalService.getPatients(req.user.id as string);
  }

  @Get('patients/:id')
  @UseGuards(AuthGuard('jwt'), ProfessionalRoleGuard, EmailVerifiedGuard)
  @ApiOperation({
    summary: 'Obter detalhes de um paciente',
    description:
      'Retorna o perfil e o histórico de consultas de um paciente com o profissional.',
  })
  @ApiResponse({ status: 200, description: 'Detalhes e histórico.' })
  @ApiResponse({ status: 404, description: 'Paciente não encontrado.' })
  getPatientDetail(@Req() req, @Param('id') patientId: string) {
    return this.professionalService.getPatientDetail(
      req.user.id as string,
      patientId,
    );
  }

  @Patch('settings')
  @UseGuards(AuthGuard('jwt'), ProfessionalRoleGuard, EmailVerifiedGuard)
  @ApiOperation({
    summary: 'Atualizar configurações do profissional',
    description:
      'Atualiza modalidade, endereço, disponibilidade, preço e formas de pagamento.',
  })
  @ApiBody({ type: UpdateProfessionalSettingsDto })
  @ApiResponse({
    status: 200,
    description: 'Configurações atualizadas com sucesso.',
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado — somente PROFESSIONAL.',
  })
  updateSettings(@Req() req, @Body() dto: UpdateProfessionalSettingsDto) {
    return this.professionalService.updateSettings(req.user.id as string, dto);
  }

  @Post('schedule-blocks')
  @UseGuards(AuthGuard('jwt'), ProfessionalRoleGuard, EmailVerifiedGuard)
  @ApiOperation({
    summary: 'Criar um bloqueio na agenda',
    description: 'Bloqueia a agenda para o dia inteiro ou um intervalo de horas e cancela consultas afetadas.',
  })
  @ApiBody({ type: CreateScheduleBlockDto })
  @ApiResponse({ status: 201, description: 'Bloqueio criado com sucesso.' })
  createScheduleBlock(@Req() req, @Body() dto: CreateScheduleBlockDto) {
    return this.professionalService.createScheduleBlock(req.user.id as string, dto);
  }

  @Get('schedule-blocks')
  @UseGuards(AuthGuard('jwt'), ProfessionalRoleGuard, EmailVerifiedGuard)
  @ApiOperation({
    summary: 'Listar bloqueios na agenda',
    description: 'Lista todos os bloqueios ativos do profissional.',
  })
  @ApiResponse({ status: 200, description: 'Lista de bloqueios.' })
  getScheduleBlocks(@Req() req) {
    return this.professionalService.getScheduleBlocks(req.user.id as string);
  }

  @Delete('schedule-blocks/:id')
  @UseGuards(AuthGuard('jwt'), ProfessionalRoleGuard, EmailVerifiedGuard)
  @ApiOperation({
    summary: 'Remover um bloqueio na agenda',
    description: 'Remove um bloqueio existente, liberando o horário.',
  })
  @ApiResponse({ status: 200, description: 'Bloqueio removido com sucesso.' })
  deleteScheduleBlock(@Req() req, @Param('id') id: string) {
    return this.professionalService.deleteScheduleBlock(req.user.id as string, id);
  }
}
