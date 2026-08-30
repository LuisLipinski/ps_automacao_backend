import { test, expect } from '@playwright/test';

test.describe('@smoke @security PS_User', () => {
  test('health deve permanecer público', async ({ request }) => {
    const response = await request.get('/actuator/health');
    expect(response.ok()).toBeTruthy();
  });

  test('listagem interna deve bloquear chamada sem chave interna', async ({ request }) => {
    const response = await request.get('/internal/usuarios', {
      headers: { 'X-Actor-User-Id': '00000000-0000-0000-0000-000000000001' }
    });
    expect(response.status()).toBe(401);
  });

  test('identity interna deve bloquear chamada sem chave interna', async ({ request }) => {
    const response = await request.get('/internal/usuarios/identity?email=qa%40example.com');
    expect(response.status()).toBe(401);
  });

  test('chave interna inválida deve ser rejeitada', async ({ request }) => {
    const response = await request.get('/internal/usuarios/identity?email=qa%40example.com', {
      headers: { 'X-Internal-Key': 'invalid-test-key' }
    });
    expect(response.status()).toBe(401);
  });
});
