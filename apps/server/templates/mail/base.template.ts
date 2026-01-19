export interface BaseEmailProps {
  title: string;
  content: string;
  buttonText?: string;
  buttonUrl?: string;
  variant?: 'default' | 'destructive';
}

export const createBaseEmailTemplate = (props: BaseEmailProps): string => {
  const { title, content, buttonText, buttonUrl, variant = 'default' } = props;

  // Using design system colors - converting HSL to hex for email compatibility
  const colors = {
    primary: '#1a1a1a', // --primary: 24 9.8% 10%
    primaryForeground: '#fafaf9', // --primary-foreground: 60 9.1% 97.8%
    secondary: '#f4f4f5', // --secondary: 60 4.8% 95.9%
    destructive: '#dc2626', // --destructive: 0 84.2% 60.2%
    destructiveForeground: '#fafaf9', // --destructive-foreground: 60 9.1% 97.8%
    muted: '#71717a', // --muted-foreground: 25 5.3% 44.7%
    border: '#e4e4e7', // --border: 20 5.9% 90%
    background: '#ffffff', // --background: 0 0% 100%
    foreground: '#0a0a0a', // --foreground: 20 14.3% 4.1%
  };

  const headerColor =
    variant === 'destructive' ? colors.destructive : colors.primary;
  const buttonColor =
    variant === 'destructive' ? colors.destructive : colors.primary;
  const buttonTextColor =
    variant === 'destructive'
      ? colors.destructiveForeground
      : colors.primaryForeground;

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} - LifeMed</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: ${colors.foreground};
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: ${colors.background};
        }
        .container {
          background-color: ${colors.background};
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
        }
        .header {
          background: ${headerColor};
          color: ${colors.primaryForeground};
          padding: 32px 24px;
          text-align: center;
        }
        .header h1 {
          margin: 0 0 8px 0;
          font-size: 24px;
          font-weight: 600;
        }
        .header p {
          margin: 0;
          font-size: 16px;
          opacity: 0.9;
        }
        .content {
          background: ${colors.background};
          padding: 32px 24px;
        }
        .content h2 {
          margin: 0 0 16px 0;
          font-size: 20px;
          font-weight: 600;
          color: ${colors.foreground};
        }
        .content p {
          margin: 0 0 16px 0;
          font-size: 16px;
          color: ${colors.foreground};
        }
        .button-container {
          text-align: center;
          margin: 32px 0;
        }
        .button {
          display: inline-block;
          background: ${buttonColor};
          color: ${buttonTextColor};
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 500;
          font-size: 16px;
          transition: all 0.2s ease;
        }
        .button:hover {
          opacity: 0.9;
        }
        .footer {
          background: ${colors.secondary};
          padding: 24px;
          text-align: center;
          border-top: 1px solid ${colors.border};
        }
        .footer p {
          margin: 0;
          font-size: 14px;
          color: ${colors.muted};
        }
        .warning {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          padding: 16px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .warning strong {
          color: #92400e;
        }
        .warning ul {
          margin: 8px 0 0 0;
          padding-left: 20px;
        }
        .warning li {
          color: #92400e;
          margin: 4px 0;
        }
        .link-fallback {
          word-break: break-all;
          background: ${colors.secondary};
          padding: 12px;
          border-radius: 6px;
          font-size: 14px;
          font-family: 'Courier New', monospace;
          margin: 16px 0;
        }
        @media (max-width: 600px) {
          body {
            padding: 12px;
          }
          .header {
            padding: 24px 16px;
          }
          .content {
            padding: 24px 16px;
          }
          .footer {
            padding: 16px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>LifeMed</h1>
          <p>${title}</p>
        </div>
        <div class="content">
          ${content}
          ${
            buttonText && buttonUrl
              ? `
            <div class="button-container">
              <a href="${buttonUrl}" class="button">${buttonText}</a>
            </div>
          `
              : ''
          }
        </div>
        <div class="footer">
          <p>LifeMed</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
