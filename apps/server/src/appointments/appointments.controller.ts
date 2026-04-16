import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Query,
  Param,
  Request,
  UseGuards,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AppointmentsService } from './appointments.service';
import {
  CreateAppointmentPatientDto,
  ListAppointmentsQueryDto,
  CancelAppointmentDto,
  UpdateAppointmentStatusDto,
  AppointmentResponseDto,
  AppointmentListResponseDto,
  AvailableSlotsQueryDto,
  AvailableSlotsResponseDto,
  CreateAppointmentPatientForManagerDto,
} from './dto';
import { PatientRoleGuard } from '../patients/guards/patient-role.guard';
import { ProfessionalRoleGuard } from '../professional/guards/professional-role.guard';
import { AppointmentPatientOwnerGuard } from './guards/appointment-patient-owner.guard';
import { AppointmentProfessionalGuard } from './guards/appointment-professional.guard';
import { AppointmentOwnerGuard } from './guards/appointment-owner.guard';
import { QuestionnaireCompletionGuard } from '../questionnaire/questionnaire-completion.guard';

@ApiTags('Appointments')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'), QuestionnaireCompletionGuard)
@Controller('appointments')
export class AppointmentsController {
  private readonly logger = new Logger(AppointmentsController.name);

  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), PatientRoleGuard)
  @ApiOperation({
    summary: 'Agendar consulta',
    description:
      'Cria um novo agendamento de consulta. Requer autenticação e role PATIENT.',
  })
  @ApiBody({ type: CreateAppointmentPatientDto })
  @ApiResponse({
    status: 201,
    description: 'Consulta agendada com sucesso.',
    type: AppointmentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou horário indisponível.',
  })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado — somente PATIENT.' })
  @ApiResponse({ status: 404, description: 'Profissional não encontrado.' })
  async createAppointment(
    @Request() req,
    @Body() dto: CreateAppointmentPatientDto,
  ): Promise<AppointmentResponseDto> {
    this.logger.log(
      `Paciente ${req.user.id} tentando agendar com profissional ${dto.professionalId}`,
    );
    return this.appointmentsService.createAppointment(
      req.user.id as string,
      dto,
    );
  }
  @Post('manager')
  @UseGuards(AuthGuard('jwt') )
  @ApiOperation({
    summary: 'Agendar consulta pelo pelo gestor',
    description:
      'Cria um novo agendamento de consulta. Requer autenticação.',
  })
  @ApiBody({ type: CreateAppointmentPatientDto })
  @ApiResponse({
    status: 201,
    description: 'Consulta agendada com sucesso.',
    type: AppointmentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou horário indisponível.',
  })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado — somente gestor.' })
  @ApiResponse({ status: 404, description: 'Profissional não encontrado.' })
  async createAppointmentByManager(
    @Request() req,
    @Body() dto: CreateAppointmentPatientForManagerDto,
  ): Promise<AppointmentResponseDto> {
    this.logger.log(
      `Gestor ${req.user.id} tentando agendar com profissional ${dto.professionalId} para paciente ${dto.patientId}`,
    );
    return this.appointmentsService.createAppointment(
      dto.patientId as string,
      dto,
    );
  }

  @Get('my-appointments')
  @UseGuards(AuthGuard('jwt'), PatientRoleGuard)
  @ApiOperation({
    summary: 'Listar meus agendamentos',
    description:
      'Retorna todos os agendamentos do paciente autenticado com opções de filtro.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filtrar por status',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Data inicial (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Data final (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Página (padrão: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Registros por página (padrão: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de agendamentos.',
    type: AppointmentListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado — somente PATIENT.' })
  async listMyAppointments(
    @Request() req,
    @Query() query: ListAppointmentsQueryDto,
  ): Promise<AppointmentListResponseDto> {
    this.logger.log(
      `Paciente ${req.user.id} listando agendamentos - página ${query.page}`,
    );
    return this.appointmentsService.listPatientAppointments(
      req.user.id as string,
      query,
    );
  }

  @Get('professionals/:professionalId/available-slots')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Buscar horários disponíveis',
    description:
      'Retorna os horários disponíveis de um profissional para uma data específica, filtrando slots já ocupados.',
  })
  @ApiParam({
    name: 'professionalId',
    description: 'ID do profissional (UUID)',
  })
  @ApiQuery({
    name: 'date',
    description: 'Data para consulta (YYYY-MM-DD)',
    example: '2026-04-10',
  })
  @ApiResponse({
    status: 200,
    description: 'Horários disponíveis.',
    type: AvailableSlotsResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 404, description: 'Profissional não encontrado.' })
  async getAvailableSlots(
    @Param('professionalId') professionalId: string,
    @Query() query: AvailableSlotsQueryDto,
  ): Promise<AvailableSlotsResponseDto> {
    this.logger.log(
      `Buscando slots disponíveis do profissional ${professionalId} para ${query.date}`,
    );
    return this.appointmentsService.getAvailableSlots(professionalId, query);
  }

  @Patch(':id/status')
  @UseGuards(
    AuthGuard('jwt'),
    ProfessionalRoleGuard,
    AppointmentProfessionalGuard,
  )
  @ApiOperation({
    summary: 'Atualizar status do agendamento',
    description:
      'Profissional altera o status (ex.: CONFIRMED, COMPLETED, NO_SHOW). Cancelamento pelo paciente usa PATCH /appointments/:id/cancel.',
  })
  @ApiParam({ name: 'id', description: 'ID do agendamento (UUID)' })
  @ApiBody({ type: UpdateAppointmentStatusDto })
  @ApiResponse({
    status: 200,
    description: 'Status atualizado.',
    type: AppointmentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Agendamento cancelado ou dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado — somente PROFESSIONAL atribuído ao agendamento.',
  })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado.' })
  async updateAppointmentStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentStatusDto,
  ): Promise<AppointmentResponseDto> {
    this.logger.log(
      `Profissional ${req.user.id} atualizando status do agendamento ${id}`,
    );
    return this.appointmentsService.updateAppointmentStatus(
      id,
      req.user.id as string,
      dto,
    );
  }

  @Patch(':id/cancel')
  @UseGuards(AuthGuard('jwt'), PatientRoleGuard, AppointmentPatientOwnerGuard)
  @ApiOperation({
    summary: 'Cancelar agendamento',
    description:
      'Cancela um agendamento (status CANCELLED). Apenas o paciente dono do agendamento.',
  })
  @ApiParam({ name: 'id', description: 'ID do agendamento (UUID)' })
  @ApiBody({ type: CancelAppointmentDto })
  @ApiResponse({
    status: 200,
    description: 'Agendamento cancelado com sucesso.',
    type: AppointmentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Agendamento já foi cancelado.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({
    status: 403,
    description:
      'Acesso negado — somente PATIENT dono do agendamento.',
  })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado.' })
  async cancelAppointment(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: CancelAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    this.logger.log(`Paciente ${req.user.id} cancelando agendamento ${id}`);
    return this.appointmentsService.cancelAppointment(id, dto);
  }
}
