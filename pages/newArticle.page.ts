import { Page, Locator } from '@playwright/test';

export class NewArticlePage {
  readonly page: Page;
  readonly articleTitleInput: Locator;
  readonly articleDescriptionInput: Locator;
  readonly articleBodyTextarea: Locator;
  readonly articleTagsInput: Locator;
  readonly publishArticleButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.articleTitleInput = page.getByPlaceholder('Article Title');
    this.articleDescriptionInput = page.locator('[formcontrolname="description"]');
    this.articleBodyTextarea = page.locator('[formcontrolname="body"]');
    this.articleTagsInput = page.getByPlaceholder('Enter Tags');
    this.publishArticleButton = page.getByRole('button', { name: 'Publish Article' });
  }

  async navigate(): Promise<void> {
    await this.page.goto('/editor');
  }

  async createNewArticle(
    title: string,
    description: string,
    body: string,
    tags: string[] = []
  ): Promise<void> {
    await this.articleTitleInput.fill(title);
    await this.articleDescriptionInput.fill(description);
    await this.articleBodyTextarea.fill(body);
    for (const tag of tags) {
      await this.articleTagsInput.fill(tag);
      await this.articleTagsInput.press('Enter');
    }
    await this.publishArticleButton.click();
  }
}