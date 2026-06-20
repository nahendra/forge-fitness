// Shared constants/helpers for transactional emails. Table layout + inline
// styles throughout (not <style> blocks) because most email clients strip
// or poorly support stylesheets — this is the actual industry-standard way
// to ship a reliably-rendering email, not a stylistic choice.

export const COLORS = {
  bg: '#070707',
  card: '#0f0f0f',
  border: '#1e1e1e',
  orange: '#ff4500',
  white: '#f4efe8',
  muted: '#8a8580',
  red: '#ff3d5a',
};

export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Precomputed rgba() pairs rather than dynamic hex+alpha — 8-digit hex color
// notation isn't reliably supported across email clients (notably Outlook
// desktop), so rgba() is the safer, more compatible choice here.
const BADGE_VARIANTS = {
  orange: { text: COLORS.orange, bg: 'rgba(255,69,0,0.12)', border: 'rgba(255,69,0,0.3)' },
  red: { text: COLORS.red, bg: 'rgba(255,61,90,0.1)', border: 'rgba(255,61,90,0.3)' },
};

export function emailShell({ title, badge, variant = 'orange', bodyHtml }) {
  const badgeColor = BADGE_VARIANTS[variant] || BADGE_VARIANTS.orange;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:${COLORS.bg};font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.bg};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:${COLORS.card};border:1px solid ${COLORS.border};border-radius:8px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="padding:28px 32px 0 32px;">
              <span style="font-size:24px;font-weight:800;letter-spacing:0.04em;color:${COLORS.orange};">FORGE</span><span style="font-size:24px;font-weight:800;color:${COLORS.white};">.</span>
            </td>
          </tr>

          <!-- Badge -->
          <tr>
            <td style="padding:20px 32px 0 32px;">
              <div style="display:inline-block;background:${badgeColor.bg};border:1px solid ${badgeColor.border};color:${badgeColor.text};font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:5px 10px;border-radius:3px;">
                ${badge}
              </div>
            </td>
          </tr>

          ${bodyHtml}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
