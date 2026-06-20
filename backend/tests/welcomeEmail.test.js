import { buildWelcomeEmail } from '../src/templates/welcomeEmail.js';

describe('buildWelcomeEmail', () => {
  const result = buildWelcomeEmail({ name: 'Jane Doe', email: 'jane@example.com', appUrl: 'https://forge.example.com' });

  it('returns a subject, html, and text body', () => {
    expect(result.subject).toMatch(/FORGE/);
    expect(result.html).toContain('<!DOCTYPE html>');
    expect(result.text.length).toBeGreaterThan(0);
  });

  it('includes the recipient name and email in both formats', () => {
    expect(result.html).toContain('Jane Doe');
    expect(result.html).toContain('jane@example.com');
    expect(result.text).toContain('Jane Doe');
    expect(result.text).toContain('jane@example.com');
  });

  it('links to the dashboard using the provided app URL', () => {
    expect(result.html).toContain('https://forge.example.com/dashboard');
    expect(result.text).toContain('https://forge.example.com/dashboard');
  });

  it('escapes HTML special characters in the name to prevent injection', () => {
    const malicious = buildWelcomeEmail({
      name: '<script>alert(1)</script>',
      email: 'evil@example.com',
      appUrl: 'https://forge.example.com',
    });
    expect(malicious.html).not.toContain('<script>alert(1)</script>');
    expect(malicious.html).toContain('&lt;script&gt;');
  });

  it('strips a trailing slash from appUrl when building links', () => {
    const withSlash = buildWelcomeEmail({ name: 'A', email: 'a@example.com', appUrl: 'https://forge.example.com/' });
    expect(withSlash.html).toContain('https://forge.example.com/dashboard');
    expect(withSlash.html).not.toContain('.com//dashboard');
  });
});
