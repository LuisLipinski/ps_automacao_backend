import { test, expect, request as playwrightRequest } from '@playwright/test';
import { ApiClient } from '../../../shared/api.client';
import { EmpresaClient } from '../../ps_empresa/clients/ps_empresa.client';
import { novaEmpresa } from '../../ps_empresa/helpers/ps_empresa.payload';
import { ContratoClient } from '../clients/ps_contrato.client';

test.describe('@integration PS_Empresa <-> PS_Contrato', () => {
  test.describe.configure({ mode: 'serial' });

  test('deve sincronizar o ciclo AGUARDANDO_CONTRATO -> ATIVO -> INATIVO', async ({ request }) => {
    test.skip(
      process.env.RUN_DESTRUCTIVE_INTEGRATION !== 'true',
      'Teste de lifecycle exige ambiente efêmero/QA e RUN_DESTRUCTIVE_INTEGRATION=true'
    );

    const empresaContext = await playwrightRequest.newContext({
      baseURL: process.env.PS_EMPRESA_URL ?? 'http://localhost:8081',
      extraHTTPHeaders: { 'Content-Type': 'application/json' }
    });

    const empresaClient = new EmpresaClient(new ApiClient(empresaContext));
    const contratoClient = new ContratoClient(new ApiClient(request));
    let empresaId: string | undefined;

    try {
      const empresaResponse = await empresaClient.criarEmpresa(novaEmpresa());
      expect(empresaResponse.status()).toBe(201);
      empresaId = (await empresaResponse.json()).id;

      let statusEmpresa = await empresaClient.consultarStatus(empresaId);
      expect(statusEmpresa.status()).toBe(200);
      expect((await statusEmpresa.json()).status).toBe('AGUARDANDO_CONTRATO');

      const contratoResponse = await contratoClient.criarContrato(empresaId);
      expect(contratoResponse.status()).toBe(201);
      const contrato = await contratoResponse.json();
      expect(contrato.statusName).toBe('Aguardando pagamento');

      statusEmpresa = await empresaClient.consultarStatus(empresaId);
      expect((await statusEmpresa.json()).status).toBe('AGUARDANDO_CONTRATO');

      const ativacao = await contratoClient.atualizarStatus(contrato.id, 2);
      expect(ativacao.status()).toBe(200);
      expect((await ativacao.json()).statusName).toBe('Ativo');

      statusEmpresa = await empresaClient.consultarStatus(empresaId);
      expect((await statusEmpresa.json()).status).toBe('ATIVO');

      const retryAtivacao = await contratoClient.atualizarStatus(contrato.id, 2);
      expect(retryAtivacao.status()).toBe(200);
      expect((await retryAtivacao.json()).statusName).toBe('Ativo');

      const inativacao = await contratoClient.atualizarStatus(contrato.id, 3);
      expect(inativacao.status()).toBe(200);
      expect((await inativacao.json()).statusName).toBe('Inativo');

      statusEmpresa = await empresaClient.consultarStatus(empresaId);
      expect((await statusEmpresa.json()).status).toBe('INATIVO');
    } finally {
      if (empresaId) {
        await empresaClient.excluirEmpresa(empresaId);
      }
      await empresaContext.dispose();
    }
  });
});
