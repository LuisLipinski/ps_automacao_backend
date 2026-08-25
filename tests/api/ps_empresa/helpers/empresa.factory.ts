import { novaEmpresa, EmpresaPayload } from './ps_empresa.payload';
import { ApiClient } from '../../../shared/api.client';
import { EmpresaClient } from '../clients/ps_empresa.client';

export async function criarEmpresa(
  api: ApiClient,
  overrides: Partial<EmpresaPayload> = {}
): Promise<EmpresaCriada> {
  const payload = novaEmpresa(overrides);
  const client = new EmpresaClient(api);
  const res = await client.criarEmpresa(payload);

  if (res.status() !== 201) {
    const text = await res.text();
    throw new Error(`Falha ao criar empresa.\nStatus: ${res.status()}\nResponse: ${text}\nPayload: ${JSON.stringify(payload, null, 2)}`);
  }

  return {
    payload,
    response: await res.json()
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
