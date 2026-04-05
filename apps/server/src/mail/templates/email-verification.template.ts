import { createBaseEmailTemplate } from './base.template';

export interface EmailVerificationProps {
  userName: string;
  verificationUrl: string;
}

export const createEmailVerificationEmail = (
  props: EmailVerificationProps,
): string => {
  const { userName, verificationUrl } = props;

  const content = `
    <h2>Olá, ${userName}!</h2>
    <p>Obrigado por se cadastrar no LifeMed. Para ativar sua conta, confirme seu e-mail clicando no botão abaixo:</p>

    <div style="background-color:#eff6ff;border:1px solid #bfdbfe;border-left:4px solid #3B82F6;padding:16px;border-radius:8px;margin:20px 0;">
      <strong style="color:#1e40af;display:block;margin-bottom:6px;">Importante:</strong>
      <ul style="margin:0;padding-left:20px;">
        <li style="color:#1d4ed8;margin:4px 0;font-size:14px;">Este link expira em 24 horas</li>
        <li style="color:#1d4ed8;margin:4px 0;font-size:14px;">Só pode ser usado uma vez</li>
        <li style="color:#1d4ed8;margin:4px 0;font-size:14px;">Se você não criou esta conta, ignore este e-mail</li>
      </ul>
    </div>

    <p>Se não conseguir clicar no botão, copie e cole este link no navegador:</p>
    <div style="word-break:break-all;background-color:#f4f4f5;padding:12px 16px;border-radius:8px;font-size:13px;font-family:'Courier New',monospace;margin:16px 0;color:#374151;border:1px solid #e4e4e7;">
      ${verificationUrl}
    </div>
  `;

  return createBaseEmailTemplate({
    title: 'Confirmação de E-mail',
    content,
    buttonText: 'Confirmar E-mail',
    buttonUrl: verificationUrl,
    variant: 'default',
  });
};
