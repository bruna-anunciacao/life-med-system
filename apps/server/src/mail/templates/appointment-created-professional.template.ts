import { createBaseEmailTemplate } from './base.template';

export interface AppointmentCreatedProfessionalEmailProps {
  professionalName: string;
  patientName: string;
  date: string;
  time: string;
  modality: string;
  notes?: string;
}

export const createAppointmentCreatedProfessionalEmail = (
  props: AppointmentCreatedProfessionalEmailProps,
): string => {
  const { professionalName, patientName, date, time, modality, notes } = props;

  const notesRow = notes
    ? `<tr>
          <td style="color:#374151;font-size:14px;padding:4px 0;width:140px;vertical-align:top;"><strong>Observações:</strong></td>
          <td style="color:#1d4ed8;font-size:14px;padding:4px 0;">${notes}</td>
        </tr>`
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
        ${notesRow}
      </table>
    </div>

    <p>Acesse a plataforma para confirmar ou gerenciar seus agendamentos.</p>
  `;

  return createBaseEmailTemplate({
    title: 'Novo Agendamento',
    content,
    variant: 'default',
  });
};
