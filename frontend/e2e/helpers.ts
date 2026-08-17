import { Page, expect } from '@playwright/test';

/**
 * Returns a unique alphanumeric suffix based on timestamp and random string
 * for isolated entity creation across E2E test runs.
 */
export function uniqueSuffix(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Clicks the submit button inside the login form to avoid strict-mode collisions
 * with the header "Sign In" button.
 */
export async function submitLogin(page: Page): Promise<void> {
  const submitButton = page.locator('form').getByRole('button', { name: 'Sign In' });
  await submitButton.click();
}

/**
 * Helper to log in a user through the UI modal flow
 */
export async function loginAs(page: Page, username: string, password: string): Promise<void> {
  await page.goto('/');

  // Look for Sign In button in header
  const signInButton = page.getByRole('button', { name: 'Sign In' });
  await expect(signInButton).toBeVisible({ timeout: 10000 });
  await signInButton.click();

  // Fill credentials inside AuthModal LoginForm
  const usernameInput = page.getByPlaceholder('e.g. alex_dev');
  await expect(usernameInput).toBeVisible();
  await usernameInput.fill(username);

  const passwordInput = page.getByPlaceholder('••••••••');
  await passwordInput.fill(password);

  // Click Submit scoped to form
  await submitLogin(page);

  // Wait for authenticated state indicator with username in header
  const escapedUsername = escapeRegex(username);
  const userAccountButton = page.getByRole('button', { name: new RegExp(escapedUsername, 'i') });
  await expect(userAccountButton).toBeVisible({ timeout: 10000 });
}
