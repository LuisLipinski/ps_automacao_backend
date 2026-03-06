import { test, expect, request as playwrightRequest } from '@playwright/test';
import { novaEmpresa } from '../helpers/ps_empresa.payload';

test.describe('@security Internal Callback', () => {

    test('deve bloquear sem header', async ({ request }) => {


        const createRes = await request.post('/empresas/createEmpresas', {
            data: novaEmpresa()
    });

    expect(createRes.status()).toBe(201);

    const empresa = await createRes.json();


    const res = await request.patch('/internal/contratos/status', {
        data: {
        empresaId: empresa.id,
        statusContrato: 'ATIVO'
        }
    });

    expect(res.status()).toBe(403);
    });


    test('deve atualizar com header válido', async ({ request }) => {

    const createRes = await request.post('/empresas/createEmpresas', {
        data: novaEmpresa()
    });

    expect(createRes.status()).toBe(201);

    const empresa = await createRes.json();


    const internalApi = await playwrightRequest.newContext({
        baseURL: process.env.PS_EMPRESA_URL ?? 'http://localhost:8081',
        extraHTTPHeaders: {
        'X-Internal-Key': 'mypetadmin-secret',
        'Content-Type': 'application/json'
        }
    });

    const res = await internalApi.patch('/internal/contratos/status', {
        data: {
        empresaId: empresa.id,
        statusContrato: 'ATIVO'
        }
    });

    expect(res.status()).toBe(200);


    const getRes = await request.get(`/empresas/buscaEmpresas/${empresa.id}`);
    expect(getRes.status()).toBe(200);

    const empresaAtualizada = await getRes.json();
    expect(empresaAtualizada.status).toBe('ATIVO');

    await internalApi.dispose();
    });

});