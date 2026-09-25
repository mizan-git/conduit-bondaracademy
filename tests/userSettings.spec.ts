import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home.page';
import { SettingsPage } from '../pages/settings.page';
import { readInputData } from '../utils/jsonReader';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const inputData = readInputData();
const userSettings = inputData.userSettings as { invalidEmail: string };

test.use({ storageState: 'playwright/.auth/user.json' });

test.beforeEach(async ({ page }) => {
  await page.goto(process.env.PROD_URL as string);
});

test.describe('User Settings', () => {
  test('should allow a user to update their profile settings', { tag: ["@module:setting", "@p2", "@type:smoketest", "@type:sanitytest", "@type:regression"] }, async ({ page }) => {
    const homePage = new HomePage(page);
    const settingsPage = new SettingsPage(page);

    const updatedBio = process.env.UPDATED_BIO as string;
    const updatedEmail = process.env.UPDATED_EMAIL as string;

    await homePage.navigateToSettings();
    await settingsPage.updateSettings(undefined, undefined, updatedBio, updatedEmail);

    // Assert success message or redirection
    await expect(page.locator('.message-alert-title')).toHaveText('Update success!');

    // Verify changes by navigating back to settings and checking input values
    await settingsPage.navigate();
    await expect(settingsPage.bioTextarea).toHaveValue(updatedBio);
    await expect(settingsPage.emailInput).toHaveValue(updatedEmail);
  });

  test('should not allow updating settings with an invalid email format',{tag: ["@module:setting","@type:negative"]}, async ({ page }) => {
    const homePage = new HomePage(page);
    const settingsPage = new SettingsPage(page);

    const invalidEmail = userSettings.invalidEmail;

    await homePage.navigateToSettings();
    await settingsPage.updateSettings(undefined, undefined, undefined, invalidEmail);

    // Expect an error message or the update button to not trigger a success
    await expect(page.locator('.message-alert-title')).toHaveText('Update failed!');
    await page.locator('.message-alert-title-button').click(); // Close the error alert

    // Ensure the email field still contains the invalid input or reverts
    await expect(settingsPage.emailInput).toHaveValue(invalidEmail);
  });
});