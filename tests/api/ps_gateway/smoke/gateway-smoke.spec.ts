import { test, expect } from '@playwright/test';

test.describe('@smoke PS_Gateway', () => {
  test('health deve responder UP', async ({ request }) => {
    const response = await request.get('/actuator/health');
    expect(response.ok()).toBeTruthy();
    expect((await response.json()).status).toBe('UP');
  });
});
