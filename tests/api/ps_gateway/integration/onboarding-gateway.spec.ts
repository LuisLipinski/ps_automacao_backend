import { expect, test } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { novaEmpresa } from '../../ps_empresa/helpers/ps_empresa.payload';

const destructive = process.env.RUN_DESTRUCTIVE_INTEGRATION === 'true';

test.describe('@integration PS_Gateway -> PS_Orchestrator onboarding', () => {
  test('rejeita Idempotency-Key ausente ou inválido antes de chamar o Orchestrator', async ({ request }) => {
    const payload = novaEmpresa();

    const missing = await request.post('/api/onboardings', { data: payload });
    expect(missing.status()).toBe(400);
    expect((await missing.json()).code).toBe('INVALID_IDEMPOTENCY_KEY');

    const invalid = await request.post('/api/onboardings', {
      headers: { 'Idempotency-Key': 'nao-e-uuid' },
      data: payload
    });
    expect(invalid.status()).toBe(400);
    expect((await invalid.json()).code).toBe('INVALID_IDEMPOTENCY_KEY');
  });

  test('cria empresa, primeiro MASTER e contrato de forma idempotente pelo Gateway', async ({ request }) => {
    test.skip(!destructive, 'Executa apenas em QA/ambiente efêmero porque cria dados cross-service');

    const onboardingId = randomUUID();
    const payload = novaEmpresa();
    const headers = { 'Idempotency-Key': onboardingId };

    const first = await request.post('/api/onboardings', { headers, data: payload });
    expect(first.status()).toBe(200);

    const firstBody = await first.json();
    expect(firstBody.onboardingId).toBe(onboardingId);
    expect(firstBody.empresaId).toBeTruthy();
    expect(firstBody.masterUserId).toBeTruthy();
    expect(firstBody.contratoId).toBeTruthy();
    expect(firstBody.numeroContrato).toMatch(/^\d{12}$/);
    expect(firstBody.empresaStatus).toBe('AGUARDANDO_CONTRATO');
    expect(firstBody.contratoStatus).toBe('AGUARDANDO_PAGAMENTO');
    expect(firstBody.invitationStatus).toBeTruthy();

    const replay = await request.post('/api/onboardings', { headers, data: payload });
    expect(replay.status()).toBe(200);

    const replayBody = await replay.json();
    expect(replayBody.onboardingId).toBe(firstBody.onboardingId);
    expect(replayBody.empresaId).toBe(firstBody.empresaId);
    expect(replayBody.masterUserId).toBe(firstBody.masterUserId);
    expect(replayBody.contratoId).toBe(firstBody.contratoId);
    expect(replayBody.numeroContrato).toBe(firstBody.numeroContrato);
  });
});
