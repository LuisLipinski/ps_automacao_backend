import { cnpj } from 'cpf-cnpj-validator';
import { faker } from '@faker-js/faker';

export type EmpresaPayload = {
  documentNumber: string;
  razaoSocial: string;
  nomeFantasia: string;
  telefone: string;
  email: string;
  nomeTitular: string;
  cep: string;
  cidade: string;
  estado: string;
  rua: string;
  numero: string;
  complemento?: string | null;
  bairro: string;
};

export function novaEmpresa( overrides: Partial<EmpresaPayload> = {}): EmpresaPayload {
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');

    const base: EmpresaPayload = {
        documentNumber: cnpj.generate(),
        razaoSocial: faker.company.name().replace(/[^\wÀ-ÿ0-9 ]/g, ''),
        nomeFantasia: faker.company.name().replace(/[^\wÀ-ÿ0-9 ]/g, ''),
        nomeTitular: gerarNomeTitularValido(),
        telefone: '11999999999',
        email: faker.internet.email(),
        rua: 'Rua A',
        numero: '100',
        complemento: 'casa',
        bairro: 'Centro',
        cidade: 'Curitiba',
        estado: 'PR',
        cep: '01010100',
    };

    return {
        ...base,
        ...overrides
    }
}

function gerarNomeTitularValido(): string {
  const nomes = [
    'Carlos Eduardo',
    'Mariana Silva',
    'Fernanda Oliveira',
    'Ricardo Pereira',
    'Gabriel Martins',
    'Juliana Ferreira',
    'Lucas Almeida',
    'Patricia Gomes'
  ];

  return nomes[Math.floor(Math.random() * nomes.length)];
}