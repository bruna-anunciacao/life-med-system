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
import { ManagerService } from './manager.service';
import { CreatePatientDto } from '../patients/dto/create-patient.dto';
import { UpdatePatientDto } from '../patients/dto/update-patient.dto';
import { CreateAppointmentDto } from './dtos/create-appointment.dto';

@Controller('manager')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoleEnum.MANAGER)
export class ManagerController {
  constructor(private managerService: ManagerService) {}

  @Post('patients')
  async createPatient(@Body() dto: CreatePatientDto) {
    return this.managerService.createPatient(dto);
  }

  @Patch('patients/:patientId')
  async updatePatient(
    @Param('patientId') patientId: string,
    @Body() dto: UpdatePatientDto,
  ) {
    return this.managerService.updatePatient(patientId, dto);
  }

  @Get('patients')
  async listPatients() {
    return this.managerService.listPatients();
  }

  @Get('patients/:patientId')
  async getPatient(@Param('patientId') patientId: string) {
    return this.managerService.getPatient(patientId);
  }

  @Post('appointments')
  async createAppointment(@Body() dto: CreateAppointmentDto) {
    return this.managerService.createAppointment(dto);
  }

  @Get('appointments')
  async listAppointments() {
    return this.managerService.getAppointmentsByManager();
  }

  @Get('professionals/:professionalId/availability')
  async getProfessionalAvailability(
    @Param('professionalId') professionalId: string,
  ) {
    return this.managerService.getProfessionalAvailability(professionalId);
  }
}
