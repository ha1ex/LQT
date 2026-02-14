import { test, expect } from '@playwright/test';

/**
 * Login flow E2E tests.
 *
 * The app authenticates via VITE_APP_PASSWORD env var (checked at build-time
 * via import.meta.env). The Playwright webServer config injects
 * VITE_APP_PASSWORD=test123 so the password used in these tests matches.
 */

test.describe('Login Screen', () => {
  test.beforeEach(async ({ page }) => {
    // Clear auth state so the login screen is always shown
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('lqt_authenticated'));
    await page.reload();
  });

  test('renders the login page with expected elements', async ({ page }) => {
    // The title of the app
    await expect(page.getByText('Качество Жизни')).toBeVisible();

    // Subtitle / description
    await expect(page.getByText('Введите пароль для входа')).toBeVisible();

    // Password input field (placeholder text)
    await expect(page.getByPlaceholder('Пароль')).toBeVisible();

    // Submit button
    await expect(page.getByRole('button', { name: 'Войти' })).toBeVisible();

    // Lock icon should be present (rendered inside a div)
    // Just ensure the page has the card structure
    await expect(page.locator('.max-w-md')).toBeVisible();
  });

  test('shows error message for wrong password', async ({ page }) => {
    const passwordInput = page.getByPlaceholder('Пароль');
    const submitButton = page.getByRole('button', { name: 'Войти' });

    // Type a wrong password
    await passwordInput.fill('wrongpassword');
    await submitButton.click();

    // Error message should appear (Russian: "Неверный пароль")
    await expect(page.getByText('Неверный пароль')).toBeVisible();

    // Password field should be cleared after wrong attempt
    await expect(passwordInput).toHaveValue('');
  });

  test('clears error message when user starts typing again', async ({ page }) => {
    const passwordInput = page.getByPlaceholder('Пароль');
    const submitButton = page.getByRole('button', { name: 'Войти' });

    // Trigger error
    await passwordInput.fill('wrongpassword');
    await submitButton.click();
    await expect(page.getByText('Неверный пароль')).toBeVisible();

    // Start typing again -- error should disappear
    await passwordInput.fill('a');
    await expect(page.getByText('Неверный пароль')).not.toBeVisible();
  });

  test('logs in successfully with correct password', async ({ page }) => {
    const passwordInput = page.getByPlaceholder('Пароль');
    const submitButton = page.getByRole('button', { name: 'Войти' });

    // The password is set via VITE_APP_PASSWORD in playwright.config.ts
    await passwordInput.fill('test123');
    await submitButton.click();

    // After login we should see the main app content.
    // The sidebar shows "Life Quality" branding on desktop.
    // We wait for either the sidebar branding or the mobile header.
    await expect(
      page.getByText('Life Quality').first()
    ).toBeVisible({ timeout: 10_000 });

    // The login screen should be gone
    await expect(page.getByText('Введите пароль для входа')).not.toBeVisible();
  });

  test('persists authentication across page reloads', async ({ page }) => {
    const passwordInput = page.getByPlaceholder('Пароль');
    const submitButton = page.getByRole('button', { name: 'Войти' });

    // Log in
    await passwordInput.fill('test123');
    await submitButton.click();
    await expect(page.getByText('Life Quality').first()).toBeVisible({ timeout: 10_000 });

    // Reload the page
    await page.reload();

    // Should still be logged in (no login screen)
    await expect(page.getByText('Life Quality').first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByPlaceholder('Пароль')).not.toBeVisible();
  });

  test('toggle password visibility works', async ({ page }) => {
    const passwordInput = page.getByPlaceholder('Пароль');

    // Initially the input type should be "password"
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click the eye toggle button (it's a sibling button within the relative div)
    await page.locator('button:has(svg)').filter({ has: page.locator('svg') }).first().click();

    // Now it should be "text"
    await expect(passwordInput).toHaveAttribute('type', 'text');
  });
});
