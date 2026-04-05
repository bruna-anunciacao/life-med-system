export interface BaseEmailProps {
  title: string;
  content: string;
  buttonText?: string;
  buttonUrl?: string;
  variant?: 'default' | 'destructive';
}

const LOGO_SVG = `<svg width="100" height="100" viewBox="0 0 1022 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M295.538 322.922C294.659 286.752 303.989 258.135 332.13 233.956C387.657 186.244 466.839 197.91 513.63 251.051C514.917 249.564 516.258 248.127 517.653 246.742C549.189 215.253 577.647 204.496 621.126 204.446C668.394 207.625 707.445 236.003 724.131 279.386C724.941 281.484 725.724 284.624 726.759 286.483L728.028 291.757C730.143 312.979 728.235 326.946 713.736 344.223C689.517 373.089 645.462 392.677 611.379 408.097C611.226 397.657 611.19 387.216 611.289 376.776C611.379 370.025 611.685 363.188 611.298 356.454C610.749 347.061 603.837 346.411 596.232 346.719C579.465 347.398 562.689 347.238 545.922 347.225C545.895 340.49 545.733 333.068 545.94 326.405C545.985 314.86 546.525 298.513 545.184 287.42C533.835 287.29 486.331 285.988 479.557 288.811C476.54 294.17 477.825 321.991 477.864 329.756L477.639 347.276C464.335 346.984 426.5 345.747 413.971 348.918C409.139 350.141 409.734 403.731 413.128 410.151C418.033 414.044 468.102 412.276 477.824 412.195L477.903 451.74C445.565 458.794 411.203 465.703 378.053 467.301C376.047 465.633 374.071 463.933 372.123 462.2C334.048 428.433 298.717 374.99 295.538 322.922Z" fill="white"/>
<path d="M687.349 436.938L687.358 438.085C647.083 493.39 578.827 556.659 516.907 586.476C506.08 581.846 472.217 556.654 462.068 549.11C449.468 539.524 437.435 529.214 426.029 518.233C432.939 516.552 444.83 515.153 452.352 513.815C467.532 511.019 482.651 507.901 497.701 504.464C554.158 491.652 636.427 463.215 687.349 436.938Z" fill="white"/>
<path d="M626.292 648.504C636.939 648.482 646.767 648.509 657.432 649.026C659.457 689.777 657.207 741.321 657.63 782.995L631.44 783.147L631.395 714.726L631.602 688.734C628.101 696.211 592.416 760.401 588.195 763.78C586.566 764.192 585.216 764.553 583.551 764.078C579.474 762.913 544.365 696.91 539.145 687.687C540.036 718.016 539.262 752.339 539.262 782.984L512.712 783.109C513.162 744.901 512.343 706.575 512.667 668.355C512.721 661.767 512.595 655.071 513.135 648.513C524.079 648.385 535.032 648.482 545.976 648.801C559.71 672.889 573.075 697.189 586.062 721.692C589.095 714.119 597.618 699.682 601.83 692.269C610.128 677.762 618.282 663.173 626.292 648.504Z" fill="#10B981"/>
<path d="M858.501 648.769L881.1 648.951C880.164 691.276 880.551 740.253 881.235 782.674C873.477 782.916 863.46 785.045 857.421 782.08C855.342 778.675 856.071 778.053 855.981 773.432C838.674 784.881 824.985 787.08 805.428 779.002C804.465 778.559 803.988 778.329 803.07 777.802C791.955 771.361 783.9 760.711 780.732 748.259C768.816 702.912 813.888 667.579 855.171 692.558C855.072 685.508 854.019 654.109 856.098 649.259L858.501 648.769ZM834.354 761.878C843.939 759.748 847.593 757.829 854.766 750.81C855.558 731.984 860.085 706.164 832.5 705.915C831.042 705.911 829.584 705.957 828.126 706.053C811.098 710.07 801.972 724.817 806.337 741.851C808.092 748.795 812.628 754.707 818.883 758.194C823.545 760.838 829.053 761.653 834.354 761.878Z" fill="#10B981"/>
<path d="M391.429 684.643C394.77 684.508 398.113 684.434 401.455 684.42C420.724 684.477 437.201 693.188 444.906 711.168C449.369 721.578 449.037 730.965 448.965 741.941C424.499 742.284 399.569 742.052 375.069 742.062C384.682 769.324 409.383 766.186 430.629 754.428C431.918 753.714 432.88 754.717 434.108 755.381L447.178 768.511C437.904 776.024 429.069 781.691 416.938 783.406C399.41 785.883 381.78 784.222 367.236 773.415C356.466 765.458 349.398 753.462 347.653 740.183C343.832 711.019 362.388 687.962 391.429 684.643ZM375.018 723.967C386.451 724.077 397.886 724.116 409.32 724.086L425.265 723.996C418.489 706.013 410.262 703.789 391.833 705.226C381.168 710.087 379.26 712.913 375.018 723.967Z" fill="white"/>
<path d="M711.252 684.574C715.221 684.464 719.19 684.413 723.159 684.421C758.943 684.735 770.337 710.426 769.959 741.993L696.717 742.166C705.051 769.892 732.042 765.593 752.364 754.123L754.137 754.688C759.24 759.569 763.272 763.369 767.862 768.788C746.991 787.174 713.493 790.413 690.381 774.658C679.572 767.22 672.165 755.798 669.771 742.899C664.272 713.38 682.335 690.013 711.252 684.574ZM696.267 724.011C707.607 724.05 719.064 724.183 730.395 724.098L746.136 724.061C739.143 706.693 733.249 703.494 714.25 705.19C703.027 708.803 699.921 712.815 696.267 724.011Z" fill="#10B981"/>
<path d="M136.16 648.671L163.325 648.518C162.802 685.297 163.296 723.233 163.313 760.105L225.961 760.034C225.668 767.397 225.947 775.629 226.052 783.082L136.061 783.139L136.16 648.671Z" fill="white"/>
<path d="M319.931 646.854C326.774 646.094 343.347 646.43 347.911 651.914C348.156 655.835 344.916 665.323 343.661 669.592C325.251 665.409 320.034 665.475 318.491 685.662C327.273 685.372 336.784 685.581 345.628 685.619C344.967 691.78 345.205 699.638 345.215 705.954L318.832 706.064L318.882 766.707L318.881 783.03L291.923 783.063L292.014 705.999L275.919 706.004C275.634 699.576 275.739 692.08 275.691 685.559C280.691 685.375 286.799 685.597 291.886 685.644C291.456 663.336 295.858 649.708 319.931 646.854Z" fill="white"/>
<path d="M237.854 685.523L264.168 685.475L264.119 783.291C255.672 782.867 246.466 783.107 237.948 783.176L237.854 685.523Z" fill="white"/>
<path d="M245.128 646.801C270.733 643.85 275.346 667.927 256.66 675.397C233.76 678.743 225.408 655.912 245.128 646.801Z" fill="white"/>
</svg>`;

export const createBaseEmailTemplate = (props: BaseEmailProps): string => {
  const { title, content, buttonText, buttonUrl, variant = 'default' } = props;

  const colors = {
    primary: '#2563EB',
    primaryForeground: '#ffffff',
    secondary: '#f4f4f5',
    destructive: '#dc2626',
    destructiveForeground: '#ffffff',
    accent: '#10B981',
    muted: '#71717a',
    border: '#e4e4e7',
    background: '#ffffff',
    foreground: '#0a0a0a',
  };

  const headerColor = colors.primary;
  const buttonColor =
    variant === 'destructive' ? colors.destructive : '#3B82F6';

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
          background-color: #f1f5f9;
        }
        .container {
          background-color: ${colors.background};
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 24px -2px rgb(0 0 0 / 0.12), 0 2px 8px -2px rgb(0 0 0 / 0.08);
        }
        .header {
          background: ${headerColor};
          color: ${colors.primaryForeground};
          padding: 24px 24px 16px;
          text-align: center;
        }
        .header-logo {
          display: block;
          margin: 0 auto 16px;
        }
        .header-title {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          letter-spacing: -0.02em;
          opacity: 0.95;
        }
        .accent-bar {
          height: 4px;
          background: ${colors.accent};
        }
        .content {
          background: ${colors.background};
          padding: 40px 32px;
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
          color: #374151;
          line-height: 1.7;
        }
        .button-container {
          text-align: center;
          margin: 32px 0;
        }
        .button {
          display: inline-block;
          background: ${buttonColor};
          color: #ffffff;
          padding: 14px 32px;
          text-decoration: none;
          border-radius: 50px;
          font-weight: 600;
          font-size: 15px;
        }
        .footer {
          background: #f8fafc;
          padding: 24px 32px;
          text-align: center;
          border-top: 1px solid ${colors.border};
        }
        .footer p {
          margin: 0;
          font-size: 13px;
          color: ${colors.muted};
        }
        .warning {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-left: 4px solid #3B82F6;
          padding: 16px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .warning strong {
          color: #1e40af;
          display: block;
          margin-bottom: 6px;
        }
        .warning ul {
          margin: 0;
          padding-left: 20px;
        }
        .warning li {
          color: #1d4ed8;
          margin: 4px 0;
          font-size: 14px;
        }
        .link-fallback {
          word-break: break-all;
          background: ${colors.secondary};
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-family: 'Courier New', monospace;
          margin: 16px 0;
          color: #374151;
          border: 1px solid ${colors.border};
        }
        @media (max-width: 600px) {
          body {
            padding: 12px;
          }
          .header {
            padding: 28px 16px 20px;
          }
          .content {
            padding: 28px 20px;
          }
          .footer {
            padding: 20px 16px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="header-logo">${LOGO_SVG}</div>
          <p class="header-title">${title}</p>
        </div>
        <div class="accent-bar"></div>
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
          <p>Este email foi enviado automaticamente, por favor n&atilde;o responda.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
