import { test, expect } from '@playwright/test';

function decodeJwtPayload(token: string): Record<string, unknown> {
  const payload = token.split('.')[1];
  if (!payload) throw new Error('JWT sem payload');
  const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  return JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));
}

test.describe('@integration PS_Login -> PS_Gateway -> PS_Contrato', () => {
  test('JWT deve carregar tenant e permitir consulta tenant-aware', async ({ request }) => {
    const loginUrl = process.env.PS_LOGIN_URL;
    const email = process.env.QA_LOGIN_EMAIL;
    const password = process.env.QA_LOGIN_PASSWORD;

    test.skip(!loginUrl || !email || !password, 'Credenciais de QA não configuradas');

    const loginResponse = await request.post(`${loginUrl}/auth/login`, {
      data: { email, password }
    });
    expect(loginResponse.ok()).toBeTruthy();

    const loginBody = await loginResponse.json();
    expect(loginBody.accessToken).toBeTruthy();
    expect(loginBody.tokenType.toLowerCase()).toBe('bearer');

    const claims = decodeJwtPayload(loginBody.accessToken);
    expect(claims.sub).toBeTruthy();
    expect(claims.empresaId).toBeTruthy();

    const contractsResponse = await request.get('/api/contracts', {
      headers: { Authorization: `Bearer ${loginBody.accessToken}` }
    });
    expect(contractsResponse.ok()).toBeTruthy();
  });

  test('spoof de tenant não deve alterar o tenant derivado do JWT', async ({ request }) => {
    const loginUrl = process.env.PS_LOGIN_URL;
    const email = process.env.QA_LOGIN_EMAIL;
    const password = process.env.QA_LOGIN_PASSWORD;

    test.skip(!loginUrl || !email || !password, 'Credenciais de QA não configuradas');

    const loginResponse = await request.post(`${loginUrl}/auth/login`, {
      data: { email, password }
    });
    expect(loginResponse.ok()).toBeTruthy();
    const { accessToken } = await loginResponse.json();

    const baseline = await request.get('/api/contracts', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    expect(baseline.ok()).toBeTruthy();

    const spoofed = await request.get('/api/contracts', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Actor-Empresa-Id': '00000000-0000-0000-0000-000000000999',
        'X-Internal-Key': 'spoofed'
      }
    });
    expect(spoofed.ok()).toBeTruthy();
    expect(await spoofed.text()).toBe(await baseline.text());
  });
});
