import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  /* Pasta onde o playwright procura os testes */
  testDir: './tests',
  /* Roda os testes em paralelo */
  fullyParallel: true,
  /* falha CI se você esquecer test.only */
  forbidOnly: !!process.env.CI,
  /* tenta novamente se falhar para API vai ficar zerado */
  retries: process.env.CI ? 0 : 0,
  /* limita a quantidade de excução em paralelo "comentado pois não precisa para a API" */
  // workers: process.env.CI ? 1 : undefined,
  /* gera os reportes https://playwright.dev/docs/test-reporters */
  reporter: 'html',

  /* Configuração dos projetos de API */
  projects: [
  /* Cofiguração para o MS ps_empresa */
    {
      name: 'ps_empresa',
      testDir: './tests/api/ps_empresa',
      use: {
        baseURL: 'http://localhost:8081',
        extraHTTPHeaders: {
          'Content-Type': 'application/json'
        }
      }
    },
    /* Cofiguração para o MS ps_contrato */
    {
      name: 'ps_contrato',
      testDir: './tests/api/ps_contrato',
      use: {
        baseURL: 'http://localhost:8082',
        extraHTTPHeaders: {
          'Content-Type': 'application/json'
        }
      }
    }
  ]
  /* compartilha as configurações para todas as plataforma abaixo. See https://playwright.dev/docs/api/class-testoptions. */
  // use: {
  //   /* Base URL usado quando chamado pelo `await page.goto('')`. */
  //   // baseURL: 'http://localhost:3000',

  //   /* grava a trace do browser See https://playwright.dev/docs/trace-viewer  não será usado na api*/
  //   trace: 'on-first-retry',
  // },

  /* configura execução em browsers diferentes */
  // projects: [
  //   {
  //     name: 'chromium',
  //     use: { ...devices['Desktop Chrome'] },
  //   },

  //   {
  //     name: 'firefox',
  //     use: { ...devices['Desktop Firefox'] },
  //   },

  //   {
  //     name: 'webkit',
  //     use: { ...devices['Desktop Safari'] },
  //   },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  // ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
