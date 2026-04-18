import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ManagerService } from './manager.service';
import { PatientsService } from '../patients/patients.service';
import { CreatePatientDto } from '../patients/dto/create-patient.dto';
import { UpdatePatientDto } from '../patients/dto/update-patient.dto';
import { CreateAppointmentDto } from './dtos/create-appointment.dto';

@ApiTags('Manager')
@ApiBearerAuth('access-token')
@Controller('manager')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.MANAGER)
export class ManagerController {
  constructor(
    private managerService: ManagerService,
    private patientsService: PatientsService,
  ) {}

  @Post('patients')
  @ApiOperation({ summary: 'Cadastro Assistido — criar paciente via gestor', description: 'Cria um novo paciente no sistema com senha temporária e e-mail já verificado. Requer role MANAGER.' })
  @ApiBody({ type: CreatePatientDto })
  @ApiResponse({ status: 201, description: 'Paciente criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado — somente MANAGER.' })
  async createPatient(@Body() dto: CreatePatientDto) {
    return this.patientsService.createAssistedPatient(dto);
  }

  @Patch('patients/:patientId')
  @ApiOperation({ summary: 'Atualizar dados do paciente', description: 'Atualiza telefone, data de nascimento, gênero e endereço do paciente.' })
  @ApiParam({ name: 'patientId', description: 'ID do paciente (UUID)' })
  @ApiBody({ type: UpdatePatientDto })
  @ApiResponse({ status: 200, description: 'Paciente atualizado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado — somente MANAGER.' })
  @ApiResponse({ status: 404, description: 'Paciente não encontrado.' })
  async updatePatient(
    @Param('patientId') patientId: string,
    @Body() dto: UpdatePatientDto,
  ) {
    return this.patientsService.updatePatient(patientId, dto);
  }

  @Get('patients')
  @ApiOperation({ summary: 'Listar todos os pacientes' })
  @ApiResponse({ status: 200, description: 'Lista de pacientes.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado — somente MANAGER.' })
  async listPatients() {
    return this.patientsService.listPatients();
  }

  @Get('patients/:patientId')
  @ApiOperation({ summary: 'Buscar paciente por ID' })
  @ApiParam({ name: 'patientId', description: 'ID do paciente (UUID)' })
  @ApiResponse({ status: 200, description: 'Dados do paciente.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado — somente MANAGER.' })
  @ApiResponse({ status: 404, description: 'Paciente não encontrado.' })
  async getPatient(@Param('patientId') patientId: string) {
    return this.patientsService.getPatient(patientId);
  }

  @Post('appointments')
  @ApiOperation({ summary: 'Agendar consulta', description: 'Cria uma nova consulta entre um paciente e um profissional de saúde.' })
  @ApiBody({ type: CreateAppointmentDto })
  @ApiResponse({ status: 201, description: 'Consulta agendada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado — somente MANAGER.' })
  async createAppointment(@Body() dto: CreateAppointmentDto) {
    return this.managerService.createAppointment(dto);
  }

  @Get('appointments')
  @ApiOperation({ summary: 'Listar consultas do manager' })
  @ApiResponse({ status: 200, description: 'Lista de consultas.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado — somente MANAGER.' })
  async listAppointments() {
    return this.managerService.getAppointmentsByManager();
  }

  @Get('professionals/:professionalId/availability')
  @ApiOperation({ summary: 'Consultar disponibilidade do profissional', description: 'Retorna os horários disponíveis do profissional informado.' })
  @ApiParam({ name: 'professionalId', description: 'ID do profissional (UUID)' })
  @ApiResponse({ status: 200, description: 'Disponibilidade do profissional.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado — somente MANAGER.' })
  @ApiResponse({ status: 404, description: 'Profissional não encontrado.' })
  async getProfessionalAvailability(
    @Param('professionalId') professionalId: string,
  ) {
    return this.managerService.getProfessionalAvailability(professionalId);
  }
}
