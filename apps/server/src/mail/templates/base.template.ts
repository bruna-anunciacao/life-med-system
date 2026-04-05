export interface BaseEmailProps {
  title: string;
  content: string;
  buttonText?: string;
  buttonUrl?: string;
  variant?: 'default' | 'destructive';
}

const LOGO_URL = 'https://res.cloudinary.com/dpgdqv7hv/image/upload/f_auto,q_auto/logo-life-med-white_cgcvvw';

export const createBaseEmailTemplate = (props: BaseEmailProps): string => {
  const { title, content, buttonText, buttonUrl, variant = 'default' } = props;

  const buttonColor = variant === 'destructive' ? '#dc2626' : '#3B82F6';

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - LifeMed</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

          <!-- HEADER -->
          <tr>
            <td align="center" style="background-color:#2563EB;padding:24px 24px 16px;">
              <img src="${LOGO_URL}" alt="LifeMed" width="100" height="100" style="display:block;margin:0 auto;" />
              <p style="margin:0;font-size:18px;font-weight:600;color:#ffffff;letter-spacing:-0.02em;">${title}</p>
            </td>
          </tr>

          <!-- ACCENT BAR -->
          <tr>
            <td style="background-color:#10B981;height:4px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- CONTENT -->
          <tr>
            <td style="padding:40px 40px 32px;background-color:#ffffff;">
              <div style="font-size:16px;color:#374151;line-height:1.7;">
                ${content
                  .replace(/<h2>/g, '<h2 style="margin:0 0 16px 0;font-size:20px;font-weight:600;color:#0a0a0a;">')
                  .replace(/<p>/g, '<p style="margin:0 0 16px 0;font-size:16px;color:#374151;line-height:1.7;">')
                }
              </div>
              ${
                buttonText && buttonUrl
                  ? `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:32px 0 8px;">
                <tr>
                  <td align="center">
                    <a href="${buttonUrl}" style="display:inline-block;background-color:${buttonColor};color:#ffffff;padding:14px 40px;text-decoration:none;border-radius:50px;font-weight:600;font-size:15px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">${buttonText}</a>
                  </td>
                </tr>
              </table>`
                  : ''
              }
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td align="center" style="background-color:#f8fafc;padding:20px 32px;border-top:1px solid #e4e4e7;">
              <p style="margin:0;font-size:13px;color:#71717a;">Este email foi enviado automaticamente, por favor n&atilde;o responda.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};
