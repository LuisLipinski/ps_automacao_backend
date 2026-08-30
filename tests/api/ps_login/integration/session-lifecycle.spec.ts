import { expect, test } from '@playwright/test';

const qaEmail = process.env.QA_LOGIN_EMAIL;
const qaPassword = process.env.QA_LOGIN_PASSWORD;

async function login(request: any, email: string, password: string) {
  return request.post('/auth/login', { data: { email, password } });
}

test.describe('@integration PS_Login - sessão', () => {
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
});
