import { test, expect } from '../../fixtures/empresa.fixture';
import { criarEmpresa } from '../../helpers/empresa.factory';
import { faker } from '@faker-js/faker';
import { EmpresaClient } from '../../clients/ps_empresa.client';

test.describe('@core Edição de empresa - Regressivo', () => {
    test.describe('Cenários positivo', () => {
        test('Atualização parcial deve atualizar apenas campos enviados', async ({ api }) => {
            const empresaClient = new EmpresaClient(api);
            const empresa = await criarEmpresa(api);

            const email = faker.internet.email()
            const telefone = '41999999999'

            const res = await empresaClient.editarEmpresa(
                empresa.response.id,
                {
                        telefone: telefone,
                        email: email
                        
                }
            );


            expect(res.status()).toBe(200);

            const body = await res.json();

            expect(body.telefone).toBe(telefone);
            expect(body.email).toBe(email);
            expect(body.documentNumber).toBe(empresa.payload.documentNumber);
            expect(body.razaoSocial).toBe(empresa.payload.razaoSocial);
            expect(body.nomeFantasia).toBe(empresa.payload.nomeFantasia);
            expect(body.nomeTitular).toBe(empresa.payload.nomeTitular);
            expect(body.cep).toBe(empresa.payload.cep)
            expect(body.cidade).toBe(empresa.payload.cidade);
            expect(body.estado).toBe(empresa.payload.estado);
            expect(body.endereco).toBe(empresa.payload.rua +  ', ' + empresa.payload.numero + ' - ' + empresa.payload.complemento + ', ' + empresa.payload.bairro);

            const getResponse = await empresaClient.buscarEmpresa(empresa.response.id);
            expect(getResponse.status()).toBe(200);
            const empresaAtualizada = await getResponse.json();

            expect(empresaAtualizada.telefone).toBe(telefone);
            expect(empresaAtualizada.email).toBe(email);
            expect(empresaAtualizada.documentNumber).toBe(empresa.payload.documentNumber);
            expect(empresaAtualizada.razaoSocial).toBe(empresa.payload.razaoSocial);
            expect(empresaAtualizada.nomeFantasia).toBe(empresa.payload.nomeFantasia);
            expect(empresaAtualizada.nomeTitular).toBe(empresa.payload.nomeTitular);
            expect(empresaAtualizada.cep).toBe(empresa.payload.cep)
            expect(empresaAtualizada.cidade).toBe(empresa.payload.cidade);
            expect(empresaAtualizada.estado).toBe(empresa.payload.estado);
            expect(empresaAtualizada.endereco).toBe(empresa.payload.rua +  ', ' + empresa.payload.numero + ' - ' + empresa.payload.complemento + ', ' + empresa.payload.bairro);
        });
        test('Atualização completa deve atualizar todos os campos', async ({ api }) => {
            const empresaClient = new EmpresaClient(api);
            const empresa = await criarEmpresa(api);   
            
            const nomeFantasia= faker.company.name()
            const nomeTitular= faker.person.fullName()
            const email= faker.internet.email()
            const telefone = '41999999999'
            const cep = faker.location.zipCode('#####-###')
            const cidade = faker.location.city()
            const estado = faker.location.state({ abbreviated: true })
            const rua = faker.location.street()
            const numero = faker.location.buildingNumber()
            const complemento = faker.location.secondaryAddress()
            const bairro = 'Centro'


            const res = await empresaClient.editarEmpresa(
                empresa.response.id,
                {                
                nomeFantasia: nomeFantasia,
                nomeTitular: nomeTitular,
                email: email,
                telefone: telefone,
                cep: cep,
                cidade: cidade,
                estado: estado,
                rua: rua,
                numero: numero,
                complemento: complemento,
                bairro: bairro
                }
            );

            expect(res.status()).toBe(200);
            const body = await res.json();

            expect(body.nomeFantasia).toBe(nomeFantasia);
            expect(body.nomeTitular).toBe(nomeTitular);
            expect(body.email).toBe(email);
            expect(body.telefone).toBe(telefone);
            expect(body.cep).toBe(cep)
            expect(body.cidade).toBe(cidade);
            expect(body.estado).toBe(estado);
            expect(body.endereco).toBe(rua +  ', ' + numero + ' - ' + complemento + ', ' + bairro);

            const getResponse = await empresaClient.buscarEmpresa(empresa.response.id);
            expect(getResponse.status()).toBe(200);
            const empresaAtualizada = await getResponse.json();
            expect(empresaAtualizada.nomeFantasia).toBe(nomeFantasia);
            expect(empresaAtualizada.nomeTitular).toBe(nomeTitular);
            expect(empresaAtualizada.email).toBe(email);
            expect(empresaAtualizada.telefone).toBe(telefone);
            expect(empresaAtualizada.cep).toBe(cep)
            expect(empresaAtualizada.cidade).toBe(cidade);
            expect(empresaAtualizada.estado).toBe(estado);
            expect(empresaAtualizada.endereco).toBe(rua +  ', ' + numero + ' - ' + complemento + ', ' + bairro);
        });

        test('Atualização de apenas um campo deve manter os outros inalterados', async ({ api }) => {
            const empresaClient = new EmpresaClient(api);
            const empresa = await criarEmpresa(api);   
            const email= faker.internet.email()
            const res = await empresaClient.editarEmpresa(
                empresa.response.id,
                {                
                email: email
                }
            );
            expect(res.status()).toBe(200);
            const body = await res.json();
            expect(body.email).toBe(email);
            expect(body.documentNumber).toBe(empresa.payload.documentNumber);
            expect(body.razaoSocial).toBe(empresa.payload.razaoSocial);
            expect(body.nomeFantasia).toBe(empresa.payload.nomeFantasia);
            expect(body.nomeTitular).toBe(empresa.payload.nomeTitular);
            expect(body.cep).toBe(empresa.payload.cep)
            expect(body.cidade).toBe(empresa.payload.cidade);
            expect(body.estado).toBe(empresa.payload.estado);
            expect(body.endereco).toBe(empresa.payload.rua +  ', ' + empresa.payload.numero + ' - ' + empresa.payload.complemento + ', ' + empresa.payload.bairro);

            const getResponse = await empresaClient.buscarEmpresa(empresa.response.id);
            expect(getResponse.status()).toBe(200);
            const empresaAtualizada = await getResponse.json();
            expect(empresaAtualizada.email).toBe(email);
            expect(empresaAtualizada.documentNumber).toBe(empresa.payload.documentNumber);
            expect(empresaAtualizada.razaoSocial).toBe(empresa.payload.razaoSocial);
            expect(empresaAtualizada.nomeFantasia).toBe(empresa.payload.nomeFantasia);
            expect(empresaAtualizada.nomeTitular).toBe(empresa.payload.nomeTitular);
            expect(empresaAtualizada.cep).toBe(empresa.payload.cep)
            expect(empresaAtualizada.cidade).toBe(empresa.payload.cidade);
            expect(empresaAtualizada.estado).toBe(empresa.payload.estado);
            expect(empresaAtualizada.endereco).toBe(empresa.payload.rua +  ', ' + empresa.payload.numero + ' - ' + empresa.payload.complemento + ', ' + empresa.payload.bairro);
        })

        test('Atualização do endereço sem complemento deve manter o campo complemento vazio deve remover o complemento do endereço', async ({ api }) => {
            const empresaClient = new EmpresaClient(api);
            const empresa = await criarEmpresa(api);   
            const rua = faker.location.street()
            const numero = faker.location.buildingNumber()
            const bairro = 'Centro'
            const complemento = null
            const res = await empresaClient.editarEmpresa(
                empresa.response.id,
                {                
                rua: rua,
                numero: numero,
                bairro: bairro,
                complemento: ''
                }
            );
            expect(res.status()).toBe(200);
            const body = await res.json();
            expect(body.endereco).toBe(rua +  ', ' + numero + ', ' + bairro);
            expect(body.documentNumber).toBe(empresa.payload.documentNumber);
            expect(body.razaoSocial).toBe(empresa.payload.razaoSocial);
            expect(body.nomeFantasia).toBe(empresa.payload.nomeFantasia);
            expect(body.nomeTitular).toBe(empresa.payload.nomeTitular);
            expect(body.cep).toBe(empresa.payload.cep)
            expect(body.cidade).toBe(empresa.payload.cidade);
            expect(body.estado).toBe(empresa.payload.estado);

            const getResponse = await empresaClient.buscarEmpresa(empresa.response.id);
            expect(getResponse.status()).toBe(200);
            const empresaAtualizada = await getResponse.json();
            expect(empresaAtualizada.endereco).toBe(rua +  ', ' + numero + ', ' + bairro);
            expect(empresaAtualizada.documentNumber).toBe(empresa.payload.documentNumber);
            expect(empresaAtualizada.razaoSocial).toBe(empresa.payload.razaoSocial);
            expect(empresaAtualizada.nomeFantasia).toBe(empresa.payload.nomeFantasia);
            expect(empresaAtualizada.nomeTitular).toBe(empresa.payload.nomeTitular);
            expect(empresaAtualizada.cep).toBe(empresa.payload.cep)
            expect(empresaAtualizada.cidade).toBe(empresa.payload.cidade);
            expect(empresaAtualizada.estado).toBe(empresa.payload.estado);

        });
    });

    test.describe('Cenários negativo', () => {
        test('Atualizar empresa com ID inexistente deve retornar 404', async ({ api }) => {
            const empresaClient = new EmpresaClient(api);
            const res = await empresaClient.editarEmpresa(
                'f385b59b-fda1-4dcf-ad1a-8df0cd008d15',
                {                
                nomeFantasia: faker.company.name()
                }
            );
            expect(res.status()).toBe(404);
        });
        test('Não deve permitir atualizar empresa com email ja existente', async ({ api }) => {
            const empresaClient = new EmpresaClient(api);
            const empresa1 = await criarEmpresa(api);
            const empresa2 = await criarEmpresa(api);
            const res = await empresaClient.editarEmpresa(
                empresa2.response.id,
                {                
                email: empresa1.payload.email
                }
            );
            expect(res.status()).toBe(400);

        })
    });
});
