export class EmpresaClient {
    constructor(private api: any) {}

    private headers() {
        const internalKey = process.env.PS_EMPRESA_INTERNAL_KEY;
        return internalKey
            ? { 'X-Internal-Key': internalKey, 'Content-Type': 'application/json' }
            : { 'Content-Type': 'application/json' };
    }

    private shouldFallback(status: number) {
        return [401, 403, 404, 405].includes(status);
    }

    async criarEmpresa(payload: any) {
        const response = await this.api.post('/internal/empresas', {
            data: payload,
            headers: this.headers()
        });

        if (this.shouldFallback(response.status())) {
            return await this.api.post('/empresas/createEmpresas', { data: payload });
        }
        return response;
    }

    async buscarEmpresa(id: string) {
        const response = await this.api.get(`/empresas/${id}`, { headers: this.headers() });
        if (this.shouldFallback(response.status())) {
            return await this.api.get(`/empresas/buscaEmpresas/${id}`);
        }
        return response;
    }

    async buscarTodasEmpresas() {
        const response = await this.api.get('/empresas?size=100', { headers: this.headers() });
        if (this.shouldFallback(response.status())) {
            return await this.api.get('/empresas/buscaEmpresas?size=1000');
        }
        return response;
    }

    async buscarEmpresasComFiltro(filtro: string, valor: string) {
        const response = await this.api.get(`/empresas?${filtro}=${valor}&size=100`, { headers: this.headers() });
        if (this.shouldFallback(response.status())) {
            return await this.api.get(`/empresas/buscaEmpresas?${filtro}=${valor}&size=1000`);
        }
        return response;
    }

    async editarEmpresa(id: string, payload: any) {
        const response = await this.api.patch(`/empresas/${id}`, {
            data: payload,
            headers: this.headers()
        });
        if (this.shouldFallback(response.status())) {
            return await this.api.put(`/empresas/editEmpresa/${id}`, { data: payload });
        }
        return response;
    }

    async excluirEmpresa(id: string) {
        const response = await this.api.delete(`/empresas/${id}`, { headers: this.headers() });
        if (this.shouldFallback(response.status())) {
            return await this.api.delete(`/empresas/excluirEmpresa/${id}`);
        }
        return response;
    }
}
