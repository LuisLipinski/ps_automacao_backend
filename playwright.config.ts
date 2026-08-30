import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  expect: {
    timeout: 10_000
  },
  use: {
    trace: 'retain-on-failure',
    extraHTTPHeaders: {
      'Content-Type': 'application/json'
    }
  },
  projects: [
    {
      name: 'ps_empresa',
      testDir: './tests/api/ps_empresa',
      use: { baseURL: process.env.PS_EMPRESA_URL ?? 'http://localhost:8081' },
      timeout: 120_000
    },
    {
      name: 'ps_contrato',
      testDir: './tests/api/ps_contrato',
      use: { baseURL: process.env.PS_CONTRATO_URL ?? 'http://localhost:8082' },
      timeout: 120_000
    },
    {
      name: 'ps_user',
      testDir: './tests/api/ps_user',
      use: { baseURL: process.env.PS_USER_URL ?? 'http://localhost:8083' },
      timeout: 120_000
    },
    {
      name: 'ps_login',
      testDir: './tests/api/ps_login',
      use: { baseURL: process.env.PS_LOGIN_URL ?? 'http://localhost:8084' },
      timeout: 120_000
    },
    {
      name: 'ps_orchestrator',
      testDir: './tests/api/ps_orchestrator',
      use: { baseURL: process.env.PS_ORCHESTRATOR_URL ?? 'http://localhost:8085' },
      timeout: 120_000
    },
    {
      name: 'ps_gateway',
      testDir: './tests/api/ps_gateway',
      use: { baseURL: process.env.PS_GATEWAY_URL ?? 'http://localhost:8080' },
      timeout: 120_000
    }
  ]
});
