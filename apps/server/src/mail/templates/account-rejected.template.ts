import { createBaseEmailTemplate } from './base.template';

export interface AccountRejectedEmailProps {
  userName: string;
  contactEmail?: string;
}

export const createAccountRejectedEmail = (
  props: AccountRejectedEmailProps,
): string => {
  const { userName, contactEmail } = props;

  const content = `
    <h2>Olá, ${userName}.</h2>
    <p>Infelizmente, sua solicitação de cadastro na plataforma <strong>LifeMed</strong> não foi aprovada pelo administrador.</p>

    <div style="background-color:#eff6ff;border:1px solid #bfdbfe;border-left:4px solid #3B82F6;padding:16px;border-radius:8px;margin:20px 0;">
      <strong style="color:#1e40af;display:block;margin-bottom:6px;">Acredita que foi um engano?</strong>
      <p style="margin:8px 0 0 0;color:#1d4ed8;font-size:14px;">
        Se você acredita que houve um erro na avaliação da sua conta, entre em contato com a equipe de administração pelo e-mail abaixo e explique sua situação.
      </p>
    </div>

    <div style="text-align: center; margin: 24px 0;">
      <a href="mailto:${contactEmail || 'contato@lifemed.com'}" style="color: #2563EB; font-size: 15px; font-weight: 600; text-decoration: none;">
        ${contactEmail || 'contato@lifemed.com'}
      </a>
    </div>
  `;

  return createBaseEmailTemplate({
    title: 'Cadastro Não Aprovado',
    content,
    variant: 'destructive',
  });
};
