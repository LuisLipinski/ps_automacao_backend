import { test, expect } from '@playwright/test';

test.describe('@smoke @security PS_Orchestrator', () => {
  test('health deve permanecer público', async ({ request }) => {
    const response = await request.get('/actuator/health');
    expect(response.ok()).toBeTruthy();
  });

  test('onboarding interno deve bloquear chamada sem chave interna', async ({ request }) => {
    const response = await request.post('/internal/onboardings', {
      headers: { 'X-Onboarding-Id': '00000000-0000-0000-0000-000000000001' },
      data: {}
    });
    expect(response.status()).toBe(401);
  });

  test('chave interna inválida deve ser rejeitada antes da regra de negócio', async ({ request }) => {
    const response = await request.post('/internal/onboardings', {
      headers: {
        'X-Internal-Key': 'invalid-test-key',
        'X-Onboarding-Id': '00000000-0000-0000-0000-000000000001'
      },
      data: {}
    });
    expect(response.status()).toBe(401);
  });
});
