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

    <div style="background-color:#eff6ff;border:1px solid #bfdbfe;border-left:4px solid #3B82F6;padding:16px;border-radius:8px;margin:20px 0;">
      <strong style="color:#1e40af;display:block;margin-bottom:6px;">Sua conta está em análise</strong>
      <ul style="margin:0;padding-left:20px;">
        <li style="color:#1d4ed8;margin:4px 0;font-size:14px;">Um administrador irá verificar seus dados</li>
        <li style="color:#1d4ed8;margin:4px 0;font-size:14px;">Você receberá um e-mail assim que sua conta for aprovada</li>
        <li style="color:#1d4ed8;margin:4px 0;font-size:14px;">Enquanto isso, você não poderá acessar a plataforma</li>
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
