export function extractCsrf(res) {
  const setCookie = res.headers['set-cookie'] || [];
  const csrfCookie = setCookie.find((c) => c.startsWith('forge_csrf='));
  const token = csrfCookie?.split(';')[0]?.split('=')[1];
  return { token, cookieHeader: setCookie.map((c) => c.split(';')[0]).join('; ') };
}
