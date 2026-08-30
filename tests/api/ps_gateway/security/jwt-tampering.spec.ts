import { expect, test } from '@playwright/test';

function tamperJwtPayload(token: string): string {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('JWT inválido para cenário de adulteração');

  const payloadJson = Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
  const payload = JSON.parse(payloadJson);
  payload.empresaId = '00000000-0000-0000-0000-000000000999';

  const encoded = Buffer.from(JSON.stringify(payload))
    .toString('base64url');

  return `${parts[0]}.${encoded}.${parts[2]}`;
}

test.describe('@security PS_Gateway - integridade JWT', () => {
  test('JWT com payload adulterado deve ser rejeitado mesmo mantendo a assinatura original', async ({ request }) => {
    const loginUrl = process.env.PS_LOGIN_URL;
    const email = process.env.QA_LOGIN_EMAIL;
    const password = process.env.QA_LOGIN_PASSWORD;

    test.skip(!loginUrl || !email || !password, 'Credenciais de QA não configuradas');

    const loginResponse = await request.post(`${loginUrl}/auth/login`, {
      data: { email, password }
    });
    expect(loginResponse.ok()).toBeTruthy();

    const { accessToken } = await loginResponse.json();
    expect(accessToken).toBeTruthy();

    const tampered = tamperJwtPayload(accessToken);
    const response = await request.get('/api/contracts', {
      headers: { Authorization: `Bearer ${tampered}` }
    });

    expect(response.status()).toBe(401);
  });

  test('token com formato JWT mas assinatura arbitrária deve ser rejeitado', async ({ request }) => {
    const fakeHeader = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const fakePayload = Buffer.from(JSON.stringify({
      sub: '00000000-0000-0000-0000-000000000001',
      empresaId: '00000000-0000-0000-0000-000000000002'
    })).toString('base64url');

    const response = await request.get('/api/contracts', {
      headers: { Authorization: `Bearer ${fakeHeader}.${fakePayload}.assinatura-invalida` }
    });

    expect(response.status()).toBe(401);
  });
});
