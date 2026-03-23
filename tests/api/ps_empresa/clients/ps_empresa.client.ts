export class EmpresaClient {
    constructor(private api: any) {}

    async criarEmpresa(payload: any) {
        return await this.api.post('/empresas/createEmpresas', payload);
    }

    async buscarEmpresa(id: string) {
        return await this.api.get(`/empresas/buscaEmpresas/${id}`);
    }

    async buscarTodasEmpresas() {
        return await this.api.get('/empresas/buscaEmpresas?size=1000');
    }

    async buscarEmpresasComFiltro(filtro: string, valor: string) {
        return await this.api.get(`/empresas/buscaEmpresas?${filtro}=${valor}&size=1000`);
    }

    async editarEmpresa(id: string, payload: any) {
        return await this.api.put(`/empresas/editEmpresa/${id}`, payload);
    }

    async excluirEmpresa(id: string) {
        return await this.api.delete(`/empresas/deleteEmpresa/${id}`);
    }
}