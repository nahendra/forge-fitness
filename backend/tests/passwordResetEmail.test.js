import { buildPasswordResetEmail } from '../src/templates/passwordResetEmail.js';

describe('buildPasswordResetEmail', () => {
  const result = buildPasswordResetEmail({
    name: 'Jane',
    resetUrl: 'https://forge.example.com/reset-password?token=abc123',
    expiresInMinutes: 60,
  });

  it('returns a subject, html, and text body', () => {
    expect(result.subject).toMatch(/Reset/);
    expect(result.html).toContain('<!DOCTYPE html>');
    expect(result.text.length).toBeGreaterThan(0);
  });

  it('includes the reset link and expiry in both formats', () => {
    expect(result.html).toContain('https://forge.example.com/reset-password?token=abc123');
    expect(result.html).toContain('60 minutes');
    expect(result.text).toContain('https://forge.example.com/reset-password?token=abc123');
    expect(result.text).toContain('60 minutes');
  });

  it('escapes HTML special characters in the name', () => {
    const malicious = buildPasswordResetEmail({
      name: '<script>alert(1)</script>',
      resetUrl: 'https://forge.example.com/reset-password?token=x',
      expiresInMinutes: 60,
    });
    expect(malicious.html).not.toContain('<script>alert(1)</script>');
    expect(malicious.html).toContain('&lt;script&gt;');
  });
});
