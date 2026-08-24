export class EmpresaClient {
    constructor(private api: any) {}

    private headers() {
        const internalKey = process.env.PS_EMPRESA_INTERNAL_KEY;
        if (!internalKey) {
            throw new Error('PS_EMPRESA_INTERNAL_KEY deve ser configurada para os testes do PS_Empresa');
        }

        return {
            'X-Internal-Key': internalKey,
            'Content-Type': 'application/json'
        };
    }

    async criarEmpresa(payload: any) {
        return await this.api.post('/internal/empresas', {
            data: payload,
            headers: this.headers()
        });
    }

    async buscarEmpresa(id: string) {
        return await this.api.get(`/empresas/${id}`, {
            headers: this.headers()
        });
    }

    async buscarTodasEmpresas() {
        return await this.api.get('/empresas?size=100', {
            headers: this.headers()
        });
    }

    async buscarEmpresasComFiltro(filtro: string, valor: string) {
        return await this.api.get(`/empresas?${filtro}=${valor}&size=100`, {
            headers: this.headers()
        });
    }

    async editarEmpresa(id: string, payload: any) {
        return await this.api.patch(`/empresas/${id}`, {
            data: payload,
            headers: this.headers()
        });
    }

    async excluirEmpresa(id: string) {
        return await this.api.delete(`/empresas/${id}`, {
            headers: this.headers()
        });
    }
}
