import { Injectable, NotFoundException } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import type PDFKit from 'pdfkit';
import { AppointmentReportItemDto } from './dto/appointment-made.dto';

@Injectable()
export class ReportsService {
  generateDoneAppointmentsPdf(
    appointments: AppointmentReportItemDto[],
  ): PDFKit.PDFDocument {
    return this.generateAppointmentsPdf(
      'Relatório de Consultas Concluídas',
      'COMPLETED',
      appointments,
    );
  }

  generatePendingAppointmentsPdf(
    appointments: AppointmentReportItemDto[],
  ): PDFKit.PDFDocument {
    return this.generateAppointmentsPdf(
      'Relatório de Consultas Pendentes',
      'PENDING',
      appointments,
    );
  }

  generateCancelledAppointmentsPdf(
    appointments: AppointmentReportItemDto[],
  ): PDFKit.PDFDocument {
    return this.generateAppointmentsPdf(
      'Relatório de Consultas Canceladas',
      'CANCELLED',
      appointments,
    );
  }

  private generateAppointmentsPdf(
    title: string,
    status: 'COMPLETED' | 'PENDING' | 'CANCELLED',
    appointments: AppointmentReportItemDto[],
  ): PDFKit.PDFDocument {
    if (!appointments.length) {
      throw new NotFoundException(
        'Nenhum agendamento encontrado para os filtros informados',
      );
    }

    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      bufferPages: true,
    });

    doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .text(title, { align: 'center' })
      .moveDown(0.5);

    doc
      .fontSize(10)
      .font('Helvetica')
      .text(
        `Gerado em: ${new Date().toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}`,
        { align: 'center' },
      )
      .moveDown(0.5);

    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .text(`Status: ${status}`, { align: 'center' })
      .moveDown(0.5);

    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .text(`Total de agendamentos: ${appointments.length}`, {
        align: 'center',
      })
      .moveDown(1.5);

    let yPosition = doc.y;
    const startX = 50;
    const tableWidth = doc.page.width - 100;

    const colWidths = {
      number: 25,
      date: 90,
      patient: 90,
      professional: 90,
      specialty: 70,
      modality: 60,
      price: 50,
      notes: 95,
    };

    const drawHeader = () => {
      doc
        .fontSize(8)
        .font('Helvetica-Bold')
        .text('#', startX, yPosition)
        .text('Data/Hora', startX + colWidths.number, yPosition)
        .text('Paciente', startX + colWidths.number + colWidths.date, yPosition)
        .text(
          'Profissional',
          startX + colWidths.number + colWidths.date + colWidths.patient,
          yPosition,
        )
        .text(
          'Especialidade',
          startX +
            colWidths.number +
            colWidths.date +
            colWidths.patient +
            colWidths.professional,
          yPosition,
        )
        .text(
          'Modalidade',
          startX +
            colWidths.number +
            colWidths.date +
            colWidths.patient +
            colWidths.professional +
            colWidths.specialty,
          yPosition,
        )
        .text(
          'Valor',
          startX +
            colWidths.number +
            colWidths.date +
            colWidths.patient +
            colWidths.professional +
            colWidths.specialty +
            colWidths.modality,
          yPosition,
        );

      yPosition += 12;
      doc
        .moveTo(startX, yPosition)
        .lineTo(startX + tableWidth, yPosition)
        .stroke();
      yPosition += 6;
    };

    drawHeader();

    appointments.forEach((appointment, index) => {
      if (yPosition > doc.page.height - 90) {
        doc.addPage();
        yPosition = 50;
        drawHeader();
      }

      doc
        .fontSize(7)
        .font('Helvetica')
        .text(String(index + 1), startX, yPosition, {
          width: colWidths.number,
          ellipsis: true,
        })
        .text(
          appointment.dateTime.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          startX + colWidths.number,
          yPosition,
          {
            width: colWidths.date,
            ellipsis: true,
          },
        )
        .text(
          appointment.patientName || '-',
          startX + colWidths.number + colWidths.date,
          yPosition,
          {
            width: colWidths.patient,
            ellipsis: true,
          },
        )
        .text(
          appointment.professionalName || '-',
          startX + colWidths.number + colWidths.date + colWidths.patient,
          yPosition,
          {
            width: colWidths.professional,
            ellipsis: true,
          },
        )
        .text(
          appointment.specialty || '-',
          startX +
            colWidths.number +
            colWidths.date +
            colWidths.patient +
            colWidths.professional,
          yPosition,
          {
            width: colWidths.specialty,
            ellipsis: true,
          },
        )
        .text(
          appointment.modality || '-',
          startX +
            colWidths.number +
            colWidths.date +
            colWidths.patient +
            colWidths.professional +
            colWidths.specialty,
          yPosition,
          {
            width: colWidths.modality,
            ellipsis: true,
          },
        )
        .text(
          appointment.price ? `R$ ${appointment.price.toFixed(2)}` : '-',
          startX +
            colWidths.number +
            colWidths.date +
            colWidths.patient +
            colWidths.professional +
            colWidths.specialty +
            colWidths.modality,
          yPosition,
          {
            width: colWidths.price,
            ellipsis: true,
          },
        );

      yPosition += 12;
    });

    const pages = doc.bufferedPageRange();
    for (let pageIndex = 0; pageIndex < pages.count; pageIndex++) {
      doc.switchToPage(pageIndex);
      doc
        .fontSize(8)
        .font('Helvetica')
        .text(
          `Página ${pageIndex + 1} de ${pages.count}`,
          0,
          doc.page.height - 30,
          {
            align: 'center',
          },
        );
    }

    return doc;
  }
}
