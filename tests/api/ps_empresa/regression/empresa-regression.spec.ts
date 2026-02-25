import { test, expect } from '../fixtures/empresa.fixture';
import { novaEmpresa, EmpresaPayload } from '../helpers/ps_empresa.payload';

//cenarios core
//cadastro de empresa
// cenarios positivo
test.describe('Cenários positivo', () => {
    test('Deve cadastrar empresa com todos os campos válidos', async ({ api }) => {
        const payload = novaEmpresa();

        const res = await api.post('/empresas/createEmpresas', payload);

        expect(res.status()).toBe(201);
        const body = await res.json();
        const expectedFields = [
            'id',
            'documentNumber',
            'razaoSocial',
            'nomeFantasia',
            'telefone',
            'email',
            'nomeTitular',
            'cep',
            'cidade',
            'estado',
            'endereco',
            'status'
        ];

        expect(Object.keys(body).sort()).toEqual(expectedFields.sort());

        expect(body.status).toBe('AGUARDANDO_PAGAMENTO');

        expect(body.documentNumber).toBe(payload.documentNumber);
        expect(body.razaoSocial).toBe(payload.razaoSocial);
        expect(body.nomeFantasia).toBe(payload.nomeFantasia);
        expect(body.telefone).toBe(payload.telefone);
        expect(body.email).toBe(payload.email);
        expect(body.nomeTitular).toBe(payload.nomeTitular);
        expect(body.cep).toBe(payload.cep)
        expect(body.cidade).toBe(payload.cidade);
        expect(body.estado).toBe(payload.estado);
        expect(body.endereco).toBe(payload.rua +  ', ' + payload.numero + ' - ' + payload.complemento + ', ' + payload.bairro)

        expect(body.id).toMatch(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
        )

        const getResponse = await api.get(`/empresas/buscaEmpresas/${body.id}`);
        expect(getResponse.status()).toBe(200);

        const empresaPersistida = await getResponse.json();

        expect(empresaPersistida.id).toBe(body.id);
        expect(empresaPersistida.documentNumber).toBe(payload.documentNumber);
        expect(empresaPersistida.status).toBe('AGUARDANDO_PAGAMENTO');
    })

    test('Deve salvar status inicial como AGUARDANDO_PAGAMENTO', async ({ api }) => {
        const payload = novaEmpresa();

        const response = await api.post('/empresas/createEmpresas', payload);
        expect(response.status()).toBe(201);

        const body = await response.json();

        expect(body.status).toBe(`AGUARDANDO_PAGAMENTO`);

        const getResponse = await api.get(`/empresas/buscaEmpresas/${body.id}`);
        expect(getResponse.status()).toBe(200);

        const empresaPersistida = await getResponse.json();

        expect(empresaPersistida.status).toBe('AGUARDANDO_PAGAMENTO');

        
    })
    test('Deve montar o campo endereco corretamente (rua + número + complemento + bairro', async ({ api }) => {
        const payload = novaEmpresa({
            rua: 'Rua das Oliveiras',
            numero: '154',
            complemento: 'Ap32 bloco 03',
            bairro: 'Centro'
        });

        const response = await api.post('/empresas/createEmpresas', payload);
        const body = await response.json();

        expect(body.endereco). toBe('Rua das Oliveiras, 154 - Ap32 bloco 03, Centro')
    })

    test('Deve montar o campo endereco corretamente sem complemento (rua + número + bairro', async ({ api }) => {
        const payload = novaEmpresa({
            rua: 'Rua das Oliveiras',
            numero: '154',
            complemento: null,
            bairro: 'Centro'
        });

        const response = await api.post('/empresas/createEmpresas', payload);
        const body = await response.json();

        expect(body.endereco).toBe('Rua das Oliveiras, 154, Centro')
    })

    test('Deve retorna EmpresaResponseDTO corretamente', async ({ api }) => {
        const payload = novaEmpresa();

        const res = await api.post('/empresas/createEmpresas', payload);

        expect(res.status()).toBe(201);
        const body = await res.json();
        const expectedFields = [
            'id',
            'documentNumber',
            'razaoSocial',
            'nomeFantasia',
            'telefone',
            'email',
            'nomeTitular',
            'cep',
            'cidade',
            'estado',
            'endereco',
            'status'
        ];

        for (const field of expectedFields) {
            expect(body).toHaveProperty(field);
        }

        expect(Object.keys(body).sort()).toEqual(expectedFields.sort());

    })

    

})


/* 

Deve retornar EmpresaResponseDTO corretamente */


test.describe('Cenários negativo', () => {
    test('não deve permitir cadastrar duas empresas com o mesmo CNPJ', async ({ api, empresa }) => {
        const payload = novaEmpresa();
        payload.documentNumber = empresa.payload.documentNumber;

        const res = await api.post('/empresas/createEmpresas', payload);

        expect(res.status()).toBe(400);

        const body = await res.json();
        expect(JSON.stringify(body)).toContain('CNPJ');
    })


})

//validação de contrato implicito

//Atualização de status
//Cenarios positivo

//cenarios negativo

//budca com filtros
//filtros individuais
//filtros combinados
//ordenação
//regras negativa

//busca por id

//exclusao logica
//cenarios positivos
//regras criticas

//edicao parcial
//cenarios positivos
//regras criticas

//Cenarios Regressivo complementar
//validação de Bean validation

//specification

//Mapper toEntity
//Mapper toResponseDto

//UpdateHelper + enderecoHelper

//Enum StatusEmpresa

//Regressivo de performance basico

//Segurança

