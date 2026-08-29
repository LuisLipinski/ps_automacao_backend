import { test, expect } from '@playwright/test';

test.describe('@smoke PS_Login', () => {
  test('health deve responder', async ({ request }) => {
    const response = await request.get('/actuator/health');
    expect(response.ok()).toBeTruthy();
  });
});
