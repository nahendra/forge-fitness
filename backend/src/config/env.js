import 'dotenv/config';
import { z } from 'zod';

// z.coerce.boolean() is a footgun for env vars: it runs JS's Boolean(value),
// so the *string* "false" (non-empty) coerces to `true`. This parses the
// actual text instead.
const booleanString = (defaultValue) =>
  z
    .enum(['true', 'false'])
    .optional()
    .default(String(defaultValue))
    .transform((v) => v === 'true');

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  COOKIE_SECURE: booleanString(false),
  // 'strict' is correct when frontend+backend share a site (recommended — see
  // the nginx reverse-proxy setup). Split-domain deployments (e.g. frontend on
  // Vercel, backend on Railway) need 'none' + COOKIE_SECURE=true to work at all.
  COOKIE_SAMESITE: z.enum(['strict', 'lax', 'none']).default('strict'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent']).default('info'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
  AI_PROVIDER: z.enum(['none', 'anthropic', 'openai']).default('none'),
  ANTHROPIC_API_KEY: z.string().optional().default(''),
  OPENAI_API_KEY: z.string().optional().default(''),
  AI_MODEL: z.string().default('claude-sonnet-4-6'),
  AI_TIMEOUT_MS: z.coerce.number().int().positive().default(8000),

  // Public URL of the frontend — used to build links inside outgoing emails.
  APP_URL: z.string().default('http://localhost:5173'),

  // Transactional email (account-created confirmation). Defaults to a no-op
  // so the app works with zero email setup; registration never depends on
  // this succeeding.
  EMAIL_PROVIDER: z.enum(['none', 'resend', 'smtp']).default('none'),
  EMAIL_FROM: z.string().default('FORGE Fitness <onboarding@forge.fitness>'),
  RESEND_API_KEY: z.string().optional().default(''),
  SMTP_HOST: z.string().optional().default(''),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_SECURE: booleanString(false),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASSWORD: z.string().optional().default(''),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === 'production';
