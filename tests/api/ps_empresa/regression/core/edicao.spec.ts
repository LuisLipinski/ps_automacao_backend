/*
import { test, expect } from '../../fixtures/empresa.fixture';
import { criarEmpresa } from '../../helpers/empresa.factory';
import { faker } from '@faker-js/faker';

test.describe('@core Edição de empresa - Regressivo', () => {
    test.describe('Cenários positivo', () => {
        test('Atualização parcial deve atualizar apenas campos enviados', async ({ api }) => {
            const empresa = await criarEmpresa(api);

            const updatePayload = {
                telefone: '41999999999',
                email: faker.internet.email()
            };

            const res = await api.put(
                `/empresas/editEmpresa/${empresa.response.id}`,
                { json: updatePayload }
            );

            expect(res.status()).toBe(200);

            const body = await res.json();

            expect(body.telefone).toBe(updatePayload.telefone);
            expect(body.email).toBe(updatePayload.email);
        });
    });
});
*/