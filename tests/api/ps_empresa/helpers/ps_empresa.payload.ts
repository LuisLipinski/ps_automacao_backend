import { cnpj } from 'cpf-cnpj-validator';
import { faker } from '@faker-js/faker';

export function novaEmpresa() {
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');

    return {
        documentNumber: cnpj.generate(),
        razaoSocial: faker.company.name().replace(/[^\wÀ-ÿ0-9 ]/g, ''),
        nomeFantasia: faker.company.name().replace(/[^\wÀ-ÿ0-9 ]/g, ''),
        nomeTitular: faker.person.fullName().replace(/[^\wÀ-ÿ0-9 ]/g, ''),
        telefone: '11999999999',
        email: faker.internet.email(),
        rua: 'Rua A',
        numero: '100',
        bairro: 'Centro',
        cidade: 'Curitiba',
        estado: 'PR',
        cep: '01010100'
    };
}