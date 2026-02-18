import { test, expect } from '../fixtures/empresa.fixture';
import { novaEmpresa } from '../helpers/ps_empresa.payload';

test.describe('PS_Empresa - CNPJ duplicado', () => {
    test('não deve permitir cadastrar duas empresas com o mesmo CNPJ', async ({ api, empresa}) => {
        const payload = novaEmpresa();
        payload.documentNumber = empresa.payload.documentNumber;

        const res = await api.post('/empresas/createEmpresas', payload);

        expect(res.status()).toBe(400);

        const body = await res.json();
        expect(JSON.stringify(body)).toContain('CNPJ');
    })
})