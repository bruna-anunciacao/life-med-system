export interface MassCancellationEmailProps {
  recipientName: string;
  professionalName: string;
  date: string;
  time: string;
  rescheduleUrl: string;
}

export const createMassCancellationEmail = (
  props: MassCancellationEmailProps,
): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #f8fafc; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { padding: 30px 20px; background-color: #ffffff; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px; }
    .footer { text-align: center; padding: 20px; color: #64748b; font-size: 14px; }
    .button { display: inline-block; padding: 12px 24px; background-color: #0f172a; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin:0;color:#0f172a;">Cancelamento de Consulta</h2>
    </div>
    
    <div class="content">
      <p>Olá, <strong>${props.recipientName}</strong>,</p>
      
      <p>Informamos que, devido a um imprevisto, o profissional <strong>${props.professionalName}</strong> precisou cancelar a sua consulta agendada para o dia <strong>${props.date}</strong> às <strong>${props.time}</strong>.</p>
      
      <p>Pedimos sinceras desculpas pelo transtorno. Por favor, acesse a plataforma para agendar um novo horário que seja conveniente para você.</p>
      
      <div style="text-align: center;">
        <a href="${props.rescheduleUrl}" class="button">Agendar Nova Consulta</a>
      </div>
      
      <p style="margin-top: 30px;">Atenciosamente,<br>Equipe LifeMed</p>
    </div>
    
    <div class="footer">
      <p>Este é um e-mail automático, por favor não responda.</p>
    </div>
  </div>
</body>
</html>
  `;
};
