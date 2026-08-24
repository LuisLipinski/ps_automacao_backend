import { randomUUID } from 'node:crypto';
import { test, expect, request as playwrightRequest } from '@playwright/test';
import { ApiClient } from '../../../shared/api.client';
import { EmpresaClient } from '../../ps_empresa/clients/ps_empresa.client';
import { novaEmpresa } from '../../ps_empresa/helpers/ps_empresa.payload';
import { ContratoClient } from '../clients/ps_contrato.client';

test.describe('@integration concorrência da numeração de contratos', () => {
  test('deve gerar números únicos para criações simultâneas', async ({ request }) => {
    test.skip(
      process.env.RUN_DESTRUCTIVE_INTEGRATION !== 'true',
      'Teste concorrente exige ambiente efêmero/QA e RUN_DESTRUCTIVE_INTEGRATION=true'
    );

    const empresaContext = await playwrightRequest.newContext({
      baseURL: process.env.PS_EMPRESA_URL ?? 'http://localhost:8081',
      extraHTTPHeaders: { 'Content-Type': 'application/json' }
    });

    const empresaClient = new EmpresaClient(new ApiClient(empresaContext));
    const contratoClient = new ContratoClient(new ApiClient(request));
    const empresasCriadas: string[] = [];

    try {
      const [empresaResponseA, empresaResponseB] = await Promise.all([
        empresaClient.criarEmpresa(novaEmpresa()),
        empresaClient.criarEmpresa(novaEmpresa())
      ]);

      expect(empresaResponseA.status()).toBe(201);
      expect(empresaResponseB.status()).toBe(201);

      const empresaA = await empresaResponseA.json();
      const empresaB = await empresaResponseB.json();
      empresasCriadas.push(empresaA.id, empresaB.id);

      const [contratoResponseA, contratoResponseB] = await Promise.all([
        contratoClient.criarContrato(empresaA.id, randomUUID()),
        contratoClient.criarContrato(empresaB.id, randomUUID())
      ]);

      expect(contratoResponseA.status()).toBe(201);
      expect(contratoResponseB.status()).toBe(201);

      const contratoA = await contratoResponseA.json();
      const contratoB = await contratoResponseB.json();

      expect(contratoA.numeroContrato).toMatch(/^\d{12}$/);
      expect(contratoB.numeroContrato).toMatch(/^\d{12}$/);
      expect(contratoA.numeroContrato).not.toBe(contratoB.numeroContrato);
    } finally {
      await Promise.allSettled(empresasCriadas.map((empresaId) => empresaClient.excluirEmpresa(empresaId)));
      await empresaContext.dispose();
    }
  });
});
