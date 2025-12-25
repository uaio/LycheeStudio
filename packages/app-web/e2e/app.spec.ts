import { test, expect } from '@playwright/test';

test.describe('Application Home', () => {
  test('should load homepage', async ({ page }) => {
    await page.goto('/');

    // Check for welcome message
    await expect(page.getByText(/欢迎使用.*AI Tools Manager/i)).toBeVisible();
  });

  test('should display platform cards', async ({ page }) => {
    await page.goto('/');

    // Check for platform cards
    await expect(page.getByText(/桌面应用/)).toBeVisible();
    await expect(page.getByText(/VSCode 扩展/)).toBeVisible();
    await expect(page.getByText(/Web 版本/)).toBeVisible();
  });

  test('should navigate to MCP manager', async ({ page }) => {
    await page.goto('/');

    // Click on MCP manager link
    await page.click('text=MCP 管理');

    // Check URL
    await expect(page).toHaveURL(/.*mcp-manager/);
  });
});

test.describe('MCP Manager Page', () => {
  test('should display MCP manager page', async ({ page }) => {
    await page.goto('/mcp-manager');

    await expect(page.getByText('MCP 服务管理')).toBeVisible();
  });

  test('should have add server button', async ({ page }) => {
    await page.goto('/mcp-manager');

    const addButton = page.getByRole('button', { name: /添加.*服务器/i });
    await expect(addButton).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('should navigate between pages', async ({ page }) => {
    // Start at home
    await page.goto('/');
    await expect(page).toHaveURL('/');

    // Navigate to MCP manager
    await page.click('text=MCP 管理');
    await expect(page).toHaveURL(/.*mcp-manager/);

    // Navigate back
    await page.goBack();
    await expect(page).toHaveURL('/');

    // Navigate to Claude model page
    await page.click('text=Claude 模型');
    await expect(page).toHaveURL(/.*claude-model/);
  });
});

test.describe('Responsive Design', () => {
  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check mobile navigation
    const menuButton = page.getByRole('button', { name: /menu/i });
    await expect(menuButton).toBeVisible();
  });

  test('should adapt layout on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    // Check that platform cards are in a grid
    const cards = page.locator('.ant-col');
    await expect(cards).toHaveCount(3);
  });
});
