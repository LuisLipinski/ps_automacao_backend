import { test, expect, request as playwrightRequest } from '@playwright/test';
import { novaEmpresa } from '../helpers/ps_empresa.payload';

function requiredInternalKey() {
    const value = process.env.PS_EMPRESA_INTERNAL_KEY;
    if (!value || value.trim().length === 0) {
        throw new Error('PS_EMPRESA_INTERNAL_KEY deve estar configurada');
    }
    return value;
}

test.describe('@security PS_Empresa - credencial interna', () => {
    test('deve bloquear callback sem X-Internal-Key', async ({ request }) => {
        const internalKey = requiredInternalKey();
        const internalApi = await playwrightRequest.newContext({
            baseURL: process.env.PS_EMPRESA_URL ?? 'http://localhost:8081',
            extraHTTPHeaders: {
                'X-Internal-Key': internalKey,
                'Content-Type': 'application/json'
            }
        });

        let empresaId: string | undefined;
        try {
            const createRes = await internalApi.post('/internal/empresas', { data: novaEmpresa() });
            expect(createRes.status()).toBe(201);
            empresaId = (await createRes.json()).id;

            const res = await request.patch('/internal/contratos/status', {
                data: { empresaId, statusContrato: 'ATIVO' }
            });
            expect(res.status()).toBe(403);
        } finally {
            if (empresaId) {
                await internalApi.delete(`/empresas/${empresaId}`);
            }
            await internalApi.dispose();
        }
    });

    test('deve bloquear callback com chave inválida', async ({ request }) => {
        const res = await request.patch('/internal/contratos/status', {
            headers: { 'X-Internal-Key': 'invalid-test-key' },
            data: { empresaId: '00000000-0000-0000-0000-000000000001', statusContrato: 'ATIVO' }
        });
        expect(res.status()).toBe(403);
    });

    test('deve atualizar com X-Internal-Key válida', async () => {
        const internalKey = requiredInternalKey();
        const internalApi = await playwrightRequest.newContext({
            baseURL: process.env.PS_EMPRESA_URL ?? 'http://localhost:8081',
            extraHTTPHeaders: {
                'X-Internal-Key': internalKey,
                'Content-Type': 'application/json'
            }
        });

        let empresaId: string | undefined;
        try {
            const createRes = await internalApi.post('/internal/empresas', { data: novaEmpresa() });
            expect(createRes.status()).toBe(201);
            empresaId = (await createRes.json()).id;

            const callbackRes = await internalApi.patch('/internal/contratos/status', {
                data: { empresaId, statusContrato: 'ATIVO' }
            });
            expect(callbackRes.status()).toBe(204);

            const getRes = await internalApi.get(`/empresas/${empresaId}`);
            expect(getRes.status()).toBe(200);
            expect((await getRes.json()).status).toBe('ATIVO');
        } finally {
            if (empresaId) {
                await internalApi.delete(`/empresas/${empresaId}`);
            }
            await internalApi.dispose();
        }
    });
});
