import { env } from '../src/config/env.js';

describe('env boolean parsing', () => {
  it('parses the string "false" as the boolean false (not Boolean("false") === true)', () => {
    expect(env.COOKIE_SECURE).toBe(false);
    expect(typeof env.COOKIE_SECURE).toBe('boolean');
  });
});
