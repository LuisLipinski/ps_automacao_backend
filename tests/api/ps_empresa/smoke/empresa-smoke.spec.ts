import { test, expect } from '../fixtures/empresa.fixture';

test.describe('PS_Empresa - Smoke', () => {
    
    test('API responde (health básico)', async ({ api }) => {
        const res = await api.get('/actuator/health');
        expect(res.status()).toBe(200);
    });

    test('criar empresa com sucesso', async ({ empresa }) => {
        expect(empresa.response.id).toBeTruthy();
        expect(empresa.response.status).toBe('AGUARDANDO_PAGAMENTO');
    })

    test('buscar empresa por id', async ({ api, empresa }) => {
        const res = await api.get(`/empresas/buscaEmpresas/${empresa.response.id}`);

        expect(res.status()).toBe(200);

        const body = await res.json();

        expect(body.id).toBe(empresa.response.id);
        expect(body.status).toBe('AGUARDANDO_PAGAMENTO');
    });

    test('listar empresas', async ({ api }) => {
        const res = await api.get('/empresas/buscaEmpresas');

        expect(res.status()).toBe(200);

        const body = await res.json();
        expect(Array.isArray(body.content)).toBeTruthy();
    });

})