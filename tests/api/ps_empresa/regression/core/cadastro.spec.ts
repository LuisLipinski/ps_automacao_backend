    import { test, expect } from '../../fixtures/empresa.fixture';
    import { novaEmpresa, EmpresaPayload } from '../../helpers/ps_empresa.payload';

test.describe('@core Cadastro de empresa - Regressivo', () => {
    test.describe('Cenários positivo', () => {
        test('Cadastro com dados válidos deve criar empresa com sucesso', async ({ api }) => {
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

            expect(body.status).toBe('AGUARDANDO_CONTRATO');

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
            expect(empresaPersistida.razaoSocial).toBe(payload.razaoSocial);
            expect(empresaPersistida.nomeFantasia).toBe(payload.nomeFantasia);
            expect(empresaPersistida.telefone).toBe(payload.telefone);
            expect(empresaPersistida.email).toBe(payload.email);
            expect(empresaPersistida.nomeTitular).toBe(payload.nomeTitular);
            expect(empresaPersistida.cep).toBe(payload.cep)
            expect(empresaPersistida.cidade).toBe(payload.cidade);
            expect(empresaPersistida.estado).toBe(payload.estado);
            expect(empresaPersistida.endereco).toBe(payload.rua +  ', ' + payload.numero + ' - ' + payload.complemento + ', ' + payload.bairro)
            expect(empresaPersistida.status).toBe('AGUARDANDO_CONTRATO');
        })

        test('Status inicial deve ser AGUARDANDO_CONTRATO', async ({ api }) => {
            const payload = novaEmpresa();

            const response = await api.post('/empresas/createEmpresas', payload);
            expect(response.status()).toBe(201);

            const body = await response.json();

            expect(body.status).toBe(`AGUARDANDO_CONTRATO`);

            const getResponse = await api.get(`/empresas/buscaEmpresas/${body.id}`);
            expect(getResponse.status()).toBe(200);

            const empresaPersistida = await getResponse.json();

            expect(empresaPersistida.status).toBe('AGUARDANDO_CONTRATO');

            
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


    test.describe('Cenários negativo', () => {
        test('não deve permitir cadastrar duas empresas com o mesmo CNPJ', async ({ api, empresa }) => {
            const payload = novaEmpresa();
            payload.documentNumber = empresa.payload.documentNumber;

            const res = await api.post('/empresas/createEmpresas', payload);

            expect(res.status()).toBe(400);

            const body = await res.json();
            expect(JSON.stringify(body)).toContain('CNPJ');
        })

        test('não deve permitir cadastro de empresas com mesmo email', async ({ api, empresa }) => {

            const payload = novaEmpresa();
            payload.email = empresa.payload.email;
            const res = await api.post('/empresas/createEmpresas', payload);
            expect(res.status()).toBe(400);
            const body = await res.json();
            expect(JSON.stringify(body)).toContain('email');
        })

        test('não deve permitir cnpj invalido', async ({ api }) => {
            const payload = novaEmpresa();
            payload.documentNumber = '12345678901234';
            const res = await api.post('/empresas/createEmpresas', payload);
            expect(res.status()).toBe(400);
            const body = await res.json();
            expect(JSON.stringify(body)).toContain('CNPJ');
        })

        test('não deve permitir estado com tamanho diferente de 2', async ({ api }) => {
            const payload = novaEmpresa();
            payload.estado = 'SPP';
            const res = await api.post('/empresas/createEmpresas', payload);
            expect(res.status()).toBe(400);
            const body = await res.json();
            expect(JSON.stringify(body)).toContain('estado');
        })

        test('não deve permitir CEP com tamanho diferente de 8', async ({ api }) => {
            const payload = novaEmpresa();
            payload.cep = '1234567';
            const res = await api.post('/empresas/createEmpresas', payload);
            expect(res.status()).toBe(400);
            const body = await res.json();
            expect(JSON.stringify(body)).toContain('cep');
        })

        test('não deve permitir telefone com tamanho diferente de 11', async ({ api }) => {
            const payload = novaEmpresa();
            payload.telefone = '1234567890';
            const res = await api.post('/empresas/createEmpresas', payload);
            expect(res.status()).toBe(400);
            const body = await res.json();
            expect(JSON.stringify(body)).toContain('telefone');
        })

        test('não deve permitir campos obrigatórios nulos ou vazios', async ({ api }) => {
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
            const res = await api.post('/empresas/createEmpresas', payload);
            expect(res.status()).toBe(400); 
            const body = await res.json();
            expect(JSON.stringify(body)).toContain('documentNumber');
            expect(JSON.stringify(body)).toContain('razaoSocial');
            expect(JSON.stringify(body)).toContain('nomeFantasia');
            expect(JSON.stringify(body)).toContain('telefone');
            expect(JSON.stringify(body)).toContain('email');
            expect(JSON.stringify(body)).toContain('nomeTitular');
            expect(JSON.stringify(body)).toContain('cep');
            expect(JSON.stringify(body)).toContain('cidade');
            expect(JSON.stringify(body)).toContain('estado');
            expect(JSON.stringify(body)).toContain('rua');
            expect(JSON.stringify(body)).toContain('numero');
            expect(JSON.stringify(body)).toContain('bairro');
        })
    })
})
