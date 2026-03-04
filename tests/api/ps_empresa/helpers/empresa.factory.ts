import { novaEmpresa, EmpresaPayload } from './ps_empresa.payload';
import { ApiClient } from '../../../shared/api.client';

export async function criarEmpresa(api: ApiClient,
    overrides: Partial<EmpresaPayload> = {}
): Promise<EmpresaCriada> {
  const payload = novaEmpresa(overrides);

  const res = await api.post('/empresas/createEmpresas', payload);

  if (res.status() !== 201) {
    const text = await res.text();
    throw new Error(`Falha ao criar empresa.
    Status: ${res.status()}
    Response: ${text}
    Payload: ${JSON.stringify(payload, null, 2)}`);
  }

  const body = await res.json();

  return {
    payload,
    response: body
  };
}

export type EmpresaResponse = {
  id: string;
  documentNumber: string;
  razaoSocial: string;
  nomeFantasia: string;
  telefone: string;
  email: string;
  nomeTitular: string;
  cep: string;
  cidade: string;
  estado: string;
  endereco: string;
  status: 'ATIVO' | 'INATIVO' | 'AGUARDANDO_CONTRATO';
};


export type EmpresaCriada = {
  payload: EmpresaPayload;
  response: EmpresaResponse;
};

