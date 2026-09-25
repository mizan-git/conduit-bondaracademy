import { Page, Locator } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly newArticleLink: Locator;
  readonly settingsLink: Locator;
  readonly yourFeedTab: Locator;
  readonly globalFeedTab: Locator;
  readonly popularTagsSection: Locator;
  readonly articlePreviewTitles: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newArticleLink = page.getByRole('link', { name: 'New Article' });
    this.settingsLink = page.getByRole('link', { name: 'Settings' });
    this.yourFeedTab = page.getByRole('link', { name: 'Your Feed' });
    this.globalFeedTab = page.getByText('Global Feed');
    this.popularTagsSection = page.locator('.sidebar').getByText('Popular Tags');
    this.articlePreviewTitles = page.locator('.article-preview h1');
  }

  async navigate(): Promise<void> {
    await this.page.goto('/');
  }

  async navigateToNewArticle(): Promise<void> {
    await this.newArticleLink.click();
  }

  async navigateToSettings(): Promise<void> {
    await this.settingsLink.click();
  }

  async filterByTag(tag: string): Promise<void> {
    await this.page.locator('.tag-list a.tag-pill').filter({ hasText: tag }).click();
  }

  async getArticleTitles(): Promise<string[]> {
    return this.articlePreviewTitles.allTextContents();
  }
}