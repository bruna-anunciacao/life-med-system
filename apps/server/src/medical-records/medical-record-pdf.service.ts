import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

type PDFDocumentType = PDFKit.PDFDocument;

const MODALITY_LABELS: Record<string, string> = {
  VIRTUAL: 'Teleconsulta',
  HOME_VISIT: 'Visita Domiciliar',
  CLINIC: 'Presencial',
};

const LGPD_FOOTER =
  'Documento gerado em {date}. Notas internas do profissional não estão incluídas neste documento conforme política de privacidade.';

export interface PatientMedicalRecordPdfInput {
  patient: {
    name: string;
    cpf?: string | null;
    dateOfBirth?: Date | null;
  };
  appointment: {
    dateTime: Date;
    modality: string;
  };
  professional: {
    name: string;
    specialties: string[];
  };
  record: {
    chiefComplaint: string | null;
    diagnosis: string | null;
    treatmentPlan: string | null;
    prescriptions: string | null;
    createdAt: Date;
  };
}

@Injectable()
export class MedicalRecordPdfService {
  generate(input: PatientMedicalRecordPdfInput): PDFDocumentType {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 80, left: 50, right: 50 },
      bufferPages: true,
    });

    this.renderHeader(doc);
    this.renderPatientSection(doc, input);
    this.renderAppointmentSection(doc, input);
    this.renderClinicalSections(doc, input.record);
    this.renderFooter(doc);

    return doc;
  }

  private renderHeader(doc: PDFDocumentType): void {
    doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .text('Life Med — Prontuário Médico', { align: 'center' })
      .moveDown(0.4);

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#666')
      .text(`Documento gerado em ${this.formatDateTime(new Date())}`, {
        align: 'center',
      })
      .fillColor('black')
      .moveDown(1.2);
  }

  private renderPatientSection(
    doc: PDFDocumentType,
    input: PatientMedicalRecordPdfInput,
  ): void {
    this.renderSectionTitle(doc, 'Paciente');

    const lines: string[] = [`Nome: ${input.patient.name}`];
    if (input.patient.cpf) lines.push(`CPF: ${input.patient.cpf}`);
    if (input.patient.dateOfBirth) {
      lines.push(
        `Data de nascimento: ${this.formatDate(input.patient.dateOfBirth)}`,
      );
    }

    doc.fontSize(11).font('Helvetica').text(lines.join('\n')).moveDown(0.8);
  }

  private renderAppointmentSection(
    doc: PDFDocumentType,
    input: PatientMedicalRecordPdfInput,
  ): void {
    this.renderSectionTitle(doc, 'Consulta');

    const specialty = input.professional.specialties.join(', ') || '—';
    const modality =
      MODALITY_LABELS[input.appointment.modality] ?? input.appointment.modality;

    const lines = [
      `Data: ${this.formatDateTime(input.appointment.dateTime)}`,
      `Profissional: ${input.professional.name}`,
      `Especialidade: ${specialty}`,
      `Modalidade: ${modality}`,
    ];

    doc.fontSize(11).font('Helvetica').text(lines.join('\n')).moveDown(0.8);
  }

  private renderClinicalSections(
    doc: PDFDocumentType,
    record: PatientMedicalRecordPdfInput['record'],
  ): void {
    const sections: { label: string; value: string | null }[] = [
      { label: 'Queixa principal', value: record.chiefComplaint },
      { label: 'Diagnóstico', value: record.diagnosis },
      { label: 'Plano terapêutico', value: record.treatmentPlan },
      { label: 'Prescrições', value: record.prescriptions },
    ];

    for (const section of sections) {
      if (!section.value) continue;
      this.renderSectionTitle(doc, section.label);
      doc.fontSize(11).font('Helvetica').text(section.value).moveDown(0.8);
    }
  }

  private renderFooter(doc: PDFDocumentType): void {
    const text = LGPD_FOOTER.replace('{date}', this.formatDateTime(new Date()));
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i += 1) {
      doc.switchToPage(i);
      doc
        .fontSize(8)
        .fillColor('#888')
        .font('Helvetica-Oblique')
        .text(text, 50, doc.page.height - 60, {
          align: 'center',
          width: doc.page.width - 100,
        })
        .fillColor('black');
    }
  }

  private renderSectionTitle(doc: PDFDocumentType, title: string): void {
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#1f2937')
      .text(title)
      .fillColor('black')
      .moveDown(0.2);
  }

  private formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  private formatDateTime(date: Date): string {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
