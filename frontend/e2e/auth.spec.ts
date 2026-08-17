import { test, expect } from '@playwright/test';
import { E2E_USERS } from './users';
import { loginAs, submitLogin, escapeRegex } from './helpers';

test.describe('Authentication Flows', () => {
  test('Seeker can sign in, see username in header, and sign out', async ({ page }) => {
    // Perform login
    await loginAs(page, E2E_USERS.seeker.username, E2E_USERS.seeker.password);

    // Verify username button in header
    const escapedUsername = escapeRegex(E2E_USERS.seeker.username);
    const profileBtn = page.getByRole('button', { name: new RegExp(escapedUsername, 'i') });
    await expect(profileBtn).toBeVisible();

    // Click Log Out button in header
    const logoutBtn = page.getByTitle('Log Out');
    await expect(logoutBtn).toBeVisible();
    await logoutBtn.click();

    // Verify header returns to unauthenticated state with 'Sign In'
    const signInBtn = page.getByRole('button', { name: 'Sign In' });
    await expect(signInBtn).toBeVisible();
  });

  test('Shows error message with invalid credentials', async ({ page }) => {
    await page.goto('/');

    const signInBtn = page.getByRole('button', { name: 'Sign In' });
    await signInBtn.click();

    const usernameInput = page.getByPlaceholder('e.g. alex_dev');
    await usernameInput.fill('invalid_user_999');

    const passwordInput = page.getByPlaceholder('••••••••');
    await passwordInput.fill('WrongPassword123!');

    // Use scoped submit button
    await submitLogin(page);

    // An alert or error message should be displayed
    const errorAlert = page.locator('text=/failed|invalid|credentials/i').first();
    await expect(errorAlert).toBeVisible({ timeout: 8000 });
  });
});
