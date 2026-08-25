import { test, expect } from '../../fixtures/empresa.fixture';
import { EmpresaClient } from '../../clients/ps_empresa.client';

test.describe('PS_Empresa - sincronização de status do contrato', () => {
  test('deve aplicar as regras oficiais de status', async ({ api, empresa }) => {
    const client = new EmpresaClient(api);

    const aguardando = await client.sincronizarStatusContrato(
      empresa.response.id,
      'AGUARDANDO_PAGAMENTO'
    );
    expect(aguardando.status()).toBe(204);

    let status = await client.consultarStatus(empresa.response.id);
    expect((await status.json()).status).toBe('AGUARDANDO_CONTRATO');

    const ativo = await client.sincronizarStatusContrato(empresa.response.id, 'ATIVO');
    expect(ativo.status()).toBe(204);

    status = await client.consultarStatus(empresa.response.id);
    expect((await status.json()).status).toBe('ATIVO');

    const pendente = await client.sincronizarStatusContrato(
      empresa.response.id,
      'PENDENTE_PAGAMENTO'
    );
    expect(pendente.status()).toBe(204);

    status = await client.consultarStatus(empresa.response.id);
    expect((await status.json()).status).toBe('ATIVO');

    const inativo = await client.sincronizarStatusContrato(empresa.response.id, 'INATIVO');
    expect(inativo.status()).toBe(204);

    status = await client.consultarStatus(empresa.response.id);
    expect((await status.json()).status).toBe('INATIVO');
  });
});
