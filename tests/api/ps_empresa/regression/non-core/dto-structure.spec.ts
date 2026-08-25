import { test } from '../../fixtures/empresa.fixture';
import { validarContratoEmpresa } from '../../helpers/ps_empresa.assertion';

test.describe('PS_Empresa - contrato de resposta', () => {
  test('deve manter a estrutura oficial do EmpresaResponseDTO', async ({ empresa }) => {
    validarContratoEmpresa(empresa.response);
  });
});
