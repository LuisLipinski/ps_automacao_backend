import { test, expect } from '@playwright/test';

type JwtClaims = {
  sub?: string;
  empresaId?: string;
};

type ContractItem = {
  id: string;
  empresaId: string;
  numeroContrato: string;
  statusName: string;
  dataCriacao: string;
  dataAtualizacaoStatus: string;
};

type PageResponse = {
  content: ContractItem[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

function decodeJwtPayload(token: string): JwtClaims {
  const payload = token.split('.')[1];
  if (!payload) throw new Error('JWT sem payload');
  const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  return JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));
}

async function login(request: Parameters<typeof test>[0] extends never ? never : any) {
  const loginUrl = process.env.PS_LOGIN_URL;
  const email = process.env.QA_LOGIN_EMAIL;
  const password = process.env.QA_LOGIN_PASSWORD;

  test.skip(!loginUrl || !email || !password, 'Credenciais de QA não configuradas');

  const loginResponse = await request.post(`${loginUrl}/auth/login`, {
    data: { email, password }
  });
  expect(loginResponse.ok()).toBeTruthy();

  const loginBody = await loginResponse.json();
  expect(loginBody.accessToken).toBeTruthy();
  expect(loginBody.tokenType.toLowerCase()).toBe('bearer');

  const claims = decodeJwtPayload(loginBody.accessToken);
  expect(claims.sub).toBeTruthy();
  expect(claims.empresaId).toBeTruthy();

  return { accessToken: loginBody.accessToken as string, empresaId: claims.empresaId! };
}

function ids(page: PageResponse) {
  return page.content.map(contract => contract.id).sort();
}

test.describe('@integration PS_Login -> PS_Gateway -> PS_Contrato', () => {
  test('JWT deve restringir todos os contratos ao tenant autenticado', async ({ request }) => {
    const { accessToken, empresaId } = await login(request);

    const response = await request.get('/api/contracts', {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { size: 100 }
    });
    expect(response.ok()).toBeTruthy();

    const page = (await response.json()) as PageResponse;
    expect(page.number).toBe(0);
    expect(page.size).toBeLessThanOrEqual(100);
    expect(page.content.every(contract => contract.empresaId === empresaId)).toBe(true);
  });

  test('spoof de tenant não deve alterar o tenant derivado do JWT', async ({ request }) => {
    const { accessToken } = await login(request);

    const baseline = await request.get('/api/contracts', {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { size: 100 }
    });
    expect(baseline.ok()).toBeTruthy();
    const baselinePage = (await baseline.json()) as PageResponse;

    const spoofed = await request.get('/api/contracts', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Actor-Empresa-Id': '00000000-0000-0000-0000-000000000999',
        'X-Internal-Key': 'spoofed'
      },
      params: { size: 100 }
    });
    expect(spoofed.ok()).toBeTruthy();
    const spoofedPage = (await spoofed.json()) as PageResponse;

    expect(ids(spoofedPage)).toEqual(ids(baselinePage));
    expect(spoofedPage.totalElements).toBe(baselinePage.totalElements);
  });

  test('deve preservar paginação e ordenação na rota Gateway -> tenant', async ({ request }) => {
    const { accessToken, empresaId } = await login(request);

    const response = await request.get('/api/contracts', {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { page: 0, size: 2, sortField: 'DATA_CRIACAO', direction: 'ASC' }
    });
    expect(response.ok()).toBeTruthy();

    const page = (await response.json()) as PageResponse;
    expect(page.number).toBe(0);
    expect(page.size).toBe(2);
    expect(page.content.length).toBeLessThanOrEqual(2);
    expect(page.content.every(contract => contract.empresaId === empresaId)).toBe(true);

    const timestamps = page.content.map(contract => new Date(contract.dataCriacao).getTime());
    expect(timestamps).toEqual([...timestamps].sort((a, b) => a - b));
  });

  test('deve filtrar pelo número e status sem escapar do tenant', async ({ request }) => {
    const { accessToken, empresaId } = await login(request);

    const baseline = await request.get('/api/contracts', {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { size: 100 }
    });
    expect(baseline.ok()).toBeTruthy();
    const baselinePage = (await baseline.json()) as PageResponse;

    test.skip(baselinePage.content.length === 0, 'Tenant de QA ainda não possui contrato para validar filtros');
    const sample = baselinePage.content[0];

    const byNumber = await request.get('/api/contracts', {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { numeroContrato: sample.numeroContrato, size: 100 }
    });
    expect(byNumber.ok()).toBeTruthy();
    const numberPage = (await byNumber.json()) as PageResponse;
    expect(numberPage.content.length).toBeGreaterThanOrEqual(1);
    expect(numberPage.content.every(contract => contract.empresaId === empresaId)).toBe(true);
    expect(numberPage.content.every(contract => contract.numeroContrato === sample.numeroContrato)).toBe(true);

    const byStatus = await request.get('/api/contracts', {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { status: sample.statusName, size: 100 }
    });
    expect(byStatus.ok()).toBeTruthy();
    const statusPage = (await byStatus.json()) as PageResponse;
    expect(statusPage.content.every(contract => contract.empresaId === empresaId)).toBe(true);
    expect(statusPage.content.every(contract => contract.statusName === sample.statusName)).toBe(true);
  });

  test('parâmetros inválidos devem ser rejeitados antes de consultar o domínio', async ({ request }) => {
    const { accessToken } = await login(request);
    const headers = { Authorization: `Bearer ${accessToken}` };

    for (const params of [
      { page: -1 },
      { size: 0 },
      { size: 101 },
      { sortField: 'CAMPO_INEXISTENTE' },
      { direction: 'INVALIDA' }
    ]) {
      const response = await request.get('/api/contracts', { headers, params });
      expect(response.status(), `params=${JSON.stringify(params)}`).toBe(400);
    }
  });
});
