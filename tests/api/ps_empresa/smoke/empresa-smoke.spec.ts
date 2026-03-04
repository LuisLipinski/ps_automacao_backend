import { test, expect } from '../fixtures/empresa.fixture';



test.describe('@smoke PS_Empresa - Smoke', () => {
    
    test('API responde (health básico)', async ({ api }) => {
        const res = await api.get('/actuator/health');
        expect(res.status()).toBe(200);
    });

    test('criar empresa retorna 201 e status inicial correto', async ({ empresa }) => {
        expect(empresa.response.id).toBeTruthy();
        expect(empresa.response.status).toBe('AGUARDANDO_CONTRATO');
    })

    test('buscar empresa por id retorna 200', async ({ api, empresa }) => {
        const res = await api.get(`/empresas/buscaEmpresas/${empresa.response.id}`);

        expect(res.status()).toBe(200);

        const body = await res.json();

        expect(body.id).toBe(empresa.response.id);
        expect(body.status).toBe('AGUARDANDO_CONTRATO');
    });

    test('listar empresas retorna estrutura paginada', async ({ api }) => {
        const res = await api.get('/empresas/buscaEmpresas');

        expect(res.status()).toBe(200);

        const body = await res.json();

        expect(body).toHaveProperty('content');
        expect(body).toHaveProperty('page');
        expect(body).toHaveProperty('size');
        expect(body).toHaveProperty('totalElements');
        expect(body).toHaveProperty('totalPages');
    });

})