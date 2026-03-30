import { createBaseEmailTemplate } from './base.template';

export interface AccountApprovedEmailProps {
  userName: string;
  loginUrl: string;
}

export const createAccountApprovedEmail = (
  props: AccountApprovedEmailProps,
): string => {
  const { userName, loginUrl } = props;

  const content = `
    <h2>Olá, ${userName}!</h2>
    <p>Temos uma ótima notícia! Sua conta na plataforma <strong>LifeMed</strong> foi <strong>aprovada</strong> pelo administrador.</p>

    <p>Você já pode acessar a plataforma e utilizar todos os recursos disponíveis.</p>
  `;

  return createBaseEmailTemplate({
    title: 'Conta Aprovada',
    content,
    buttonText: 'Acessar LifeMed',
    buttonUrl: loginUrl,
    variant: 'default',
  });
};
