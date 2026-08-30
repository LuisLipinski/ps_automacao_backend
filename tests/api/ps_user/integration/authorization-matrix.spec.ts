import { expect, test } from '@playwright/test';

const destructive = process.env.RUN_DESTRUCTIVE_INTEGRATION === 'true';
const internalKey = process.env.PS_USER_INTERNAL_KEY;
const primaryMasterId = process.env.QA_PRIMARY_MASTER_USER_ID;
const secondaryMasterId = process.env.QA_SECONDARY_MASTER_USER_ID;

const operationalRoles = ['LOJA', 'VETERINARIO', 'BANHO', 'HOTEL', 'CRECHE'] as const;

type CreatedUser = { id: string; role: string; email: string };

function uniqueEmail(prefix: string) {
  return `${prefix}.${Date.now()}.${Math.random().toString(36).slice(2)}@example.test`;
}

test.describe('@integration PS_User - matriz de autorização', () => {
  test.skip(!destructive, 'Executa apenas em QA/ambiente efêmero');
  test.skip(!internalKey || !primaryMasterId, 'Requer PS_USER_INTERNAL_KEY e QA_PRIMARY_MASTER_USER_ID');

  test('cobre criação, gestão, proteção do primary master e isolamento do tenant', async ({ request }) => {
    const headers = { 'X-Internal-Key': internalKey! };
    const created: CreatedUser[] = [];

    const createAs = async (actorId: string, role: string) => {
      const email = uniqueEmail(role.toLowerCase());
      const response = await request.post('/internal/usuarios', {
        headers: { ...headers, 'X-Actor-User-Id': actorId },
        data: { nome: `QA ${role}`, email, role }
      });
      return { response, email };
    };

    const cleanup = async () => {
      for (const user of [...created].reverse()) {
        await request.delete(`/internal/usuarios/${user.id}`, {
          headers: { ...headers, 'X-Actor-User-Id': primaryMasterId! }
        });
      }
    };

    try {
      for (const role of ['MASTER', 'ADMIN', 'ADMIN', ...operationalRoles]) {
        const { response, email } = await createAs(primaryMasterId!, role);
        expect(response.status(), `MASTER deve criar ${role}`).toBe(201);
        const body = await response.json();
        expect(body.roles).toContain(role);
        expect(body.primaryMaster).toBe(false);
        created.push({ id: body.id, role, email });
      }

      const admins = created.filter(user => user.role === 'ADMIN');
      expect(admins).toHaveLength(2);
      const [admin, targetAdmin] = admins;

      for (const role of operationalRoles) {
        const { response, email } = await createAs(admin.id, role);
        expect(response.status(), `ADMIN deve criar ${role}`).toBe(201);
        const body = await response.json();
        created.push({ id: body.id, role, email });
      }

      for (const forbiddenRole of ['MASTER', 'ADMIN']) {
        const { response } = await createAs(admin.id, forbiddenRole);
        expect(response.status(), `ADMIN não pode criar ${forbiddenRole}`).toBe(403);
        expect((await response.json()).code).toBe('USER_OPERATION_FORBIDDEN');
      }

      const loja = created.find(user => user.role === 'LOJA')!;
      const { response: operationalAttempt } = await createAs(loja.id, 'CRECHE');
      expect(operationalAttempt.status()).toBe(403);
      expect((await operationalAttempt.json()).code).toBe('USER_OPERATION_FORBIDDEN');

      const deleteAdminByAdmin = await request.delete(`/internal/usuarios/${targetAdmin.id}`, {
        headers: { ...headers, 'X-Actor-User-Id': admin.id }
      });
      expect(deleteAdminByAdmin.status()).toBe(403);
      expect((await deleteAdminByAdmin.json()).code).toBe('USER_OPERATION_FORBIDDEN');

      const managedOperational = created.find(user => user.role === 'HOTEL')!;
      const roleUpdate = await request.patch(`/internal/usuarios/${managedOperational.id}/role`, {
        headers: { ...headers, 'X-Actor-User-Id': admin.id },
        data: { role: 'CRECHE' }
      });
      expect(roleUpdate.status()).toBe(200);
      expect((await roleUpdate.json()).roles).toContain('CRECHE');
      managedOperational.role = 'CRECHE';

      const forbiddenPromotion = await request.patch(`/internal/usuarios/${managedOperational.id}/role`, {
        headers: { ...headers, 'X-Actor-User-Id': admin.id },
        data: { role: 'MASTER' }
      });
      expect(forbiddenPromotion.status()).toBe(403);
      expect((await forbiddenPromotion.json()).code).toBe('USER_OPERATION_FORBIDDEN');

      const statusUpdate = await request.patch(`/internal/usuarios/${managedOperational.id}/status`, {
        headers: { ...headers, 'X-Actor-User-Id': admin.id },
        data: { status: 'INATIVO' }
      });
      expect(statusUpdate.status()).toBe(200);
      expect((await statusUpdate.json()).status).toBe('INATIVO');

      const reactivate = await request.patch(`/internal/usuarios/${managedOperational.id}/status`, {
        headers: { ...headers, 'X-Actor-User-Id': primaryMasterId! },
        data: { status: 'ATIVO' }
      });
      expect(reactivate.status()).toBe(200);

      const deletePrimaryMaster = await request.delete(`/internal/usuarios/${primaryMasterId}`, {
        headers: { ...headers, 'X-Actor-User-Id': primaryMasterId! }
      });
      expect(deletePrimaryMaster.status()).toBe(409);
      expect((await deletePrimaryMaster.json()).code).toBe('USER_PRIMARY_MASTER_PROTECTED');

      const demotePrimaryMaster = await request.patch(`/internal/usuarios/${primaryMasterId}/role`, {
        headers: { ...headers, 'X-Actor-User-Id': primaryMasterId! },
        data: { role: 'ADMIN' }
      });
      expect(demotePrimaryMaster.status()).toBe(409);
      expect((await demotePrimaryMaster.json()).code).toBe('USER_PRIMARY_MASTER_PROTECTED');

      const deactivatePrimaryMaster = await request.patch(`/internal/usuarios/${primaryMasterId}/status`, {
        headers: { ...headers, 'X-Actor-User-Id': primaryMasterId! },
        data: { status: 'INATIVO' }
      });
      expect(deactivatePrimaryMaster.status()).toBe(409);
      expect((await deactivatePrimaryMaster.json()).code).toBe('USER_PRIMARY_MASTER_PROTECTED');

      const filtered = await request.get('/internal/usuarios', {
        headers: { ...headers, 'X-Actor-User-Id': primaryMasterId! },
        params: { role: 'ADMIN', page: 0, size: 20, sortBy: 'nome', sortDirection: 'asc' }
      });
      expect(filtered.status()).toBe(200);
      const filteredBody = await filtered.json();
      expect(filteredBody.content.length).toBeGreaterThanOrEqual(2);
      expect(filteredBody.content.every((user: { roles: string[] }) => user.roles.includes('ADMIN'))).toBe(true);

      const invalidPage = await request.get('/internal/usuarios', {
        headers: { ...headers, 'X-Actor-User-Id': primaryMasterId! },
        params: { page: -1 }
      });
      expect(invalidPage.status()).toBe(400);
      expect((await invalidPage.json()).code).toBe('USER_INVALID_REQUEST');

      const invalidSort = await request.get('/internal/usuarios', {
        headers: { ...headers, 'X-Actor-User-Id': primaryMasterId! },
        params: { sortBy: 'senha' }
      });
      expect(invalidSort.status()).toBe(400);
      expect((await invalidSort.json()).code).toBe('USER_INVALID_REQUEST');

      if (secondaryMasterId) {
        const crossTenantGet = await request.get(`/internal/usuarios/${admin.id}`, {
          headers: { ...headers, 'X-Actor-User-Id': secondaryMasterId }
        });
        expect(crossTenantGet.status()).toBe(404);
        expect((await crossTenantGet.json()).code).toBe('USER_NOT_FOUND');

        const crossTenantDelete = await request.delete(`/internal/usuarios/${admin.id}`, {
          headers: { ...headers, 'X-Actor-User-Id': secondaryMasterId }
        });
        expect(crossTenantDelete.status()).toBe(404);
        expect((await crossTenantDelete.json()).code).toBe('USER_NOT_FOUND');

        const secondaryList = await request.get('/internal/usuarios', {
          headers: { ...headers, 'X-Actor-User-Id': secondaryMasterId },
          params: { email: admin.email }
        });
        expect(secondaryList.status()).toBe(200);
        expect((await secondaryList.json()).content).toHaveLength(0);
      }
    } finally {
      await cleanup();
    }
  });
});
