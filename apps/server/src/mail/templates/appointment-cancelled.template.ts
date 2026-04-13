import { createBaseEmailTemplate } from './base.template';

export interface AppointmentCancelledEmailProps {
  recipientName: string;
  patientName: string;
  professionalName: string;
  date: string;
  time: string;
  reason?: string;
}

export const createAppointmentCancelledEmail = (
  props: AppointmentCancelledEmailProps,
): string => {
  const { recipientName, patientName, professionalName, date, time, reason } =
    props;

  const reasonRow = reason
    ? `<tr>
          <td style="color:#374151;font-size:14px;padding:4px 0;width:140px;vertical-align:top;"><strong>Motivo:</strong></td>
          <td style="color:#991b1b;font-size:14px;padding:4px 0;">${reason}</td>
        </tr>`
    : '';

  const content = `
    <h2>Olá, ${recipientName}!</h2>
    <p>Informamos que o seguinte agendamento foi <strong>cancelado</strong> na plataforma <strong>LifeMed</strong>.</p>

    <div style="background-color:#fef2f2;border:1px solid #fecaca;border-left:4px solid #dc2626;padding:16px;border-radius:8px;margin:20px 0;">
      <strong style="color:#991b1b;display:block;margin-bottom:10px;">Detalhes do Agendamento Cancelado</strong>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="color:#374151;font-size:14px;padding:4px 0;width:140px;"><strong>Paciente:</strong></td>
          <td style="color:#991b1b;font-size:14px;padding:4px 0;">${patientName}</td>
        </tr>
        <tr>
          <td style="color:#374151;font-size:14px;padding:4px 0;"><strong>Profissional:</strong></td>
          <td style="color:#991b1b;font-size:14px;padding:4px 0;">${professionalName}</td>
        </tr>
        <tr>
          <td style="color:#374151;font-size:14px;padding:4px 0;"><strong>Data:</strong></td>
          <td style="color:#991b1b;font-size:14px;padding:4px 0;">${date}</td>
        </tr>
        <tr>
          <td style="color:#374151;font-size:14px;padding:4px 0;"><strong>Horário:</strong></td>
          <td style="color:#991b1b;font-size:14px;padding:4px 0;">${time}</td>
        </tr>
        ${reasonRow}
      </table>
    </div>

    <p>Se você tiver dúvidas, entre em contato com o suporte da plataforma.</p>
  `;

  return createBaseEmailTemplate({
    title: 'Agendamento Cancelado',
    content,
    variant: 'destructive',
  });
};
