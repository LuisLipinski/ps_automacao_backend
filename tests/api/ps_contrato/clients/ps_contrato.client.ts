import { ApiClient } from '../../../shared/api.client';

export class ContratoClient {
  constructor(private api: ApiClient) {}

  private headers() {
    const internalKey = process.env.PS_CONTRATO_INTERNAL_KEY;
    if (!internalKey || internalKey.trim().length === 0) {
      throw new Error('PS_CONTRATO_INTERNAL_KEY deve estar configurada para testes autenticados do PS_Contrato');
    }
    return { 'X-Internal-Key': internalKey };
  }

  async criarContrato(empresaId: string) {
    return this.api.post('/contratos', { empresaId }, this.headers());
  }

  async atualizarStatus(contratoId: string, statusId: number) {
    return this.api.patch(`/contratos/${contratoId}/status`, { statusId }, this.headers());
  }

  async buscarContratos(query = '') {
    const suffix = query ? `?${query}` : '';
    return this.api.get(`/contratos${suffix}`, this.headers());
  }
}
