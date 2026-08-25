import { test, expect } from '../../fixtures/empresa.fixture';
import { EmpresaClient } from '../../clients/ps_empresa.client';

test.describe('PS_Empresa - exclusão', () => {
  test('deve excluir empresa existente e retornar 404 nas consultas posteriores', async ({ api, empresa }) => {
    const client = new EmpresaClient(api);

    const deleteResponse = await client.excluirEmpresa(empresa.response.id);
    expect(deleteResponse.status()).toBe(204);

    const getResponse = await client.buscarEmpresa(empresa.response.id);
    expect(getResponse.status()).toBe(404);
    const body = await getResponse.json();
    expect(body.code).toBe('EMPRESA_NOT_FOUND');
  });

  test('deve retornar 404 ao excluir empresa inexistente', async ({ api }) => {
    const client = new EmpresaClient(api);
    const response = await client.excluirEmpresa('00000000-0000-0000-0000-000000000001');

    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body.code).toBe('EMPRESA_NOT_FOUND');
  });
});
