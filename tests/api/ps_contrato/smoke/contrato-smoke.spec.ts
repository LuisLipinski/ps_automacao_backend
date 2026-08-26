import { test, expect } from '@playwright/test';
import { ApiClient } from '../../../shared/api.client';
import { ContratoClient } from '../clients/ps_contrato.client';

test.describe('@smoke PS_Contrato - Smoke não destrutivo', () => {
  test('health deve responder 200 sem autenticação', async ({ request }) => {
    const response = await request.get('/actuator/health');
    expect(response.status()).toBe(200);
  });

  test('listagem autenticada deve responder 200', async ({ request }) => {
    const client = new ContratoClient(new ApiClient(request));
    const response = await client.buscarContratos('page=0&size=1');

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('content');
    expect(body).toHaveProperty('totalElements');
    expect(body).toHaveProperty('totalPages');
  });

  test('empresa inexistente deve retornar 404 sem criar contrato', async ({ request }) => {
    const client = new ContratoClient(new ApiClient(request));
    const response = await client.criarContrato(
      '00000000-0000-0000-0000-000000000001',
      '00000000-0000-0000-0000-000000000002'
    );

    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body.code).toBe('EMPRESA_NOT_FOUND');
  });
});
