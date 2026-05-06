import { createBaseEmailTemplate } from './base.template';

export interface AppointmentCreatedProfessionalEmailProps {
  professionalName: string;
  patientName: string;
  date: string;
  time: string;
  modality: string;
  notes?: string;
  meetLink?: string | null;
}

export const createAppointmentCreatedProfessionalEmail = (
  props: AppointmentCreatedProfessionalEmailProps,
): string => {
  const {
    professionalName,
    patientName,
    date,
    time,
    modality,
    notes,
    meetLink,
  } = props;

  const notesRow = notes
    ? `<tr>
          <td style="color:#374151;font-size:14px;padding:4px 0;width:140px;vertical-align:top;"><strong>Observações:</strong></td>
          <td style="color:#1d4ed8;font-size:14px;padding:4px 0;">${notes}</td>
        </tr>`
    : '';

  const meetLinkRow = meetLink
    ? `<tr>
          <td style="color:#374151;font-size:14px;padding:4px 0;width:140px;vertical-align:top;"><strong>Link da videoconsulta:</strong></td>
          <td style="color:#1d4ed8;font-size:14px;padding:4px 0;word-break:break-all;"><a href="${meetLink}" style="color:#1d4ed8;text-decoration:underline;">${meetLink}</a></td>
        </tr>`
    : '';

  const meetCtaBlock = meetLink
    ? `<div style="background-color:#eff6ff;border:1px solid #bfdbfe;border-left:4px solid #3B82F6;padding:16px;border-radius:8px;margin:20px 0;text-align:center;">
        <strong style="color:#1e40af;display:block;margin-bottom:10px;">Videoconsulta</strong>
        <p style="margin:0 0 12px 0;color:#1e3a8a;font-size:14px;">A consulta será realizada por videochamada via Google Meet.</p>
        <a href="${meetLink}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background-color:#3B82F6;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:6px;font-weight:600;font-size:14px;">Acessar consulta</a>
      </div>`
    : '';

  const content = `
    <h2>Olá, ${professionalName}!</h2>
    <p>Você recebeu um novo agendamento na plataforma <strong>LifeMed</strong>.</p>

    <div style="background-color:#eff6ff;border:1px solid #bfdbfe;border-left:4px solid #3B82F6;padding:16px;border-radius:8px;margin:20px 0;">
      <strong style="color:#1e40af;display:block;margin-bottom:10px;">Detalhes do Agendamento</strong>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="color:#374151;font-size:14px;padding:4px 0;width:140px;"><strong>Paciente:</strong></td>
          <td style="color:#1d4ed8;font-size:14px;padding:4px 0;">${patientName}</td>
        </tr>
        <tr>
          <td style="color:#374151;font-size:14px;padding:4px 0;"><strong>Data:</strong></td>
          <td style="color:#1d4ed8;font-size:14px;padding:4px 0;">${date}</td>
        </tr>
        <tr>
          <td style="color:#374151;font-size:14px;padding:4px 0;"><strong>Horário:</strong></td>
          <td style="color:#1d4ed8;font-size:14px;padding:4px 0;">${time}</td>
        </tr>
        <tr>
          <td style="color:#374151;font-size:14px;padding:4px 0;"><strong>Modalidade:</strong></td>
          <td style="color:#1d4ed8;font-size:14px;padding:4px 0;">${modality}</td>
        </tr>
        ${meetLinkRow}
        ${notesRow}
      </table>
    </div>

    ${meetCtaBlock}

    <p>Acesse a plataforma para confirmar ou gerenciar seus agendamentos.</p>
  `;

  return createBaseEmailTemplate({
    title: 'Novo Agendamento',
    content,
    variant: 'default',
  });
};
