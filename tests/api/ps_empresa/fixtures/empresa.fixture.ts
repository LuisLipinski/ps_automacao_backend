import { test as base } from '@playwright/test';
import { ApiClient } from '../../../shared/api.client';
import { criarEmpresa, EmpresaCriada } from '../helpers/empresa.factory';
import { EmpresaClient } from '../clients/ps_empresa.client';

type EmpresaFixture = {
  api: ApiClient;
  empresa: EmpresaCriada;
};

export const test = base.extend<EmpresaFixture>({
  api: async ({ request }, use) => {
    const api = new ApiClient(request);
    await use(api);
  },

  empresa: async ({ api }, use) => {
    const criada = await criarEmpresa(api);
    try {
      await use(criada);
    } finally {
      const client = new EmpresaClient(api);
      await client.excluirEmpresa(criada.response.id);
    }
  },
});

export { expect } from '@playwright/test';
