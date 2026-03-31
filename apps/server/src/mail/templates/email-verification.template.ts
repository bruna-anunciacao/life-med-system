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

    <div class="warning">
      <strong>Importante:</strong>
      <ul>
        <li>Este link expira em 24 horas</li>
        <li>Só pode ser usado uma vez</li>
        <li>Se você não criou esta conta, ignore este e-mail</li>
      </ul>
    </div>

    <p>Se não conseguir clicar no botão, copie e cole este link no navegador:</p>
    <div class="link-fallback">
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
