import { createBaseEmailTemplate } from './base.template';

export interface AccountPendingEmailProps {
  userName: string;
}

export const createAccountPendingEmail = (
  props: AccountPendingEmailProps,
): string => {
  const { userName } = props;

  const content = `
    <h2>Olá, ${userName}!</h2>
    <p>Sua conta foi criada com sucesso na plataforma <strong>LifeMed</strong>.</p>

    <div class="warning">
      <strong>Sua conta está em análise</strong>
      <ul>
        <li>Um administrador irá verificar seus dados</li>
        <li>Você receberá um e-mail assim que sua conta for aprovada</li>
        <li>Enquanto isso, você não poderá acessar a plataforma</li>
      </ul>
    </div>

    <p>Agradecemos sua paciência! Esse processo garante a segurança de todos os usuários.</p>
  `;

  return createBaseEmailTemplate({
    title: 'Conta em Análise',
    content,
    variant: 'default',
  });
};
