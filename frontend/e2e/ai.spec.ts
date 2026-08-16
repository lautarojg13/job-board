import { test, expect } from '@playwright/test';
import path from 'path';
import { E2E_USERS } from './users';
import { loginAs } from './helpers';

const runAiE2E = !!process.env.RUN_AI_E2E;

test.describe('AI Powered Features & Async Celery Tasks', () => {
  test('AI Match Agent prompt search toggles and queries job suggestions', async ({ page }) => {
    test.skip(!runAiE2E, 'requires Celery + Ollama backend running (set RUN_AI_E2E=1)');
    await page.goto('/');

    const aiAgentBtn = page.getByRole('button', { name: /AI Match Agent/i });
    await expect(aiAgentBtn).toBeVisible({ timeout: 10000 });
    await aiAgentBtn.click();

    // Verify AI prompt input is shown
    const promptInput = page.getByPlaceholder(/Describe ideal role, skills/i);
    await expect(promptInput).toBeVisible();

    await promptInput.fill('Senior React and TypeScript remote developer');

    const searchBtn = page.getByRole('button', { name: /Find Matches/i });
    await expect(searchBtn).toBeVisible();
    await searchBtn.click();
  });

  test('Resume Match Inspector triggers async resume analysis and displays evaluation', async ({ page }) => {
    test.skip(!runAiE2E, 'requires Celery + Ollama backend running (set RUN_AI_E2E=1)');

    // Must log in as seeker for authenticated resume endpoint
    await loginAs(page, E2E_USERS.seeker.username, E2E_USERS.seeker.password);

    // Open a job detail modal to access resume analyzer
    const viewDetailsBtn = page.getByRole('button', { name: /View Details/i }).first();
    await expect(viewDetailsBtn).toBeVisible({ timeout: 10000 });
    await viewDetailsBtn.click();

    // Click 'Analyze Resume Fit' button inside modal
    const analyzeBtn = page.getByRole('button', { name: /Analyze Resume Match/i });
    await expect(analyzeBtn).toBeVisible();
    await analyzeBtn.click();

    // Attach fixture resume PDF
    const resumePath = path.resolve(__dirname, 'fixtures/sample-resume.pdf');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(resumePath);

    // Trigger analysis
    const runAnalysisBtn = page.getByRole('button', { name: /Run Match Analysis/i });
    await expect(runAnalysisBtn).toBeVisible();
    await runAnalysisBtn.click();

    // Verify task initiation and task ID rendering
    await expect(page.locator('text=/Task ID:/i')).toBeVisible({ timeout: 10000 });

    // Wait for task completion or evaluation score
    const resultScore = page.locator('text=/Match Score|Task Completed|SUCCESS/i').first();
    await expect(resultScore).toBeVisible({ timeout: 30000 });
  });
});
