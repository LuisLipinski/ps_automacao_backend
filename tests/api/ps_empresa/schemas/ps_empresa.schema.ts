export const empresaSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
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
  ],
  properties: {
    id: { type: 'string' },
    documentNumber: { type: 'string' },
    razaoSocial: { type: 'string' },
    nomeFantasia: { type: 'string' },
    telefone: { type: 'string' },
    email: { type: 'string' },
    nomeTitular: { type: 'string' },
    cep: { type: 'string' },
    cidade: { type: 'string' },
    estado: { type: 'string' },
    endereco: { type: 'string' },
    status: { enum: ['ATIVO', 'INATIVO', 'AGUARDANDO_CONTRATO'] }
  }
} as const;
