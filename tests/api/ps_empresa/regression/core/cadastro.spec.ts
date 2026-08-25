import { test, expect } from '../../fixtures/empresa.fixture';
import { novaEmpresa } from '../../helpers/ps_empresa.payload';
import { EmpresaClient } from '../../clients/ps_empresa.client';

test.describe('@core Cadastro de empresa - Regressivo', () => {
    test('cadastro válido deve criar empresa em AGUARDANDO_CONTRATO', async ({ api }) => {
        const client = new EmpresaClient(api);
        const payload = novaEmpresa();

        const res = await client.criarEmpresa(payload);
        expect(res.status()).toBe(201);

        const body = await res.json();
        expect(body.status).toBe('AGUARDANDO_CONTRATO');
        expect(body.documentNumber).toBe(payload.documentNumber);
        expect(body.email).toBe(payload.email);
        expect(body.id).toMatch(/^[0-9a-f-]{36}$/);

        const persisted = await client.buscarEmpresa(body.id);
        expect(persisted.status()).toBe(200);
        expect((await persisted.json()).status).toBe('AGUARDANDO_CONTRATO');
    });

    test('deve montar endereço com complemento', async ({ api }) => {
        const client = new EmpresaClient(api);
        const payload = novaEmpresa({
            rua: 'Rua das Oliveiras',
            numero: '154',
            complemento: 'Bloco 03',
            bairro: 'Centro'
        });

        const res = await client.criarEmpresa(payload);
        expect(res.status()).toBe(201);
        expect((await res.json()).endereco).toBe('Rua das Oliveiras, 154 - Bloco 03, Centro');
    });

    test('deve montar endereço sem complemento', async ({ api }) => {
        const client = new EmpresaClient(api);
        const payload = novaEmpresa({
            rua: 'Rua das Oliveiras',
            numero: '154',
            complemento: null,
            bairro: 'Centro'
        });

        const res = await client.criarEmpresa(payload);
        expect(res.status()).toBe(201);
        expect((await res.json()).endereco).toBe('Rua das Oliveiras, 154, Centro');
    });

    test('não deve permitir duas empresas com o mesmo CNPJ', async ({ api, empresa }) => {
        const client = new EmpresaClient(api);
        const payload = novaEmpresa({ documentNumber: empresa.payload.documentNumber });

        const res = await client.criarEmpresa(payload);
        expect([400, 409]).toContain(res.status());
        expect(JSON.stringify(await res.json())).toContain('CNPJ');
    });

    test('não deve permitir empresas com o mesmo email', async ({ api, empresa }) => {
        const client = new EmpresaClient(api);
        const payload = novaEmpresa({ email: empresa.payload.email });

        const res = await client.criarEmpresa(payload);
        expect([400, 409]).toContain(res.status());
        expect(JSON.stringify(await res.json()).toLowerCase()).toContain('email');
    });

    test('não deve permitir nem persistir CNPJ matematicamente inválido', async ({ api }) => {
        const client = new EmpresaClient(api);
        const invalidCnpj = '12345678901234';

        const res = await client.criarEmpresa(novaEmpresa({ documentNumber: invalidCnpj }));
        expect(res.status()).toBe(400);
        expect(JSON.stringify(await res.json())).toContain('CNPJ');

        const persisted = await client.buscarTodasEmpresas('page=0&size=100');
        expect(persisted.status()).toBe(200);
        const page = await persisted.json();
        expect(page.content.some((empresa: { documentNumber?: string }) => empresa.documentNumber === invalidCnpj)).toBe(false);
    });

    test('deve validar campos obrigatórios', async ({ api }) => {
        const client = new EmpresaClient(api);
        const payload = novaEmpresa({
            documentNumber: '',
            razaoSocial: '',
            nomeFantasia: '',
            telefone: '',
            email: '',
            nomeTitular: '',
            cep: '',
            cidade: '',
            estado: '',
            rua: '',
            numero: '',
            bairro: ''
        });

        const res = await client.criarEmpresa(payload);
        expect(res.status()).toBe(400);
        const body = JSON.stringify(await res.json());
        for (const field of ['documentNumber', 'razaoSocial', 'nomeFantasia', 'telefone', 'email', 'nomeTitular', 'cep', 'cidade', 'estado', 'rua', 'numero', 'bairro']) {
            expect(body).toContain(field);
        }
    });
});
