import { randomUUID } from 'node:crypto';
import { test, expect, request as playwrightRequest } from '@playwright/test';
import { ApiClient } from '../../../shared/api.client';
import { EmpresaClient } from '../../ps_empresa/clients/ps_empresa.client';
import { novaEmpresa } from '../../ps_empresa/helpers/ps_empresa.payload';
import { ContratoClient } from '../clients/ps_contrato.client';

test.describe('@integration PS_Empresa <-> PS_Contrato', () => {
  test.describe.configure({ mode: 'serial' });

  test('deve sincronizar onboarding -> pagamento -> ativação -> inativação', async ({ request }) => {
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

      const onboardingId = randomUUID();
      const contratoResponse = await contratoClient.criarContrato(empresaId, onboardingId);
      expect(contratoResponse.status()).toBe(201);
      const contrato = await contratoResponse.json();
      expect(contrato.statusName).toBe('Aguardando pagamento');

      const retryOnboarding = await contratoClient.criarContrato(empresaId, onboardingId);
      expect(retryOnboarding.status()).toBe(201);
      const contratoRetry = await retryOnboarding.json();
      expect(contratoRetry.id).toBe(contrato.id);
      expect(contratoRetry.numeroContrato).toBe(contrato.numeroContrato);

      const contratosDaEmpresa = await contratoClient.buscarContratos(`empresaId=${empresaId}`);
      expect(contratosDaEmpresa.status()).toBe(200);
      const paginaContratos = await contratosDaEmpresa.json();
      expect(paginaContratos.totalElements).toBe(1);

      statusEmpresa = await empresaClient.consultarStatus(empresaId);
      expect((await statusEmpresa.json()).status).toBe('AGUARDANDO_CONTRATO');

      const ativacaoAdministrativa = await contratoClient.atualizarStatus(contrato.id, 2);
      expect(ativacaoAdministrativa.status()).toBe(409);

      const paymentId = randomUUID();
      const paidAt = new Date().toISOString().replace('Z', '');
      const ativacao = await contratoClient.confirmarPagamento(contrato.id, paymentId, paidAt);
      expect(ativacao.status()).toBe(200);
      expect((await ativacao.json()).statusName).toBe('Ativo');

      statusEmpresa = await empresaClient.consultarStatus(empresaId);
      expect((await statusEmpresa.json()).status).toBe('ATIVO');

      const retryPagamento = await contratoClient.confirmarPagamento(contrato.id, paymentId, paidAt);
      expect(retryPagamento.status()).toBe(200);
      expect((await retryPagamento.json()).statusName).toBe('Ativo');

      const pagamentoDiferente = await contratoClient.confirmarPagamento(
        contrato.id,
        randomUUID(),
        paidAt
      );
      expect(pagamentoDiferente.status()).toBe(409);

      const inativacao = await contratoClient.atualizarStatus(contrato.id, 3);
      expect(inativacao.status()).toBe(200);
      expect((await inativacao.json()).statusName).toBe('Inativo');

      statusEmpresa = await empresaClient.consultarStatus(empresaId);
      expect((await statusEmpresa.json()).status).toBe('INATIVO');

      const retryPagamentoAposInativacao = await contratoClient.confirmarPagamento(
        contrato.id,
        paymentId,
        paidAt
      );
      expect(retryPagamentoAposInativacao.status()).toBe(200);
      expect((await retryPagamentoAposInativacao.json()).statusName).toBe('Inativo');
    } finally {
      if (empresaId) {
        await empresaClient.excluirEmpresa(empresaId);
      }
      await empresaContext.dispose();
    }
  });
});
