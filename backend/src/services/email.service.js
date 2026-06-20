import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { buildWelcomeEmail } from '../templates/welcomeEmail.js';

let cachedTransporter = null;

async function sendViaSmtp({ to, subject, html, text }) {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASSWORD) {
    throw new Error('EMAIL_PROVIDER=smtp but SMTP_HOST/SMTP_USER/SMTP_PASSWORD are not fully set');
  }

  if (!cachedTransporter) {
    // Lazy import — most deployments never touch this path (EMAIL_PROVIDER
    // defaults to "none"), so there's no reason to load nodemailer eagerly.
    const nodemailer = await import('nodemailer');
    cachedTransporter = nodemailer.default.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
    });
  }

  await cachedTransporter.sendMail({ from: env.EMAIL_FROM, to, subject, html, text });
}

async function sendViaResend({ to, subject, html, text }) {
  if (!env.RESEND_API_KEY) {
    throw new Error('EMAIL_PROVIDER=resend but RESEND_API_KEY is not set');
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({ from: env.EMAIL_FROM, to, subject, html, text }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Resend API error: ${res.status} ${body}`);
  }
}

const PROVIDERS = { smtp: sendViaSmtp, resend: sendViaResend };

/**
 * Fire-and-forget by design: email delivery must never block or fail the
 * account-creation request. Callers should NOT await this in the critical
 * path — call it, let it run, and it logs its own success/failure.
 */
export async function sendWelcomeEmail({ name, email }) {
  if (env.EMAIL_PROVIDER === 'none') {
    logger.info({ email }, 'EMAIL_PROVIDER=none — skipping welcome email');
    return;
  }

  try {
    const { subject, html, text } = buildWelcomeEmail({ name, email, appUrl: env.APP_URL });
    const send = PROVIDERS[env.EMAIL_PROVIDER];
    await send({ to: email, subject, html, text });
    logger.info({ email, provider: env.EMAIL_PROVIDER }, 'Welcome email sent');
  } catch (err) {
    logger.warn({ email, provider: env.EMAIL_PROVIDER, err: err.message }, 'Failed to send welcome email');
  }
}
