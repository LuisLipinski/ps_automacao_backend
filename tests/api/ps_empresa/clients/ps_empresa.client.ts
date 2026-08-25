import { ApiClient } from '../../../shared/api.client';

export class EmpresaClient {
    constructor(private api: ApiClient) {}

    private headers() {
        const internalKey = process.env.PS_EMPRESA_INTERNAL_KEY;
        if (!internalKey || internalKey.trim().length === 0) {
            throw new Error('PS_EMPRESA_INTERNAL_KEY deve estar configurada para testes autenticados do PS_Empresa');
        }
        return { 'X-Internal-Key': internalKey };
    }

    async criarEmpresa(payload: unknown) {
        return this.api.post('/internal/empresas', payload, this.headers());
    }

    async consultarStatus(id: string) {
        return this.api.get(`/internal/empresas/${id}/status`, this.headers());
    }

    async buscarEmpresa(id: string) {
        return this.api.get(`/empresas/${id}`, this.headers());
    }

    async buscarTodasEmpresas(query = 'page=0&size=100') {
        return this.api.get(`/empresas?${query}`, this.headers());
    }

    async buscarEmpresasComFiltro(filtro: string, valor: string) {
        const encodedValue = encodeURIComponent(valor);
        return this.api.get(`/empresas?${filtro}=${encodedValue}&page=0&size=100`, this.headers());
    }

    async editarEmpresa(id: string, payload: unknown) {
        return this.api.patch(`/empresas/${id}`, payload, this.headers());
    }

    async excluirEmpresa(id: string) {
        return this.api.delete(`/empresas/${id}`, this.headers());
    }

    async sincronizarStatusContrato(empresaId: string, statusContrato: 'AGUARDANDO_PAGAMENTO' | 'PENDENTE_PAGAMENTO' | 'ATIVO' | 'INATIVO') {
        return this.api.patch(
            '/internal/contratos/status',
            { empresaId, statusContrato },
            this.headers()
        );
    }
}
