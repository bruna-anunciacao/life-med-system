import { createBaseEmailTemplate } from './base.template';

export interface PasswordResetEmailProps {
  nome: string;
  resetUrl: string;
}

export const createPasswordResetEmail = (
  props: PasswordResetEmailProps,
): string => {
  const { nome, resetUrl } = props;

  const content = `
    <h2>Olá, ${nome}!</h2>
    <p>Você solicitou a recuperação de senha para sua conta no LifeMed.</p>
    <p>Para redefinir sua senha, clique no botão abaixo:</p>
    
    <div class="warning">
      <strong>⚠️ Importante:</strong>
      <ul>
        <li>Este link expira em 1 hora</li>
        <li>Só pode ser usado uma vez</li>
        <li>Se você não solicitou esta recuperação, ignore este email</li>
      </ul>
    </div>
    
    <p>Se você não conseguir clicar no botão, copie e cole este link no seu navegador:</p>
    <div class="link-fallback">
      ${resetUrl}
    </div>
  `;

  return createBaseEmailTemplate({
    title: 'Recuperação de Senha',
    content,
    buttonText: 'Redefinir Senha',
    buttonUrl: resetUrl,
    variant: 'default',
  });
};
