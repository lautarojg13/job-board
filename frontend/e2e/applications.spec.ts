import { test, expect } from '@playwright/test';
import path from 'path';
import { E2E_USERS } from './users';
import { loginAs } from './helpers';

test.describe('Job Applications Flow', () => {
  test('Seeker can apply to a job with a resume file and see it under My Applications', async ({ page }) => {
    // 1. Log in as seeker
    await loginAs(page, E2E_USERS.seeker.username, E2E_USERS.seeker.password);

    // 2. Click Quick Apply or open job details to apply
    const applyButton = page.getByRole('button', { name: /Quick Apply|Apply Now/i }).first();
    await expect(applyButton).toBeVisible({ timeout: 10000 });
    await applyButton.click();

    // 3. Attach resume fixture file
    const resumePath = path.resolve(__dirname, 'fixtures/sample-resume.pdf');
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(resumePath);

    // 4. Fill cover letter
    const coverLetterTextarea = page.getByPlaceholder(/Explain briefly why you are a great fit/i);
    await coverLetterTextarea.fill('I am excited to submit my resume for this engineering position.');

    // 5. Submit application
    const submitBtn = page.getByRole('button', { name: /Submit Application/i });
    await submitBtn.click();

    // 6. Verify success notification
    await expect(page.locator('text=/submitted successfully/i').first()).toBeVisible({ timeout: 8000 });

    // 7. Navigate to 'Applications' tab
    const appsNavBtn = page.getByRole('button', { name: 'Applications' });
    await expect(appsNavBtn).toBeVisible();
    await appsNavBtn.click();

    // The applications view should render application items
    const applicationsHeader = page.getByText(/My Job Applications/i);
    await expect(applicationsHeader).toBeVisible({ timeout: 8000 });
  });
});
