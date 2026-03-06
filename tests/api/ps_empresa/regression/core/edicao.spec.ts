import { test, expect } from '../../fixtures/empresa.fixture';
import { criarEmpresa } from '../../helpers/empresa.factory';
import { faker } from '@faker-js/faker';

test.describe('@core Edição de empresa - Regressivo', () => {
    test.describe('Cenários positivo', () => {
        test('Atualização parcial deve atualizar apenas campos enviados', async ({ api }) => {
            const empresa = await criarEmpresa(api);

            const email = faker.internet.email()
            const telefone = '41999999999'

            const res = await api.put(
                `/empresas/editEmpresa/${empresa.response.id}`,
                {
                        telefone: telefone,
                        email: email
                        
                }
            );


            console.log('Response:', await res.text());

            expect(res.status()).toBe(200);

            const body = await res.json();

            expect(body.telefone).toBe(telefone);
            expect(body.email).toBe(email);
        });
    });
});
