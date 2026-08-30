import { expect, test } from '@playwright/test';

const destructive = process.env.RUN_DESTRUCTIVE_INTEGRATION === 'true';
const email = process.env.QA_MUTABLE_LOGIN_EMAIL;
const originalPassword = process.env.QA_MUTABLE_LOGIN_PASSWORD;
const newPassword = process.env.QA_MUTABLE_LOGIN_NEW_PASSWORD;

test.describe('@integration PS_Login - lifecycle de troca de senha', () => {
  test.skip(!destructive, 'Executa apenas em QA/ambiente efêmero');
  test.skip(!email || !originalPassword || !newPassword, 'Requer credenciais mutáveis de QA');

  test('troca senha, revoga sessão anterior, autentica com nova senha e restaura a senha original', async ({ request }) => {
    const login = async (password: string) => {
      return request.post('/auth/login', {
        data: { email, password }
      });
    };

    const firstLogin = await login(originalPassword!);
    expect(firstLogin.status()).toBe(200);
    const firstSession = await firstLogin.json();
    expect(firstSession.accessToken).toBeTruthy();
    expect(firstSession.refreshToken).toBeTruthy();

    let restored = false;

    try {
      const change = await request.post('/auth/password/change', {
        headers: { Authorization: `Bearer ${firstSession.accessToken}` },
        data: {
          currentPassword: originalPassword,
          newPassword,
          newPasswordConfirmation: newPassword
        }
      });
      expect(change.status()).toBe(204);

      const oldPasswordLogin = await login(originalPassword!);
      expect(oldPasswordLogin.status()).toBe(401);

      const revokedRefresh = await request.post('/auth/refresh', {
        data: { refreshToken: firstSession.refreshToken }
      });
      expect([400, 401]).toContain(revokedRefresh.status());

      const newPasswordLogin = await login(newPassword!);
      expect(newPasswordLogin.status()).toBe(200);
      const newSession = await newPasswordLogin.json();
      expect(newSession.accessToken).toBeTruthy();

      const wrongCurrentPassword = await request.post('/auth/password/change', {
        headers: { Authorization: `Bearer ${newSession.accessToken}` },
        data: {
          currentPassword: 'senha-incorreta-qa',
          newPassword: originalPassword,
          newPasswordConfirmation: originalPassword
        }
      });
      expect(wrongCurrentPassword.status()).toBe(401);

      const mismatch = await request.post('/auth/password/change', {
        headers: { Authorization: `Bearer ${newSession.accessToken}` },
        data: {
          currentPassword: newPassword,
          newPassword: originalPassword,
          newPasswordConfirmation: `${originalPassword}-mismatch`
        }
      });
      expect(mismatch.status()).toBe(400);

      const restore = await request.post('/auth/password/change', {
        headers: { Authorization: `Bearer ${newSession.accessToken}` },
        data: {
          currentPassword: newPassword,
          newPassword: originalPassword,
          newPasswordConfirmation: originalPassword
        }
      });
      expect(restore.status()).toBe(204);
      restored = true;

      const restoredLogin = await login(originalPassword!);
      expect(restoredLogin.status()).toBe(200);
    } finally {
      if (!restored) {
        const recoveryLogin = await login(newPassword!);
        if (recoveryLogin.status() === 200) {
          const recoverySession = await recoveryLogin.json();
          await request.post('/auth/password/change', {
            headers: { Authorization: `Bearer ${recoverySession.accessToken}` },
            data: {
              currentPassword: newPassword,
              newPassword: originalPassword,
              newPasswordConfirmation: originalPassword
            }
          });
        }
      }
    }
  });
});
