import { test, expect } from '@playwright/test';

test.describe('@security PS_Gateway - borda pública', () => {
  test('health deve permanecer público', async ({ request }) => {
    const response = await request.get('/actuator/health');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.status).toBe('UP');
  });

  test('contratos deve exigir autenticação', async ({ request }) => {
    const response = await request.get('/api/contracts');
    expect(response.status()).toBe(401);
  });

  test('Bearer malformado deve ser rejeitado', async ({ request }) => {
    const response = await request.get('/api/contracts', {
      headers: { Authorization: 'Bearer token-invalido' }
    });
    expect(response.status()).toBe(401);
  });

  test('headers internos enviados pelo cliente não devem liberar acesso', async ({ request }) => {
    const response = await request.get('/api/contracts', {
      headers: {
        'X-Internal-Key': 'spoofed',
        'X-Actor-User-Id': '00000000-0000-0000-0000-000000000001',
        'X-Actor-Empresa-Id': '00000000-0000-0000-0000-000000000002'
      }
    });
    expect(response.status()).toBe(401);
  });

  test('rota desconhecida deve permanecer fechada', async ({ request }) => {
    const response = await request.get('/internal/debug');
    expect([401, 403, 404]).toContain(response.status());
  });
});
