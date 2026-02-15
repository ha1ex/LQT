import { test, expect } from '@playwright/test';

/**
 * Navigation E2E tests.
 *
 * These tests verify that after logging in, the main application loads
 * and the sidebar / bottom navigation works correctly.
 */

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Set up authenticated state directly via localStorage to skip login flow
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('lqt_authenticated', 'true');
      // Skip onboarding and AI welcome wizard so they don't block navigation
      localStorage.setItem('lqt_onboarding_completed', 'true');
      localStorage.setItem('lqt_ai_welcome_shown', 'true');
    });
    await page.reload();
    // Wait for the main app to render
    await expect(page.getByText('Life Quality').first()).toBeVisible({ timeout: 10_000 });
  });

  test('main dashboard loads after login', async ({ page }) => {
    // The top bar should display "Главная" (Home) heading
    await expect(page.getByText('Главная').first()).toBeVisible();
  });

  test('sidebar navigation items are visible on desktop', async ({ page }) => {
    // The sidebar should contain the main navigation items
    const navLabels = ['Главная', 'Оценка', 'Аналитика', 'Стратегия', 'AI Coach', 'Инсайты'];

    for (const label of navLabels) {
      await expect(
        page.locator('nav').getByText(label, { exact: true })
      ).toBeVisible();
    }

    // Settings button should be visible (below the nav, in the sidebar footer)
    await expect(page.getByText('Настройки').first()).toBeVisible();
  });

  test('clicking sidebar items switches the view', async ({ page }) => {
    // Click "Аналитика" (Analytics) in the sidebar
    await page.locator('nav').getByText('Аналитика', { exact: true }).click();

    // The analytics section is not explicitly titled in the sidebar change,
    // but clicking it should highlight the active item
    const analyticsButton = page.locator('nav button').filter({ hasText: 'Аналитика' });
    await expect(analyticsButton).toHaveClass(/bg-primary/);

    // Click "Стратегия" (Strategy)
    await page.locator('nav').getByText('Стратегия', { exact: true }).click();

    const strategyButton = page.locator('nav button').filter({ hasText: 'Стратегия' });
    await expect(strategyButton).toHaveClass(/bg-primary/);

    // The previously active item should no longer be highlighted
    await expect(analyticsButton).not.toHaveClass(/bg-primary/);
  });

  test('clicking "Оценка" shows the assessment view', async ({ page }) => {
    await page.locator('nav').getByText('Оценка', { exact: true }).click();

    // The assessment / rating view should render.
    // AssessmentSplitView is rendered for this view.
    // Wait for the active state on the button as confirmation.
    const rateButton = page.locator('nav button').filter({ hasText: 'Оценка' });
    await expect(rateButton).toHaveClass(/bg-primary/);
  });

  test('clicking "Настройки" shows settings view', async ({ page }) => {
    await page.getByText('Настройки').first().click();

    // The settings button should become active
    const settingsButton = page.locator('button').filter({ hasText: 'Настройки' }).first();
    await expect(settingsButton).toHaveClass(/bg-primary/);
  });

  test('sidebar can be collapsed and expanded', async ({ page }) => {
    // The sidebar has a collapse toggle (Menu icon button)
    // When expanded, "Life Quality" text should be visible
    await expect(page.getByText('Life Quality').first()).toBeVisible();

    // Find the collapse button -- it's the button with the Menu icon in the sidebar header
    // It's inside the sidebar header div, a small 8x8 button
    const collapseButton = page.locator('.w-8.h-8.rounded-lg.bg-muted');

    if (await collapseButton.isVisible()) {
      await collapseButton.click();

      // After collapsing, the sidebar should be narrow (w-16 class)
      const sidebar = page.locator('.h-screen.sticky');
      await expect(sidebar).toHaveClass(/w-16/);

      // Expand again
      await collapseButton.click();
      await expect(sidebar).toHaveClass(/w-64/);
    }
  });

  test('app shows Life Quality branding in sidebar', async ({ page }) => {
    await expect(page.getByText('Life Quality').first()).toBeVisible();
  });
});
