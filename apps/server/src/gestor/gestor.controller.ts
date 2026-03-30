import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRoleEnum } from '../auth/enums/user-role-enum';
import { GestorService } from './gestor.service';
import { CreatePatientDto } from './dtos/create-patient.dto';
import { UpdatePatientDto } from './dtos/update-patient.dto';
import { CreateAppointmentDto } from './dtos/create-appointment.dto';

@Controller('gestor')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoleEnum.GESTOR)
export class GestorController {
  constructor(private gestorService: GestorService) {}

  @Post('patients')
  async createPatient(@Body() dto: CreatePatientDto) {
    return this.gestorService.createPatient(dto);
  }

  @Patch('patients/:patientId')
  async updatePatient(
    @Param('patientId') patientId: string,
    @Body() dto: UpdatePatientDto,
  ) {
    return this.gestorService.updatePatient(patientId, dto);
  }

  @Get('patients')
  async listPatients() {
    return this.gestorService.listPatients();
  }

  @Get('patients/:patientId')
  async getPatient(@Param('patientId') patientId: string) {
    return this.gestorService.getPatient(patientId);
  }

  @Post('appointments')
  async createAppointment(@Body() dto: CreateAppointmentDto) {
    return this.gestorService.createAppointment(dto);
  }

  @Get('appointments')
  async listAppointments() {
    return this.gestorService.getAppointmentsByGestor();
  }

  @Get('professionals/:professionalId/availability')
  async getProfessionalAvailability(@Param('professionalId') professionalId: string) {
    return this.gestorService.getProfessionalAvailability(professionalId);
  }
}
