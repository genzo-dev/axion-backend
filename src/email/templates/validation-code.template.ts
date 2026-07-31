import { readFileSync } from 'fs';
import { join } from 'path';

const BANNER_CONTENT_ID = 'axion-banner';

let bannerAttachment: {
  content: string;
  filename: string;
  contentType: string;
  contentId: string;
} | null = null;

function getBannerAttachment() {
  if (bannerAttachment !== null) return bannerAttachment;

  try {
    const buffer = readFileSync(
      join(process.cwd(), 'assets/imgs/axion-banner.png'),
    );

    bannerAttachment = {
      content: buffer.toString('base64'),
      filename: 'axion-banner.png',
      contentType: 'image/png',
      contentId: BANNER_CONTENT_ID,
    };
  } catch {
    bannerAttachment = null;
  }

  return bannerAttachment;
}

const wrapCode = (code: string) =>
  code
    .split('')
    .map(
      (digit) =>
        `<span style="display:inline-block;margin:0 5px;">${digit}</span>`,
    )
    .join('');

export function buildValidationCodeEmail(code: string) {
  const banner = getBannerAttachment();
  const bannerHtml = banner
    ? `<img src="cid:${banner.contentId}" alt="Axion" width="520" style="display:block;width:100%;max-width:520px;"/>`
    : '';

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <link rel="preconnect" href="https://fonts.googleapis.com"/>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700&display=swap" rel="stylesheet"/>
  </head>
  <body style="margin:0;padding:0;background-color:#f5f5f5;font-family:'DM Sans',-apple-system,'Segoe UI',Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:32px 16px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e8e8e8;">
          <tr><td>${bannerHtml}</td></tr>
          <tr>
            <td style="padding:32px 32px 8px;">
              <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#000000;">Valide sua conta</h1>
              <div style="width:48px;height:4px;background-color:#ff4f00;border-radius:2px;margin-bottom:16px;"></div>
              <p style="margin:0 0 20px;font-size:15px;color:#444444;line-height:1.6;">
                Olá! Para começar a usar a <strong style="color:#000000;">Axion</strong>, confirme seu e-mail com o código abaixo:
              </p>
              <div style="background-color:#fff1ea;border:1px dashed #ff4f00;border-radius:8px;padding:24px;text-align:center;font-size:32px;font-weight:700;color:#000000;font-family:'DM Sans',Arial,sans-serif;">
                ${wrapCode(code)}
              </div>
              <p style="margin:16px 0 0;font-size:13px;color:#777777;line-height:1.5;">
                Este código é válido por <strong style="color:#ff4f00;">15 minutos</strong>. Se você não solicitou este e-mail, pode ignorá-lo com segurança.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:20px 32px 28px;border-top:1px solid #f0f0f0;">
              <p style="margin:0;font-size:12px;color:#999999;">
                <span style="color:#ff4f00;font-weight:700;">Axion</span> © 2026 · Todos os direitos reservados
              </p>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

  return {
    html,
    attachments: banner ? [banner] : [],
  };
}
