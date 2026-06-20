// Transactional "account created" email. Built with a table layout and
// inline styles on purpose — most email clients (Outlook desktop, Gmail
// clipping, etc.) strip <style> blocks and don't support modern CSS, so this
// is the actual industry-standard way to ship a reliably-rendering email,
// not a stylistic choice.

const COLORS = {
  bg: '#070707',
  card: '#0f0f0f',
  border: '#1e1e1e',
  orange: '#ff4500',
  white: '#f4efe8',
  muted: '#8a8580',
};

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const FEATURES = [
  { icon: '⚡', label: 'AI Plan Generator', desc: 'A complete training + macro plan for your body type and goal' },
  { icon: '💪', label: 'Workout Tracker', desc: 'Log sets and reps — we detect PRs and plateaus automatically' },
  { icon: '📊', label: 'Progress Dashboard', desc: 'Weight, strength, and volume trends, visualised weekly' },
  { icon: '🏆', label: 'Community Leaderboard', desc: 'See how your training stacks up against other athletes' },
];

export function buildWelcomeEmail({ name, email, appUrl }) {
  const safeName = escapeHtml(name);
  const dashboardUrl = `${appUrl.replace(/\/$/, '')}/dashboard`;

  const featureRows = FEATURES.map(
    (f) => `
      <tr>
        <td style="padding:10px 0;vertical-align:top;width:36px;font-size:20px;line-height:1.4;">${f.icon}</td>
        <td style="padding:10px 0;vertical-align:top;">
          <div style="color:${COLORS.white};font-size:14px;font-weight:700;line-height:1.4;">${f.label}</div>
          <div style="color:${COLORS.muted};font-size:13px;line-height:1.5;margin-top:2px;">${f.desc}</div>
        </td>
      </tr>`
  ).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Welcome to FORGE</title>
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

          <!-- Headline -->
          <tr>
            <td style="padding:20px 32px 0 32px;">
              <div style="display:inline-block;background:rgba(255,69,0,0.12);border:1px solid rgba(255,69,0,0.3);color:${COLORS.orange};font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:5px 10px;border-radius:3px;">
                Account Created
              </div>
              <h1 style="margin:16px 0 0 0;color:${COLORS.white};font-size:24px;line-height:1.3;font-weight:800;">
                Welcome aboard, ${safeName}.
              </h1>
              <p style="margin:10px 0 0 0;color:${COLORS.muted};font-size:14px;line-height:1.6;">
                Your FORGE account has been created for <strong style="color:${COLORS.white};">${escapeHtml(email)}</strong>.
                You're ready to build your first plan and log your first session.
              </p>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:24px 32px 0 32px;">
              <a href="${dashboardUrl}" style="display:block;text-align:center;background:${COLORS.orange};color:#000000;font-size:15px;font-weight:800;letter-spacing:0.02em;text-decoration:none;padding:13px 20px;border-radius:4px;">
                Go to Your Dashboard →
              </a>
            </td>
          </tr>

          <!-- Features -->
          <tr>
            <td style="padding:28px 32px 8px 32px;border-top:1px solid ${COLORS.border};margin-top:24px;">
              <div style="color:${COLORS.muted};font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding-top:20px;">
                What you can do now
              </div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${featureRows}
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px 28px 32px;border-top:1px solid ${COLORS.border};">
              <p style="margin:0;color:${COLORS.muted};font-size:12px;line-height:1.6;">
                You're receiving this email because an account was created at FORGE Fitness using this
                email address. If this wasn't you, you can safely ignore this message.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    `Welcome to FORGE, ${name}.`,
    '',
    `Your account has been created for ${email}.`,
    '',
    'What you can do now:',
    ...FEATURES.map((f) => `- ${f.label}: ${f.desc}`),
    '',
    `Go to your dashboard: ${dashboardUrl}`,
    '',
    "You're receiving this email because an account was created at FORGE Fitness using this email address.",
  ].join('\n');

  return {
    subject: 'Your FORGE account is ready 🔥',
    html,
    text,
  };
}
