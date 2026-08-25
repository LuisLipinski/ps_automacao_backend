import { test, expect } from '../../fixtures/empresa.fixture';
import { EmpresaClient } from '../../clients/ps_empresa.client';

test.describe('@core Busca de empresa - Regressivo', () => {
    test('deve buscar empresa por ID', async ({ api, empresa }) => {
        const client = new EmpresaClient(api);
        const res = await client.buscarEmpresa(empresa.response.id);

        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(body.id).toBe(empresa.response.id);
        expect(body.documentNumber).toBe(empresa.payload.documentNumber);
        expect(body.razaoSocial).toBe(empresa.payload.razaoSocial);
        expect(body.email).toBe(empresa.payload.email);
        expect(body.status).toBe('AGUARDANDO_CONTRATO');
    });

    test('listagem deve retornar estrutura paginada', async ({ api, empresa }) => {
        const client = new EmpresaClient(api);
        const res = await client.buscarTodasEmpresas();

        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(body).toHaveProperty('content');
        expect(body).toHaveProperty('page');
        expect(body).toHaveProperty('size');
        expect(body).toHaveProperty('totalElements');
        expect(body).toHaveProperty('totalPages');
        expect(body.content.map((item: any) => item.id)).toContain(empresa.response.id);
    });

    for (const filtro of ['status', 'razaoSocial', 'documentNumber', 'email']) {
        test(`deve filtrar por ${filtro}`, async ({ api, empresa }) => {
            const client = new EmpresaClient(api);
            const valor = filtro === 'status'
                ? 'AGUARDANDO_CONTRATO'
                : (empresa.payload as any)[filtro];

            const res = await client.buscarEmpresasComFiltro(filtro, valor);
            expect(res.status()).toBe(200);

            const body = await res.json();
            expect(body.content.length).toBeGreaterThan(0);
            if (filtro === 'status') {
                expect(body.content.every((item: any) => item.status === valor)).toBeTruthy();
            } else {
                expect(body.content.some((item: any) => item[filtro] === valor)).toBeTruthy();
            }
        });
    }

    test('ID inexistente deve retornar 404', async ({ api }) => {
        const client = new EmpresaClient(api);
        const res = await client.buscarEmpresa('f385b59b-fda1-4dcf-ad1a-8df0cd008d15');
        expect(res.status()).toBe(404);
    });

    test('filtro sem resultados deve retornar lista vazia', async ({ api }) => {
        const client = new EmpresaClient(api);
        const res = await client.buscarEmpresasComFiltro('razaoSocial', 'EmpresaQueNaoExisteNoMyPetAdmin999999');

        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(body.content).toHaveLength(0);
    });
});
