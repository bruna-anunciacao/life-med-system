import { createBaseEmailTemplate } from './base.template';

export interface AccountRejectedEmailProps {
  userName: string;
}

export const createAccountRejectedEmail = (
  props: AccountRejectedEmailProps,
): string => {
  const { userName } = props;

  const content = `
    <h2>Olá, ${userName}.</h2>
    <p>Infelizmente, sua solicitação de cadastro na plataforma <strong>LifeMed</strong> não foi aprovada pelo administrador.</p>

    <p>Caso acredite que houve um erro ou queira mais informações, entre em contato com o suporte da plataforma.</p>
  `;

  return createBaseEmailTemplate({
    title: 'Cadastro Não Aprovado',
    content,
    variant: 'destructive',
  });
};
