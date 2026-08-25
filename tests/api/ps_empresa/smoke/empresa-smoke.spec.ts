import { test, expect } from '../fixtures/empresa.fixture';
import { EmpresaClient } from '../clients/ps_empresa.client';

test.describe('@smoke PS_Empresa - Smoke', () => {
    test('API responde no health', async ({ api }) => {
        const res = await api.get('/actuator/health');
        expect(res.status()).toBe(200);
    });

    test('criar empresa retorna status inicial correto', async ({ empresa }) => {
        expect(empresa.response.id).toBeTruthy();
        expect(empresa.response.status).toBe('AGUARDANDO_CONTRATO');
    });

    test('buscar empresa por id retorna 200', async ({ api, empresa }) => {
        const client = new EmpresaClient(api);
        const res = await client.buscarEmpresa(empresa.response.id);

        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(body.id).toBe(empresa.response.id);
        expect(body.status).toBe('AGUARDANDO_CONTRATO');
    });

    test('listar empresas retorna estrutura paginada', async ({ api }) => {
        const client = new EmpresaClient(api);
        const res = await client.buscarTodasEmpresas();

        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(body).toHaveProperty('content');
        expect(body).toHaveProperty('page');
        expect(body).toHaveProperty('size');
        expect(body).toHaveProperty('totalElements');
        expect(body).toHaveProperty('totalPages');
    });
});
