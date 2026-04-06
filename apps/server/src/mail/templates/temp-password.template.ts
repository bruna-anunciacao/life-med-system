import { createBaseEmailTemplate } from './base.template';

export interface TempPasswordEmailProps {
  userName: string;
  email: string;
  tempPassword: string;
  loginUrl: string;
}

export const createTempPasswordEmail = (
  props: TempPasswordEmailProps,
): string => {
  const { userName, email, tempPassword, loginUrl } = props;

  const content = `
    <h2>Olá, ${userName}!</h2>
    <p>Sua conta foi criada no LifeMed por um gestor. Use as credenciais abaixo para acessar o sistema:</p>

    <div class="warning">
      <strong>Suas credenciais de acesso:</strong>
      <ul>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Senha temporária:</strong> ${tempPassword}</li>
      </ul>
    </div>

    <p>Por segurança, recomendamos que você altere sua senha após o primeiro acesso.</p>
    <p>Se você não esperava receber este email, entre em contato com o suporte.</p>
  `;

  return createBaseEmailTemplate({
    title: 'Bem-vindo ao LifeMed',
    content,
    buttonText: 'Acessar o Sistema',
    buttonUrl: loginUrl,
    variant: 'default',
  });
};
