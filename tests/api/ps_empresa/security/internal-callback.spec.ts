import { test, expect, request as playwrightRequest } from '@playwright/test';
import { novaEmpresa } from '../helpers/ps_empresa.payload';

test.describe('@security Internal Callback', () => {
    const internalKey = process.env.PS_EMPRESA_INTERNAL_KEY ?? 'mypetadmin-secret';

    test('deve bloquear callback sem header', async ({ request }) => {
        const internalApi = await playwrightRequest.newContext({
            baseURL: process.env.PS_EMPRESA_URL ?? 'http://localhost:8081',
            extraHTTPHeaders: {
                'X-Internal-Key': internalKey,
                'Content-Type': 'application/json'
            }
        });

        let createRes = await internalApi.post('/internal/empresas', { data: novaEmpresa() });
        if ([403, 404, 405].includes(createRes.status())) {
            createRes = await request.post('/empresas/createEmpresas', { data: novaEmpresa() });
        }
        expect(createRes.status()).toBe(201);
        const empresa = await createRes.json();

        const res = await request.patch('/internal/contratos/status', {
            data: { empresaId: empresa.id, statusContrato: 'ATIVO' }
        });
        expect(res.status()).toBe(403);

        await internalApi.dispose();
    });

    test('deve atualizar com header válido', async ({ request }) => {
        const internalApi = await playwrightRequest.newContext({
            baseURL: process.env.PS_EMPRESA_URL ?? 'http://localhost:8081',
            extraHTTPHeaders: {
                'X-Internal-Key': internalKey,
                'Content-Type': 'application/json'
            }
        });

        let createRes = await internalApi.post('/internal/empresas', { data: novaEmpresa() });
        if ([403, 404, 405].includes(createRes.status())) {
            createRes = await request.post('/empresas/createEmpresas', { data: novaEmpresa() });
        }
        expect(createRes.status()).toBe(201);
        const empresa = await createRes.json();

        const res = await internalApi.patch('/internal/contratos/status', {
            data: { empresaId: empresa.id, statusContrato: 'ATIVO' }
        });
        expect([200, 204]).toContain(res.status());

        let getRes = await internalApi.get(`/empresas/${empresa.id}`);
        if ([404, 405].includes(getRes.status())) {
            getRes = await request.get(`/empresas/buscaEmpresas/${empresa.id}`);
        }
        expect(getRes.status()).toBe(200);
        const empresaAtualizada = await getRes.json();
        expect(empresaAtualizada.status).toBe('ATIVO');

        await internalApi.dispose();
    });
});
