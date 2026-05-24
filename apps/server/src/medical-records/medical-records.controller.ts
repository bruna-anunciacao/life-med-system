import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from '@prisma/client';
import type { Response } from 'express';
import { MedicalRecordsService } from './medical-records.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { ListMedicalRecordsQueryDto } from './dto/list-medical-records-query.dto';
import {
  MedicalRecordResponseDto,
  MedicalRecordPatientResponseDto,
  MedicalRecordListResponseDto,
  MedicalRecordPatientListResponseDto,
} from './dto/medical-record-response.dto';
import { ProfessionalRoleGuard } from '../professional/guards/professional-role.guard';
import { PatientRoleGuard } from '../patients/guards/patient-role.guard';

@ApiTags('Medical Records')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
@Controller('medical-records')
export class MedicalRecordsController {
  constructor(private readonly service: MedicalRecordsService) {}

  @Post()
  @UseGuards(ProfessionalRoleGuard)
  @ApiOperation({ summary: 'Criar prontuário médico para uma consulta' })
  @ApiBody({ type: CreateMedicalRecordDto })
  @ApiResponse({ status: 201, type: MedicalRecordResponseDto })
  @ApiResponse({
    status: 403,
    description: 'Não é o profissional da consulta.',
  })
  @ApiResponse({ status: 404, description: 'Consulta não encontrada.' })
  create(
    @Request() req: { user: { userId: string } },
    @Body() dto: CreateMedicalRecordDto,
  ) {
    return this.service.create(req.user.userId, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar prontuários do usuário autenticado',
    description:
      'Médico: lista os prontuários que ele criou. Paciente: lista os próprios prontuários (sem internalNotes).',
  })
  @ApiResponse({ status: 200, type: MedicalRecordListResponseDto })
  list(
    @Request() req: { user: { userId: string; role: UserRole } },
    @Query() query: ListMedicalRecordsQueryDto,
  ): Promise<
    MedicalRecordListResponseDto | MedicalRecordPatientListResponseDto
  > {
    return this.service.list(req.user.userId, req.user.role, query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar prontuário por ID',
    description:
      'Profissional autor recebe todos os campos. Paciente dono não recebe internalNotes (LGPD).',
  })
  @ApiParam({ name: 'id', description: 'ID do prontuário' })
  @ApiResponse({ status: 200, type: MedicalRecordResponseDto })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  @ApiResponse({ status: 404, description: 'Prontuário não encontrado.' })
  findById(
    @Request() req: { user: { userId: string; role: UserRole } },
    @Param('id') id: string,
  ): Promise<MedicalRecordResponseDto | MedicalRecordPatientResponseDto> {
    return this.service.findById(id, req.user.userId, req.user.role);
  }

  @Get('appointment/:appointmentId')
  @ApiOperation({
    summary: 'Buscar prontuário por consulta',
    description:
      'Profissional com vínculo recebe todos os campos. Paciente dono não recebe internalNotes (LGPD).',
  })
  @ApiParam({ name: 'appointmentId', description: 'ID da consulta' })
  @ApiResponse({ status: 200, type: MedicalRecordResponseDto })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  @ApiResponse({ status: 404, description: 'Prontuário não encontrado.' })
  findByAppointment(
    @Request() req: { user: { userId: string; role: UserRole } },
    @Param('appointmentId') appointmentId: string,
  ): Promise<MedicalRecordResponseDto | MedicalRecordPatientResponseDto> {
    return this.service.findByAppointment(
      appointmentId,
      req.user.userId,
      req.user.role,
    );
  }

  @Get('patient/:patientId')
  @UseGuards(ProfessionalRoleGuard)
  @ApiOperation({
    summary: 'Listar prontuários de um paciente',
    description: 'Requer vínculo de consulta com o paciente.',
  })
  @ApiParam({ name: 'patientId', description: 'ID do paciente' })
  @ApiResponse({ status: 200, type: [MedicalRecordResponseDto] })
  @ApiResponse({ status: 403, description: 'Sem vínculo com este paciente.' })
  findByPatient(
    @Request() req: { user: { userId: string } },
    @Param('patientId') patientId: string,
  ) {
    return this.service.findByPatient(patientId, req.user.userId);
  }

  @Get('appointment/:appointmentId/pdf')
  @UseGuards(PatientRoleGuard)
  @ApiOperation({
    summary: 'Exportar prontuário em PDF (somente paciente dono)',
    description:
      'Gera PDF do prontuário sem incluir notas internas (LGPD). Apenas o paciente dono pode acessar.',
  })
  @ApiParam({ name: 'appointmentId', description: 'ID da consulta' })
  @ApiResponse({ status: 200, description: 'PDF do prontuário.' })
  @ApiResponse({ status: 403, description: 'Não é o paciente da consulta.' })
  @ApiResponse({ status: 404, description: 'Prontuário não encontrado.' })
  async exportPatientPdf(
    @Request() req: { user: { userId: string } },
    @Param('appointmentId') appointmentId: string,
    @Res() res: Response,
  ): Promise<void> {
    const doc = await this.service.generatePatientPdf(
      appointmentId,
      req.user.userId,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=prontuario-${appointmentId}.pdf`,
    });

    doc.pipe(res);
    doc.end();
  }

  @Patch(':id')
  @UseGuards(ProfessionalRoleGuard)
  @ApiOperation({ summary: 'Atualizar prontuário (somente autor)' })
  @ApiParam({ name: 'id', description: 'ID do prontuário' })
  @ApiBody({ type: UpdateMedicalRecordDto })
  @ApiResponse({ status: 200, type: MedicalRecordResponseDto })
  @ApiResponse({ status: 403, description: 'Não é o autor do prontuário.' })
  @ApiResponse({ status: 404, description: 'Prontuário não encontrado.' })
  update(
    @Request() req: { user: { userId: string } },
    @Param('id') id: string,
    @Body() dto: UpdateMedicalRecordDto,
  ) {
    return this.service.update(id, req.user.userId, dto);
  }
}
