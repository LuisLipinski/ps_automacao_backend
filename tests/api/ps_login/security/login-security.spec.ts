import { test, expect } from '@playwright/test';

test.describe('@smoke @security PS_Login', () => {
  test('health deve permanecer público', async ({ request }) => {
    const response = await request.get('/actuator/health');
    expect(response.ok()).toBeTruthy();
  });

  test('login sem payload obrigatório deve retornar erro de validação', async ({ request }) => {
    const response = await request.post('/auth/login', { data: {} });
    expect(response.status()).toBe(400);
  });

  test('login com email inválido deve retornar erro de validação', async ({ request }) => {
    const response = await request.post('/auth/login', {
      data: { email: 'nao-e-email', password: 'senha-invalida' }
    });
    expect(response.status()).toBe(400);
  });

  test('endpoint protegido não deve aceitar bearer malformado', async ({ request }) => {
    const response = await request.get('/auth/session', {
      headers: { Authorization: 'Bearer token-invalido' }
    });
    expect([401, 403, 404]).toContain(response.status());
  });
});
