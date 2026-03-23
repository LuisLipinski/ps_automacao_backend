import { test, expect } from '../../fixtures/empresa.fixture';
import { EmpresaClient } from '../../clients/ps_empresa.client';

test.describe('@core Busca de empresa - Regressivo', () => {
    test.describe('Cenários positivo', () => {
        test('Deve buscar empresa por ID e retornar os dados corretos', async ({ api, empresa }) => {
            const empresaClient = new EmpresaClient(api);
            const res = await empresaClient.buscarEmpresa(empresa.response.id);
            expect(res.status()).toBe(200);

            const body = await res.json();
            expect(body.id).toBe(empresa.response.id);
            expect(body.documentNumber).toBe(empresa.payload.documentNumber);
            expect(body.razaoSocial).toBe(empresa.payload.razaoSocial);
            expect(body.nomeFantasia).toBe(empresa.payload.nomeFantasia);
            expect(body.telefone).toBe(empresa.payload.telefone);
            expect(body.email).toBe(empresa.payload.email);
            expect(body.nomeTitular).toBe(empresa.payload.nomeTitular);
            expect(body.cep).toBe(empresa.payload.cep)
            expect(body.cidade).toBe(empresa.payload.cidade);
            expect(body.estado).toBe(empresa.payload.estado);
            expect(body.endereco).toBe(empresa.payload.rua +  ', ' + empresa.payload.numero + ' - ' + empresa.payload.complemento + ', ' + empresa.payload.bairro);
            expect(body.status).toBe('AGUARDANDO_CONTRATO');
        });
        test('Listagem deve retornar estrutura paginada e conter empresa criada', async ({ api, empresa }) => {
            const empresaClient = new EmpresaClient(api);
            const res = await empresaClient.buscarTodasEmpresas();
            expect(res.status()).toBe(200);
            const body = await res.json();
            const ids = body.content.map((e: any) => e.id);
            expect(ids).toContain(empresa.response.id);
            expect(body).toHaveProperty('content');
            expect(body).toHaveProperty('page');
            expect(body).toHaveProperty('size');
            expect(body).toHaveProperty('totalElements');
            expect(body).toHaveProperty('totalPages');
        });
        
        test('Filtrar por status deve retornar apenas empresas com status especificado', async ({ api, empresa }) => {
            const empresaClient = new EmpresaClient(api);
            const res = await empresaClient.buscarEmpresasComFiltro('status', 'AGUARDANDO_CONTRATO');
            expect(res.status()).toBe(200);
            const body = await res.json();
            expect(body).toHaveProperty('content');
            expect(body.content.length).toBeGreaterThan(0);
            expect(body.content[0].status).toBe('AGUARDANDO_CONTRATO');
        });
        test('Filtrar por cidade deve retornar apenas empresas da cidade especificada', async ({ api, empresa }) => {
            const empresaClient = new EmpresaClient(api);
            const res = await empresaClient.buscarEmpresasComFiltro('cidade', empresa.payload.cidade);
            expect(res.status()).toBe(200);
            const body = await res.json();
            expect(body).toHaveProperty('content');
            expect(body.content.length).toBeGreaterThan(0);
            expect(body.content[0].status).toBe('AGUARDANDO_CONTRATO');
            expect(body.content[0].cidade).toBe(empresa.payload.cidade);
        });
        test('Filtrar por estado deve retornar apenas empresas do estado especificado', async ({ api, empresa }) => {
            const empresaClient = new EmpresaClient(api);
            const res = await empresaClient.buscarEmpresasComFiltro('estado', empresa.payload.estado);
            expect(res.status()).toBe(200);
            const body = await res.json();
            expect(body).toHaveProperty('content');
            expect(body.content.length).toBeGreaterThan(0);
            expect(body.content[0].status).toBe('AGUARDANDO_CONTRATO');
            expect(body.content[0].estado).toBe(empresa.payload.estado);
        });
        test('Filtrar por razaoSocial deve retornar apenas empresas com razaoSocial especificado', async ({ api, empresa }) => {
            const empresaClient = new EmpresaClient(api);
            const res = await empresaClient.buscarEmpresasComFiltro('razaoSocial', empresa.payload.razaoSocial);
            expect(res.status()).toBe(200);
            const body = await res.json();
            expect(body).toHaveProperty('content');
            expect(body.content.length).toBeGreaterThan(0);
            expect(body.content[0].status).toBe('AGUARDANDO_CONTRATO');
            expect(body.content[0].razaoSocial).toBe(empresa.payload.razaoSocial);
        });
        test('Filtrar por documentNumber deve retornar apenas empresas com documentNumber especificado', async ({ api, empresa }) => {
            const empresaClient = new EmpresaClient(api);
            const res = await empresaClient.buscarEmpresasComFiltro('documentNumber', empresa.payload.documentNumber);
            expect(res.status()).toBe(200);
            const body = await res.json();
            expect(body).toHaveProperty('content');
            expect(body.content.length).toBeGreaterThan(0);
            expect(body.content[0].status).toBe('AGUARDANDO_CONTRATO');
            expect(body.content[0].documentNumber).toBe(empresa.payload.documentNumber);
        });
        test('Filtrar por email deve retornar apenas empresas com email especificado', async ({ api, empresa }) => {
            const empresaClient = new EmpresaClient(api);
            const res = await empresaClient.buscarEmpresasComFiltro('email', empresa.payload.email);
            expect(res.status()).toBe(200);
            const body = await res.json();
            expect(body).toHaveProperty('content');
            expect(body.content.length).toBeGreaterThan(0);
            expect(body.content[0].status).toBe('AGUARDANDO_CONTRATO');
            expect(body.content[0].email).toBe(empresa.payload.email);
        });
    });
    test.describe('Cenários negativo', () => {
        test('Buscar empresa com ID inexistente deve retornar 404', async ({ api }) => {
            const empresaClient = new EmpresaClient(api);
            const res = await empresaClient.buscarEmpresa('f385b59b-fda1-4dcf-ad1a-8df0cd008d15');
            const body = await res.json();
            expect(res.status()).toBe(404);
        });
        test('Filtro sem resultados deve retornar lista vazia', async ({ api }) => {
            const empresaClient = new EmpresaClient(api);
            const res = await empresaClient.buscarEmpresasComFiltro('documentNumber', '80281117000120');
            expect(res.status()).toBe(200);
            const body = await res.json();
            expect(body).toHaveProperty('content');
            expect(body.content.length).toBe(0);
        });
    });
})