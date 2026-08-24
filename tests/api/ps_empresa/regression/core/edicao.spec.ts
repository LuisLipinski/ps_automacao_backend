import { test, expect } from '../../fixtures/empresa.fixture';
import { criarEmpresa } from '../../helpers/empresa.factory';
import { faker } from '@faker-js/faker';
import { EmpresaClient } from '../../clients/ps_empresa.client';

test.describe('@core Edição de empresa - Regressivo', () => {
    test('atualização parcial deve alterar somente os campos enviados', async ({ api }) => {
        const client = new EmpresaClient(api);
        const empresa = await criarEmpresa(api);
        const email = faker.internet.email();
        const telefone = '41999999999';

        const res = await client.editarEmpresa(empresa.response.id, { telefone, email });
        expect(res.status()).toBe(200);

        const body = await res.json();
        expect(body.telefone).toBe(telefone);
        expect(body.email).toBe(email);
        expect(body.documentNumber).toBe(empresa.payload.documentNumber);
        expect(body.razaoSocial).toBe(empresa.payload.razaoSocial);
        expect(body.nomeFantasia).toBe(empresa.payload.nomeFantasia);
        expect(body.status).toBe(empresa.response.status);
    });

    test('atualização completa deve aceitar dados válidos', async ({ api }) => {
        const client = new EmpresaClient(api);
        const empresa = await criarEmpresa(api);
        const update = {
            nomeFantasia: 'Pet Shop Atualizado',
            nomeTitular: 'Maria da Silva',
            email: faker.internet.email(),
            telefone: '41988887777',
            cep: '80000000',
            cidade: 'Curitiba',
            estado: 'PR',
            rua: 'Rua das Flores',
            numero: '150',
            complemento: 'Sala 2',
            bairro: 'Centro'
        };

        const res = await client.editarEmpresa(empresa.response.id, update);
        expect(res.status()).toBe(200);

        const body = await res.json();
        expect(body.nomeFantasia).toBe(update.nomeFantasia);
        expect(body.nomeTitular).toBe(update.nomeTitular);
        expect(body.email).toBe(update.email);
        expect(body.telefone).toBe(update.telefone);
        expect(body.cep).toBe(update.cep);
        expect(body.cidade).toBe(update.cidade);
        expect(body.estado).toBe(update.estado);
        expect(body.endereco).toBe('Rua das Flores, 150 - Sala 2, Centro');
    });

    test('deve permitir manter o próprio email da empresa', async ({ api }) => {
        const client = new EmpresaClient(api);
        const empresa = await criarEmpresa(api);

        const res = await client.editarEmpresa(empresa.response.id, {
            email: empresa.payload.email,
            nomeFantasia: 'Mesmo Email Pet'
        });

        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(body.email).toBe(empresa.payload.email);
        expect(body.nomeFantasia).toBe('Mesmo Email Pet');
    });

    test('deve remover complemento quando enviado vazio', async ({ api }) => {
        const client = new EmpresaClient(api);
        const empresa = await criarEmpresa(api);

        const res = await client.editarEmpresa(empresa.response.id, {
            rua: 'Rua Nova',
            numero: '200',
            bairro: 'Centro',
            complemento: ''
        });

        expect(res.status()).toBe(200);
        expect((await res.json()).endereco).toBe('Rua Nova, 200, Centro');
    });

    test('ID inexistente deve retornar 404', async ({ api }) => {
        const client = new EmpresaClient(api);
        const res = await client.editarEmpresa(
            'f385b59b-fda1-4dcf-ad1a-8df0cd008d15',
            { nomeFantasia: 'Empresa Inexistente' }
        );
        expect(res.status()).toBe(404);
    });

    test('não deve permitir email pertencente a outra empresa', async ({ api }) => {
        const client = new EmpresaClient(api);
        const empresa1 = await criarEmpresa(api);
        const empresa2 = await criarEmpresa(api);

        const res = await client.editarEmpresa(empresa2.response.id, {
            email: empresa1.payload.email
        });

        expect([400, 409]).toContain(res.status());
    });

    test('deve validar payload parcial inválido', async ({ api }) => {
        const client = new EmpresaClient(api);
        const empresa = await criarEmpresa(api);

        const res = await client.editarEmpresa(empresa.response.id, { telefone: '123' });
        expect(res.status()).toBe(400);
        expect(JSON.stringify(await res.json()).toLowerCase()).toContain('telefone');
    });
});
