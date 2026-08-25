import { test, expect } from '../../fixtures/empresa.fixture';
import { EmpresaClient } from '../../clients/ps_empresa.client';

test.describe('PS_Empresa - paginação', () => {
  test('deve aceitar tamanho máximo de 100 e retornar metadados coerentes', async ({ api }) => {
    const client = new EmpresaClient(api);
    const response = await client.buscarTodasEmpresas('page=0&size=100');

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.page).toBe(0);
    expect(body.size).toBe(100);
    expect(Array.isArray(body.content)).toBeTruthy();
    expect(body.content.length).toBeLessThanOrEqual(100);
  });

  test('deve rejeitar size acima de 100', async ({ api }) => {
    const client = new EmpresaClient(api);
    const response = await client.buscarTodasEmpresas('page=0&size=101');

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.code).toBe('INVALID_ARGUMENT');
  });

  test('deve rejeitar página negativa', async ({ api }) => {
    const client = new EmpresaClient(api);
    const response = await client.buscarTodasEmpresas('page=-1&size=10');

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.code).toBe('INVALID_ARGUMENT');
  });
});
