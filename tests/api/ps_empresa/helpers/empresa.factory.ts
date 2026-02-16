import { novaEmpresa } from './ps_empresa.payload';
import { ApiClient } from '../../../shared/api.client';

export async function criarEmpresa(api: ApiClient) {
  const payload = novaEmpresa();

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


export type EmpresaCriada = {
  payload: any;
  response: any;
};

