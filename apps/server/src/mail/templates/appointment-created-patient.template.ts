import { createBaseEmailTemplate } from './base.template';

export interface AppointmentCreatedPatientEmailProps {
  patientName: string;
  professionalName: string;
  date: string;
  time: string;
  modality: string;
  meetLink?: string | null;
}

export const createAppointmentCreatedPatientEmail = (
  props: AppointmentCreatedPatientEmailProps,
): string => {
  const { patientName, professionalName, date, time, modality, meetLink } =
    props;

  const meetLinkRow = meetLink
    ? `<tr>
          <td style="color:#374151;font-size:14px;padding:4px 0;vertical-align:top;"><strong>Link da videoconsulta:</strong></td>
          <td style="color:#1d4ed8;font-size:14px;padding:4px 0;word-break:break-all;"><a href="${meetLink}" style="color:#1d4ed8;text-decoration:underline;">${meetLink}</a></td>
        </tr>`
    : '';

  const meetCtaBlock = meetLink
    ? `<div style="background-color:#eff6ff;border:1px solid #bfdbfe;border-left:4px solid #3B82F6;padding:16px;border-radius:8px;margin:20px 0;text-align:center;">
        <strong style="color:#1e40af;display:block;margin-bottom:10px;">Videoconsulta</strong>
        <p style="margin:0 0 12px 0;color:#1e3a8a;font-size:14px;">Sua consulta será realizada por videochamada via Google Meet.</p>
        <a href="${meetLink}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background-color:#3B82F6;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:6px;font-weight:600;font-size:14px;">Acessar consulta</a>
      </div>`
    : '';

  const content = `
    <h2>Olá, ${patientName}!</h2>
    <p>Seu agendamento foi realizado com sucesso na plataforma <strong>LifeMed</strong>.</p>

    <div style="background-color:#eff6ff;border:1px solid #bfdbfe;border-left:4px solid #3B82F6;padding:16px;border-radius:8px;margin:20px 0;">
      <strong style="color:#1e40af;display:block;margin-bottom:10px;">Detalhes do Agendamento</strong>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="color:#374151;font-size:14px;padding:4px 0;width:140px;"><strong>Profissional:</strong></td>
          <td style="color:#1d4ed8;font-size:14px;padding:4px 0;">${professionalName}</td>
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
      </table>
    </div>

    ${meetCtaBlock}

    <div style="background-color:#fefce8;border:1px solid #fde68a;border-left:4px solid #f59e0b;padding:16px;border-radius:8px;margin:20px 0;">
      <strong style="color:#92400e;display:block;margin-bottom:6px;">Aguardando confirmação</strong>
      <p style="margin:0;color:#78350f;font-size:14px;">Seu agendamento está <strong>pendente de confirmação</strong> pelo profissional. Você será notificado assim que ele for confirmado.</p>
    </div>

    <p>Caso precise cancelar, lembre-se de fazê-lo com pelo menos 6 horas de antecedência.</p>
  `;

  return createBaseEmailTemplate({
    title: 'Agendamento Realizado',
    content,
    variant: 'default',
  });
};
