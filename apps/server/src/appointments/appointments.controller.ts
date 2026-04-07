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
  AppointmentResponseDto,
  AppointmentListResponseDto,
} from './dto';
import { PatientRoleGuard } from '../patients/guards/patient-role.guard';
import { AppointmentOwnerGuard } from './guards/appointment-owner.guard';

@ApiTags('Appointments')
@ApiBearerAuth('access-token')
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

  @Patch(':appointmentId/cancel')
  @UseGuards(AuthGuard('jwt'), AppointmentOwnerGuard)
  @ApiOperation({
    summary: 'Cancelar agendamento',
    description:
      'Cancela um agendamento existente. Apenas o paciente ou profissional podem cancelar.',
  })
  @ApiParam({ name: 'appointmentId', description: 'ID do agendamento (UUID)' })
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
    description: 'Você não tem permissão para acessar este agendamento.',
  })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado.' })
  async cancelAppointment(
    @Request() req,
    @Param('appointmentId') appointmentId: string,
    @Body() dto: CancelAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    this.logger.log(
      `Usuário ${req.user.id} cancelando agendamento ${appointmentId}`,
    );
    return this.appointmentsService.cancelAppointment(appointmentId, dto);
  }
}
