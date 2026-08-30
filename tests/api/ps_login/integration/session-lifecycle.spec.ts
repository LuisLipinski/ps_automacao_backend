import { expect, test, type APIRequestContext } from '@playwright/test';

const qaEmail = process.env.QA_LOGIN_EMAIL;
const qaPassword = process.env.QA_LOGIN_PASSWORD;

async function login(request: APIRequestContext, email: string, password: string) {
  return request.post('/auth/login', { data: { email, password } });
}

test.describe('@security PS_Login - logout', () => {
  test('logout de token desconhecido permanece idempotente', async ({ request }) => {
    const response = await request.post('/auth/logout', {
      data: { refreshToken: 'unknown-refresh-token' }
    });

    expect(response.status()).toBe(204);
  });
});

test.describe('@integration @security PS_Login - sessão', () => {
  test.skip(!qaEmail || !qaPassword, 'Requer QA_LOGIN_EMAIL e QA_LOGIN_PASSWORD');

  test('refresh gera nova sessão e logout revoga o refresh token', async ({ request }) => {
    const loginResponse = await login(request, qaEmail!, qaPassword!);
    expect(loginResponse.status()).toBe(200);
    const loginBody = await loginResponse.json();
    expect(loginBody.accessToken).toBeTruthy();
    expect(loginBody.refreshToken).toBeTruthy();

    const refreshResponse = await request.post('/auth/refresh', {
      data: { refreshToken: loginBody.refreshToken }
    });
    expect(refreshResponse.status()).toBe(200);
    const refreshBody = await refreshResponse.json();
    expect(refreshBody.accessToken).toBeTruthy();
    expect(refreshBody.refreshToken).toBeTruthy();

    const logoutResponse = await request.post('/auth/logout', {
      data: { refreshToken: refreshBody.refreshToken }
    });
    expect(logoutResponse.status()).toBe(204);

    const revokedRefresh = await request.post('/auth/refresh', {
      data: { refreshToken: refreshBody.refreshToken }
    });
    expect([400, 401]).toContain(revokedRefresh.status());
  });

  test('reuse do refresh anterior revoga toda a família de tokens', async ({ request }) => {
    const loginResponse = await login(request, qaEmail!, qaPassword!);
    expect(loginResponse.status()).toBe(200);
    const firstSession = await loginResponse.json();

    const rotation = await request.post('/auth/refresh', {
      data: { refreshToken: firstSession.refreshToken }
    });
    expect(rotation.status()).toBe(200);
    const rotatedSession = await rotation.json();
    expect(rotatedSession.refreshToken).toBeTruthy();
    expect(rotatedSession.refreshToken).not.toBe(firstSession.refreshToken);

    const reusedOldToken = await request.post('/auth/refresh', {
      data: { refreshToken: firstSession.refreshToken }
    });
    expect([400, 401]).toContain(reusedOldToken.status());

    const revokedFamilyReplacement = await request.post('/auth/refresh', {
      data: { refreshToken: rotatedSession.refreshToken }
    });
    expect([400, 401]).toContain(revokedFamilyReplacement.status());
  });
});
