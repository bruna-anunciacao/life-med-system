import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { ListAppointmentsQueryDto } from './dto/list-appointments-query.dto';
import { AvailableSlotsQueryDto } from './dto/available-slots-query.dto';
import { PatientRoleGuard } from './guards/patient-role.guard';
import { EmailVerifiedGuard } from '../auth/guards/email-verified.guard';

@Controller('appointments')
@UseGuards(AuthGuard('jwt'), PatientRoleGuard, EmailVerifiedGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get('slots')
  getAvailableSlots(@Query() query: AvailableSlotsQueryDto) {
    return this.appointmentsService.getAvailableSlots(query);
  }

  @Get('my')
  listMyAppointments(@Request() req, @Query() query: ListAppointmentsQueryDto) {
    return this.appointmentsService.listMyAppointments(
      req.user.id as string,
      query,
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createAppointment(@Request() req, @Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.createAppointment(
      req.user.id as string,
      dto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  cancelAppointment(@Request() req, @Param('id') id: string) {
    return this.appointmentsService.cancelAppointment(
      req.user.id as string,
      id,
    );
  }
}
