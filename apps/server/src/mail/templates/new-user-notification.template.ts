import { createBaseEmailTemplate } from './base.template';

export interface NewUserNotificationEmailProps {
  adminName: string;
  userName: string;
  userEmail: string;
  approveUrl: string;
}

export const createNewUserNotificationEmail = (
  props: NewUserNotificationEmailProps,
): string => {
  const { adminName, userName, userEmail, approveUrl } = props;

  const roleLabel = 'Profissional';

  const content = `
    <h2>Olá, ${adminName}!</h2>
    <p>Um novo usuário solicitou cadastro na plataforma LifeMed.</p>

    <div style="background: #f4f4f5; padding: 16px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 4px 0;"><strong>Nome:</strong> ${userName}</p>
      <p style="margin: 4px 0;"><strong>Email:</strong> ${userEmail}</p>
      <p style="margin: 4px 0;"><strong>Tipo:</strong> ${roleLabel}</p>
    </div>

    <p>Acesse o painel administrativo para aprovar ou rejeitar esta solicitação:</p>
  `;

  return createBaseEmailTemplate({
    title: 'Nova Solicitação de Cadastro',
    content,
    buttonText: 'Ver Solicitação',
    buttonUrl: approveUrl,
    variant: 'default',
  });
};
