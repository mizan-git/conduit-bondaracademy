import { Page, Locator } from '@playwright/test';

export class SettingsPage {
  readonly page: Page;
  readonly imageUrlInput: Locator;
  readonly usernameInput: Locator;
  readonly bioTextarea: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly updateSettingsButton: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.imageUrlInput = page.getByPlaceholder('URL of profile picture');
    this.usernameInput = page.getByPlaceholder('Your Username');
    this.bioTextarea = page.locator('[formcontrolname="bio"]');
    this.emailInput = page.getByPlaceholder('Email');
    this.passwordInput = page.getByPlaceholder('New Password');
    this.updateSettingsButton = page.getByRole('button', { name: 'Update Settings' });
    this.logoutButton = page.getByRole('button', { name: 'Or click here to logout.' });
  }

  async navigate(): Promise<void> {
    await this.page.goto('/settings');
  }

  async updateSettings(
    imageUrl?: string,
    username?: string,
    bio?: string,
    email?: string,
    password?: string
  ): Promise<void> {
    if (imageUrl !== undefined) await this.imageUrlInput.fill(imageUrl);
    if (username !== undefined) await this.usernameInput.fill(username);
    if (bio !== undefined) await this.bioTextarea.fill(bio);
    if (email !== undefined) await this.emailInput.fill(email);
    if (password !== undefined) await this.passwordInput.fill(password);
    await this.updateSettingsButton.click();
  }

  async logout(): Promise<void> {
    await this.logoutButton.click();
  }
}