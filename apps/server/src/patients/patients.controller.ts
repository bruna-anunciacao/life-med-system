import { Controller, Get, HttpStatus, Query, Request, Res } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiProduces,
} from '@nestjs/swagger';
import { PatientsService } from './patients.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PatientRoleGuard } from './guards/patient-role.guard';
import { ExportAppointmentsQueryDto } from './dto/export-appointments-query.dto';
import type { Response } from 'express';
import type PDFKit from 'pdfkit';
import { QuestionnaireCompletionGuard } from '../questionnaire/questionnaire-completion.guard';

@ApiTags('Patients')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'), QuestionnaireCompletionGuard)
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get('export/done-appointments')
  @UseGuards(PatientRoleGuard)
  @ApiOperation({
    summary: 'Exportar relatório de consultas concluídas (PDF)',
    description:
      'Gera e retorna um arquivo PDF com o histórico de consultas concluídas do paciente autenticado.',
  })
  @ApiQuery({
    name: 'professionalId',
    required: false,
    description: 'Filtrar por ID do profissional (UUID)',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Data inicial do filtro (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Data final do filtro (YYYY-MM-DD)',
  })
  @ApiProduces('application/pdf')
  @ApiResponse({
    status: 200,
    description: 'Arquivo PDF com relatório de consultas concluídas.',
    content: { 'application/pdf': {} },
  })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado — somente PATIENT.' })
  async exportDoneAppointments(
    @Request() req,
    @Query() query: ExportAppointmentsQueryDto,
    @Res() res: Response,
  ) {
    const doc = await this.patientsService.exportDoneAppointmentsReport(
      req.user.id as string,
      query,
    );

    this.sendPdfOrNoContent(
      res,
      doc,
      'relatorio-consultas-concluidas.pdf',
    );
  }

  @Get('export/pending-appointments')
  @UseGuards(PatientRoleGuard)
  @ApiOperation({
    summary: 'Exportar relatório de consultas pendentes (PDF)',
    description:
      'Gera e retorna um arquivo PDF com as consultas ainda pendentes do paciente autenticado.',
  })
  @ApiQuery({
    name: 'professionalId',
    required: false,
    description: 'Filtrar por ID do profissional (UUID)',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Data inicial do filtro (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Data final do filtro (YYYY-MM-DD)',
  })
  @ApiProduces('application/pdf')
  @ApiResponse({
    status: 200,
    description: 'Arquivo PDF com relatório de consultas pendentes.',
    content: { 'application/pdf': {} },
  })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado — somente PATIENT.' })
  async exportPendingAppointments(
    @Request() req,
    @Query() query: ExportAppointmentsQueryDto,
    @Res() res: Response,
  ) {
    const doc = await this.patientsService.exportPendingAppointmentsReport(
      req.user.id as string,
      query,
    );

    this.sendPdfOrNoContent(
      res,
      doc,
      'relatorio-consultas-pendentes.pdf',
    );
  }

  @Get('export/cancelled-appointments')
  @UseGuards(PatientRoleGuard)
  @ApiOperation({
    summary: 'Exportar relatório de consultas canceladas (PDF)',
    description:
      'Gera e retorna um arquivo PDF com as consultas canceladas do paciente autenticado.',
  })
  @ApiQuery({
    name: 'professionalId',
    required: false,
    description: 'Filtrar por ID do profissional (UUID)',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Data inicial do filtro (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Data final do filtro (YYYY-MM-DD)',
  })
  @ApiProduces('application/pdf')
  @ApiResponse({
    status: 200,
    description: 'Arquivo PDF com relatório de consultas canceladas.',
    content: { 'application/pdf': {} },
  })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado — somente PATIENT.' })
  async exportCancelledAppointments(
    @Request() req,
    @Query() query: ExportAppointmentsQueryDto,
    @Res() res: Response,
  ) {
    const doc = await this.patientsService.exportCancelledAppointmentsReport(
      req.user.id as string,
      query,
    );

    this.sendPdfOrNoContent(
      res,
      doc,
      'relatorio-consultas-canceladas.pdf',
    );
  }

  private sendPdfOrNoContent(
    res: Response,
    doc: PDFKit.PDFDocument | null,
    filename: string,
  ): void {
    if (!doc) {
      res.status(HttpStatus.NO_CONTENT).end();
      return;
    }

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=${filename}`,
    });

    doc.pipe(res);
    doc.end();
  }
}
