import { COLORS, escapeHtml, emailShell } from './emailShared.js';

export function buildPasswordResetEmail({ name, resetUrl, expiresInMinutes }) {
  const safeName = escapeHtml(name);

  const bodyHtml = `
    <tr>
      <td style="padding:16px 32px 0 32px;">
        <h1 style="margin:0;color:${COLORS.white};font-size:24px;line-height:1.3;font-weight:800;">
          Reset your password
        </h1>
        <p style="margin:10px 0 0 0;color:${COLORS.muted};font-size:14px;line-height:1.6;">
          Hi ${safeName}, we received a request to reset the password on your FORGE account. Click the
          button below to choose a new one. This link expires in <strong style="color:${COLORS.white};">${expiresInMinutes} minutes</strong>.
        </p>
      </td>
    </tr>

    <tr>
      <td style="padding:24px 32px 0 32px;">
        <a href="${resetUrl}" style="display:block;text-align:center;background:${COLORS.orange};color:#000000;font-size:15px;font-weight:800;letter-spacing:0.02em;text-decoration:none;padding:13px 20px;border-radius:4px;">
          Reset Password →
        </a>
      </td>
    </tr>

    <tr>
      <td style="padding:20px 32px 0 32px;">
        <p style="margin:0;color:${COLORS.muted};font-size:12px;line-height:1.6;">
          If the button doesn't work, copy and paste this link into your browser:<br />
          <a href="${resetUrl}" style="color:${COLORS.orange};word-break:break-all;">${resetUrl}</a>
        </p>
      </td>
    </tr>

    <tr>
      <td style="padding:24px 32px 28px 32px;border-top:1px solid ${COLORS.border};margin-top:20px;padding-top:20px;">
        <p style="margin:0;color:${COLORS.muted};font-size:12px;line-height:1.6;">
          If you didn't request a password reset, you can safely ignore this email — your password
          will not be changed. This link can only be used once.
        </p>
      </td>
    </tr>`;

  const html = emailShell({ title: 'Reset your FORGE password', badge: 'Password Reset Requested', variant: 'red', bodyHtml });

  const text = [
    `Hi ${name},`,
    '',
    'We received a request to reset the password on your FORGE account.',
    `This link expires in ${expiresInMinutes} minutes and can only be used once:`,
    '',
    resetUrl,
    '',
    "If you didn't request this, you can safely ignore this email — your password will not be changed.",
  ].join('\n');

  return {
    subject: 'Reset your FORGE password 🔑',
    html,
    text,
  };
}
