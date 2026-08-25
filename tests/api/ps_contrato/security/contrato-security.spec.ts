import { test, expect } from '@playwright/test';

test.describe('@security PS_Contrato - autenticação interna', () => {
  test('deve bloquear listagem sem X-Internal-Key', async ({ request }) => {
    const response = await request.get('/contratos');
    expect(response.status()).toBe(401);
  });

  test('deve bloquear chave interna inválida', async ({ request }) => {
    const response = await request.get('/contratos', {
      headers: { 'X-Internal-Key': 'invalid-test-key' }
    });
    expect(response.status()).toBe(401);
  });

  test('prometheus deve permanecer protegido', async ({ request }) => {
    const response = await request.get('/actuator/prometheus');
    expect(response.status()).toBe(401);
  });

  test('rota desconhecida deve ficar fechada', async ({ request }) => {
    const response = await request.get('/internal/debug');
    expect([401, 403, 404]).toContain(response.status());
  });
});
