import request from 'supertest';
import { app } from '../src/app.js';
import { extractCsrf } from './helpers.js';

async function getCsrf() {
  const res = await request(app).get('/api/auth/csrf-token');
  return extractCsrf(res);
}

describe('POST /api/auth/forgot-password', () => {
  it('rejects without a CSRF token', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({ email: 'someone@example.com' });
    expect(res.status).toBe(403);
  });

  it('rejects an invalid email', async () => {
    const { token, cookieHeader } = await getCsrf();
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .set('Cookie', cookieHeader)
      .set('x-csrf-token', token)
      .send({ email: 'not-an-email' });
    expect(res.status).toBe(400);
  });

  // Deliberately does NOT assert DB-backed behaviour (no test DB in this
  // suite) — the enumeration-safe "same response either way" contract is
  // exercised against a real database in the Docker E2E pass instead.
});

describe('POST /api/auth/reset-password', () => {
  it('rejects without a CSRF token', async () => {
    const res = await request(app).post('/api/auth/reset-password').send({ token: 'x', password: 'password1' });
    expect(res.status).toBe(403);
  });

  it('rejects a weak password', async () => {
    const { token, cookieHeader } = await getCsrf();
    const res = await request(app)
      .post('/api/auth/reset-password')
      .set('Cookie', cookieHeader)
      .set('x-csrf-token', token)
      .send({ token: 'some-reset-token', password: 'short' });
    expect(res.status).toBe(400);
  });

  it('rejects a missing token', async () => {
    const { token, cookieHeader } = await getCsrf();
    const res = await request(app)
      .post('/api/auth/reset-password')
      .set('Cookie', cookieHeader)
      .set('x-csrf-token', token)
      .send({ token: '', password: 'validPassword1' });
    expect(res.status).toBe(400);
  });
});
