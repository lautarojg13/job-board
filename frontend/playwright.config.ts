import { defineConfig, devices } from '@playwright/test';

const e2eApiBaseUrl = process.env.E2E_API_BASE_URL ?? 'http://localhost:8000';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
    launchOptions: {
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    env: {
      VITE_ENABLE_DEMO_MODE: 'false',
      VITE_API_BASE_URL: e2eApiBaseUrl,
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
