import { test, expect } from '@playwright/test';

test('complete user flow: signup → create deck', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Sign Up');
  await page.fill('input[placeholder="Email"]', 'test@example.com');
  await page.fill('input[placeholder="Password"]', 'password123');
  await page.click('button:has-text("Sign Up")');
  // Wait for email confirm or mock; then login
  await page.goto('/login');
  await page.fill('input[placeholder="Email"]', 'test@example.com');
  await page.fill('input[placeholder="Password"]', 'password123');
  await page.click('button:has-text("Login")');
  await expect(page).toHaveURL(/dashboard/);
  await page.click('text=Create New Deck');
  await page.fill('textarea', 'Sample prompt for AI presentation');
  await page.click('input[value="info"]'); // Select gate
  await page.click('button:has-text("Generate Deck")');
  await expect(page).toHaveURL(/deck\/[^\/]+\/view/);
});