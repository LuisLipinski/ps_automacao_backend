import { test, expect } from '@playwright/test';
import { novaEmpresa } from '../helpers/ps_empresa.payload';

test.describe('PS_Empresa - Smoke', () => {
    
    test('API responde (health básico)', async ({ request }) => {
        const res = await request.get('/empresas/buscaEmpresas');
        expect(res.status()).toBe(200);
    });

    test('criar empresa com sucesso', async ({ request }) => {
        const res = await request.post('/empresas/createEmpresas', {
            data: novaEmpresa()
        });

        expect(res.status()).toBe(201)
    })
})