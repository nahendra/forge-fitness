import { COLORS, escapeHtml, emailShell } from './emailShared.js';

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

  const bodyHtml = `
    <tr>
      <td style="padding:16px 32px 0 32px;">
        <h1 style="margin:0;color:${COLORS.white};font-size:24px;line-height:1.3;font-weight:800;">
          Welcome aboard, ${safeName}.
        </h1>
        <p style="margin:10px 0 0 0;color:${COLORS.muted};font-size:14px;line-height:1.6;">
          Your FORGE account has been created for <strong style="color:${COLORS.white};">${escapeHtml(email)}</strong>.
          You're ready to build your first plan and log your first session.
        </p>
      </td>
    </tr>

    <tr>
      <td style="padding:24px 32px 0 32px;">
        <a href="${dashboardUrl}" style="display:block;text-align:center;background:${COLORS.orange};color:#000000;font-size:15px;font-weight:800;letter-spacing:0.02em;text-decoration:none;padding:13px 20px;border-radius:4px;">
          Go to Your Dashboard →
        </a>
      </td>
    </tr>

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

    <tr>
      <td style="padding:24px 32px 28px 32px;border-top:1px solid ${COLORS.border};">
        <p style="margin:0;color:${COLORS.muted};font-size:12px;line-height:1.6;">
          You're receiving this email because an account was created at FORGE Fitness using this
          email address. If this wasn't you, you can safely ignore this message.
        </p>
      </td>
    </tr>`;

  const html = emailShell({ title: 'Welcome to FORGE', badge: 'Account Created', variant: 'orange', bodyHtml });

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
