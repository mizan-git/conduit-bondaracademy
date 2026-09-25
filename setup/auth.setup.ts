import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await page.goto(process.env.PROD_URL as string);
  await loginPage.navigate();
  await loginPage.login(process.env.TEST_USERNAME as string, process.env.TEST_PASSWORD as string);
  await expect(page.locator('.nav-pills a').first()).toHaveText('Your Feed');
  await page.context().storageState({ path: authFile });
});