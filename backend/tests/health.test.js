import request from 'supertest';
import { app } from '../src/app.js';
import { extractCsrf } from './helpers.js';

describe('GET /api/health', () => {
  it('returns 200 and status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('CSRF protection', () => {
  it('rejects a mutating request with no CSRF token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'csrf-check@example.com', password: 'password1' });
    expect(res.status).toBe(403);
  });
});

describe('Auth validation (with valid CSRF token)', () => {
  async function getCsrf() {
    const res = await request(app).get('/api/auth/csrf-token');
    return extractCsrf(res);
  }

  it('rejects registration with an invalid email', async () => {
    const { token, cookieHeader } = await getCsrf();
    const res = await request(app)
      .post('/api/auth/register')
      .set('Cookie', cookieHeader)
      .set('x-csrf-token', token)
      .send({ name: 'Test', email: 'not-an-email', password: 'password1' });
    expect(res.status).toBe(400);
  });

  it('rejects registration with a weak password', async () => {
    const { token, cookieHeader } = await getCsrf();
    const res = await request(app)
      .post('/api/auth/register')
      .set('Cookie', cookieHeader)
      .set('x-csrf-token', token)
      .send({ name: 'Test', email: 'test@example.com', password: 'short' });
    expect(res.status).toBe(400);
  });
});

describe('Unknown route', () => {
  it('returns 404', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
  });
});
