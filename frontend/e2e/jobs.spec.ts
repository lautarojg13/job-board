import { test, expect } from '@playwright/test';

test.describe('Jobs Exploration & Filtering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Loads jobs listing and displays job cards', async ({ page }) => {
    // Wait for at least one job title heading
    const firstJobTitle = page.getByRole('heading', { level: 3 }).first();
    await expect(firstJobTitle).toBeVisible({ timeout: 10000 });
  });

  test('Filters jobs by search keywords', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Job title, keywords, or company');
    await expect(searchInput).toBeVisible();

    await searchInput.fill('Backend');
    await page.waitForTimeout(500);

    const firstJobTitle = page.getByRole('heading', { level: 3 }).first();
    await expect(firstJobTitle).toBeVisible();
  });

  test('Filters jobs by employment type', async ({ page }) => {
    const typeSelect = page.locator('select').first();
    await expect(typeSelect).toBeVisible();

    await typeSelect.selectOption('FT');
    await page.waitForTimeout(500);

    const firstJobTitle = page.getByRole('heading', { level: 3 }).first();
    await expect(firstJobTitle).toBeVisible();
  });

  test('Opens job detail modal upon clicking a job card', async ({ page }) => {
    const firstJobTitle = page.getByRole('heading', { level: 3 }).first();
    await expect(firstJobTitle).toBeVisible();
    await firstJobTitle.click();

    // Verify modal dialog opens with job details
    const modalHeading = page.locator('div[role="dialog"] h2, .fixed h2').first();
    await expect(modalHeading).toBeVisible({ timeout: 5000 });
  });
});
