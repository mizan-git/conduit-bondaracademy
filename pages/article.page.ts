import { Page, Locator } from '@playwright/test';

export class ArticlePage {
  readonly page: Page;
  readonly articleTitle: Locator;
  readonly articleBody: Locator;
  readonly authorName: Locator;
  readonly editArticleButton: Locator;
  readonly deleteArticleButton: Locator;
  readonly articleContent: Locator;

  constructor(page: Page) {
    this.page = page;
    this.articleTitle = page.locator('.article-page h1');
    this.articleBody = page.locator('.article-content p');
    this.authorName = page.locator('.article-meta a');
    this.editArticleButton = page.locator('.banner a.btn-outline-secondary');
    this.deleteArticleButton = page.locator('.banner button.btn-outline-danger');
    this.articleContent = page.locator('.article-content');
  }

  async navigate(slug: string): Promise<void> {
    await this.page.goto(`/article/${slug}`);
  }

  async getArticleTitle(): Promise<string | null> {
    return this.articleTitle.textContent();
  }

  async getArticleBody(): Promise<string | null> {
    return this.articleBody.textContent();
  }

  async clickEditArticle(): Promise<void> {
    await this.editArticleButton.click();
  }

  async clickDeleteArticle(): Promise<void> {
    await this.deleteArticleButton.click();
  }
}