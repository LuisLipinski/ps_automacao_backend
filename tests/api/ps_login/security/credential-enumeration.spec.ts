import { expect, test } from '@playwright/test';

const qaEmail = process.env.QA_LOGIN_EMAIL;

test.describe('@security PS_Login - anti-enumeration', () => {
  test('forgot password deve responder 202 para e-mail inexistente', async ({ request }) => {
    const response = await request.post('/auth/password/forgot', {
      data: { email: `qa-nao-existe-${Date.now()}@example.com` }
    });

    expect(response.status()).toBe(202);
  });

  test('login não deve revelar diferença entre usuário inexistente e senha incorreta', async ({ request }) => {
    test.skip(!qaEmail, 'QA_LOGIN_EMAIL não configurado');

    const [unknownUserResponse, wrongPasswordResponse] = await Promise.all([
      request.post('/auth/login', {
        data: {
          email: `qa-nao-existe-${Date.now()}@example.com`,
          password: 'SenhaInvalida123!'
        }
      }),
      request.post('/auth/login', {
        data: {
          email: qaEmail,
          password: 'SenhaInvalida123!'
        }
      })
    ]);

    expect(unknownUserResponse.status()).toBe(wrongPasswordResponse.status());
    expect([400, 401]).toContain(unknownUserResponse.status());

    const unknownBody = await unknownUserResponse.json().catch(() => null);
    const wrongPasswordBody = await wrongPasswordResponse.json().catch(() => null);

    if (unknownBody?.code || wrongPasswordBody?.code) {
      expect(unknownBody?.code).toBe(wrongPasswordBody?.code);
    }
  });
});
