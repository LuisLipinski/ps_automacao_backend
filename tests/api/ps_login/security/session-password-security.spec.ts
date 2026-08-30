import { expect, test } from '@playwright/test';

test.describe('@security PS_Login - sessão e senha', () => {
  test('refresh exige token não vazio', async ({ request }) => {
    const response = await request.post('/auth/refresh', { data: { refreshToken: '' } });
    expect(response.status()).toBe(400);
  });

  test('logout exige token não vazio', async ({ request }) => {
    const response = await request.post('/auth/logout', { data: { refreshToken: '' } });
    expect(response.status()).toBe(400);
  });

  test('refresh rejeita token inválido', async ({ request }) => {
    const response = await request.post('/auth/refresh', { data: { refreshToken: 'invalid-refresh-token' } });
    expect([400, 401]).toContain(response.status());
  });

  test('reset rejeita payload vazio', async ({ request }) => {
    const response = await request.post('/auth/password/reset', {
      data: { token: '', password: '', passwordConfirmation: '' }
    });
    expect(response.status()).toBe(400);
  });

  test('reset rejeita token inválido', async ({ request }) => {
    const response = await request.post('/auth/password/reset', {
      data: { token: 'invalid-reset-token', password: 'QaPassword123!', passwordConfirmation: 'QaPassword123!' }
    });
    expect([400, 401]).toContain(response.status());
  });

  test('change password exige autenticação', async ({ request }) => {
    const response = await request.post('/auth/password/change', {
      data: {
        currentPassword: 'old-password',
        newPassword: 'new-password',
        newPasswordConfirmation: 'new-password'
      }
    });
    expect(response.status()).toBe(401);
  });

  test('forgot valida formato de e-mail', async ({ request }) => {
    const response = await request.post('/auth/password/forgot', { data: { email: 'nao-e-email' } });
    expect(response.status()).toBe(400);
  });
});
