import { test, expect } from '@playwright/test';
import { E2E_USERS } from './users';
import { loginAs, uniqueSuffix } from './helpers';

test.describe('Employer Job Management CRUD', () => {
  test('Employer can create, view, and delete a job posting', async ({ page }) => {
    // 1. Log in as employer
    await loginAs(page, E2E_USERS.employer.username, E2E_USERS.employer.password);

    // 2. Navigate to Employer Dashboard
    const employerNavBtn = page.getByRole('button', { name: /Employer Portal/i });
    await expect(employerNavBtn).toBeVisible({ timeout: 10000 });
    await employerNavBtn.click();

    // 3. Switch to 'Post New Job' tab
    const postJobTabBtn = page.getByRole('button', { name: /\+ Post New Job/i });
    await expect(postJobTabBtn).toBeVisible({ timeout: 10000 });
    await postJobTabBtn.click();

    // Fill new job details
    const uniqueTitle = `Senior Staff Engineer ${uniqueSuffix()}`;
    const titleInput = page.getByPlaceholder(/Senior Backend Engineer/i);
    await expect(titleInput).toBeVisible();
    await titleInput.fill(uniqueTitle);

    const descTextarea = page.getByPlaceholder(/Specify requirements, tech stack, and benefits/i);
    await expect(descTextarea).toBeVisible();
    await descTextarea.fill('Architecting scalable distributed web services with Django and React.');

    // Submit Job
    const publishBtn = page.getByRole('button', { name: /Publish Job Post/i });
    await expect(publishBtn).toBeVisible();
    await publishBtn.click();

    // 4. Switch to 'My Job Postings' tab and verify created job appears
    const myJobsTabBtn = page.getByRole('button', { name: /My Job Postings/i });
    await expect(myJobsTabBtn).toBeVisible();
    await myJobsTabBtn.click();

    const createdJobTitle = page.getByText(uniqueTitle);
    await expect(createdJobTitle).toBeVisible({ timeout: 10000 });

    // 5. Delete the created job
    const deleteBtn = page.locator(`div:has-text("${uniqueTitle}")`).getByTitle('Delete Job').first();
    await expect(deleteBtn).toBeVisible();

    page.once('dialog', dialog => dialog.accept());
    await deleteBtn.click();

    await expect(createdJobTitle).not.toBeVisible({ timeout: 10000 });
  });
});
