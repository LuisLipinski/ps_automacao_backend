import { expect, test } from '@playwright/test';

const destructive = process.env.RUN_DESTRUCTIVE_INTEGRATION === 'true';
const internalKey = process.env.PS_USER_INTERNAL_KEY;
const primaryMasterId = process.env.QA_PRIMARY_MASTER_USER_ID;

const operationalRoles = ['LOJA', 'VETERINARIO', 'BANHO', 'HOTEL', 'CRECHE'] as const;

type CreatedUser = { id: string; role: string };

function uniqueEmail(prefix: string) {
  return `${prefix}.${Date.now()}.${Math.random().toString(36).slice(2)}@example.test`;
}

test.describe('@integration PS_User - matriz de autorização', () => {
  test.skip(!destructive, 'Executa apenas em QA/ambiente efêmero');
  test.skip(!internalKey || !primaryMasterId, 'Requer PS_USER_INTERNAL_KEY e QA_PRIMARY_MASTER_USER_ID');

  test('MASTER cria todos os perfis; ADMIN apenas operacionais; primeiro MASTER permanece protegido', async ({ request }) => {
    const headers = { 'X-Internal-Key': internalKey! };
    const created: CreatedUser[] = [];

    const createAs = async (actorId: string, role: string) => {
      const response = await request.post('/internal/usuarios', {
        headers: { ...headers, 'X-Actor-User-Id': actorId },
        data: { nome: `QA ${role}`, email: uniqueEmail(role.toLowerCase()), role }
      });
      return response;
    };

    const cleanup = async () => {
      for (const user of [...created].reverse()) {
        await request.delete(`/internal/usuarios/${user.id}`, {
          headers: { ...headers, 'X-Actor-User-Id': primaryMasterId! }
        });
      }
    };

    try {
      for (const role of ['MASTER', 'ADMIN', ...operationalRoles]) {
        const response = await createAs(primaryMasterId!, role);
        expect(response.status(), `MASTER deve criar ${role}`).toBe(201);
        const body = await response.json();
        expect(body.roles).toContain(role);
        created.push({ id: body.id, role });
      }

      const admin = created.find(user => user.role === 'ADMIN');
      expect(admin).toBeTruthy();

      for (const role of operationalRoles) {
        const response = await createAs(admin!.id, role);
        expect(response.status(), `ADMIN deve criar ${role}`).toBe(201);
        const body = await response.json();
        created.push({ id: body.id, role });
      }

      for (const forbiddenRole of ['MASTER', 'ADMIN']) {
        const response = await createAs(admin!.id, forbiddenRole);
        expect(response.status(), `ADMIN não pode criar ${forbiddenRole}`).toBe(403);
        const body = await response.json();
        expect(body.code).toBe('USER_OPERATION_FORBIDDEN');
      }

      const loja = created.find(user => user.role === 'LOJA');
      expect(loja).toBeTruthy();
      const operationalAttempt = await createAs(loja!.id, 'CRECHE');
      expect(operationalAttempt.status()).toBe(403);
      expect((await operationalAttempt.json()).code).toBe('USER_OPERATION_FORBIDDEN');

      const deletePrimaryMaster = await request.delete(`/internal/usuarios/${primaryMasterId}`, {
        headers: { ...headers, 'X-Actor-User-Id': primaryMasterId! }
      });
      expect(deletePrimaryMaster.status()).toBe(409);
      expect((await deletePrimaryMaster.json()).code).toBe('USER_PRIMARY_MASTER_PROTECTED');

      const targetAdmin = created.find(user => user.role === 'ADMIN' && user.id !== admin!.id);
      if (targetAdmin) {
        const deleteAdminByAdmin = await request.delete(`/internal/usuarios/${targetAdmin.id}`, {
          headers: { ...headers, 'X-Actor-User-Id': admin!.id }
        });
        expect(deleteAdminByAdmin.status()).toBe(403);
        expect((await deleteAdminByAdmin.json()).code).toBe('USER_OPERATION_FORBIDDEN');
      }
    } finally {
      await cleanup();
    }
  });
});
