import { Controller, Get, Query, Request, Res } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PatientRoleGuard } from './guards/patient-role.guard';
import { ExportAppointmentsQueryDto } from './dto/export-appointments-query.dto';
import type { Response } from 'express';

@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get('export/done-appointments')
  @UseGuards(AuthGuard('jwt'), PatientRoleGuard)
  async exportDoneAppointments(
    @Request() req,
    @Query() query: ExportAppointmentsQueryDto,
    @Res() res: Response,
  ) {
    const doc = await this.patientsService.exportDoneAppointmentsReport(
      req.user.id as string,
      query,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition':
        'attachment; filename=relatorio-consultas-concluidas.pdf',
    });

    doc.pipe(res);
    doc.end();
  }

  @Get('export/pending-appointments')
  @UseGuards(AuthGuard('jwt'), PatientRoleGuard)
  async exportPendingAppointments(
    @Request() req,
    @Query() query: ExportAppointmentsQueryDto,
    @Res() res: Response,
  ) {
    const doc = await this.patientsService.exportPendingAppointmentsReport(
      req.user.id as string,
      query,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition':
        'attachment; filename=relatorio-consultas-pendentes.pdf',
    });

    doc.pipe(res);
    doc.end();
  }

  @Get('export/cancelled-appointments')
  @UseGuards(AuthGuard('jwt'), PatientRoleGuard)
  async exportCancelledAppointments(
    @Request() req,
    @Query() query: ExportAppointmentsQueryDto,
    @Res() res: Response,
  ) {
    const doc = await this.patientsService.exportCancelledAppointmentsReport(
      req.user.id as string,
      query,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition':
        'attachment; filename=relatorio-consultas-canceladas.pdf',
    });

    doc.pipe(res);
    doc.end();
  }
}
