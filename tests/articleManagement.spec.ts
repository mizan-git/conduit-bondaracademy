import { test, expect, APIRequestContext } from '@playwright/test';
import { HomePage } from '../pages/home.page';
import { NewArticlePage } from '../pages/newArticle.page';
import { ArticlePage } from '../pages/article.page';
import { readInputData } from '../utils/jsonReader';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const inputData = readInputData();
const article = inputData.article as {
  description: string;
  body: string;
  tags: string[];
  updatedBody: string;
  deleteDescription: string;
  deleteBody: string;
};

test.use({ storageState: 'playwright/.auth/user.json' });

let userToken: string;

test.beforeEach(async ({ page, request }) => {
  // Perform API login to get token for pre-conditions
  const loginResponse = await request.post(`${process.env.API_URL}/users/login`, {
    data: {
      user: {
        email: process.env.TEST_USERNAME,
        password: process.env.TEST_PASSWORD,
      },
    },
  });
  expect(loginResponse.ok()).toBeTruthy();
  const loginJson = await loginResponse.json();
  userToken = loginJson.user.token;

  await page.goto(process.env.PROD_URL as string);
});

test.describe('Article Management', () => {
  test('should allow a user to create a new article', { tag: ["@module:article", "@p2", "@type:smoketest", "@type:sanitytest", "@type:regression"] }, async ({ page }) => {
    const homePage = new HomePage(page);
    const newArticlePage = new NewArticlePage(page);
    const articlePage = new ArticlePage(page);

    const articleTitle = `Test Article ${Date.now()}`;
    const articleDescription = article.description;
    const articleBody = article.body;
    const articleTags = [process.env.TEST_TAG as string, ...article.tags];

    await homePage.navigateToNewArticle();
    await newArticlePage.createNewArticle(articleTitle, articleDescription, articleBody, articleTags);

    await expect(articlePage.articleTitle).toHaveText(articleTitle);
    await expect(articlePage.articleBody).toHaveText(articleBody);
    await expect(page.locator('.tag-list').getByText(articleTags[0])).toBeVisible();
    await expect(page.locator('.tag-list').getByText(articleTags[1])).toBeVisible();
  });

  test('should not allow creating an article with a missing title',{ tag: ["@module:article", "@p2", "@type:smoketest", "@type:sanitytest", "@type:regression"] }, async ({ page }) => {
    const homePage = new HomePage(page);
    const newArticlePage = new NewArticlePage(page);

    await homePage.navigateToNewArticle();
    await newArticlePage.createNewArticle('', article.description, article.body, [process.env.TEST_TAG as string]);

    // Expect to remain on the editor page or see an error message
    await expect(page.url()).toContain('/editor');
    await expect(newArticlePage.publishArticleButton).toBeVisible(); // Button still visible, implying not published
  });

  test('should allow a user to edit an existing article',{ tag: ["@module:article", "@p2", "@type:smoketest", "@type:sanitytest", "@type:regression"] }, async ({ page, request }) => {
    const homePage = new HomePage(page);
    const articlePage = new ArticlePage(page);
    const newArticlePage = new NewArticlePage(page); // Reusing for edit form

    // Pre-condition: Create article via API
    const originalTitle = `Original Article ${Date.now()}`;
    const originalDescription = 'Original description.';
    const originalBody = 'Original body content.';
    const originalTags = [process.env.TEST_TAG as string];

    const createArticleResponse = await request.post(`${process.env.API_URL}/articles`, {
      headers: { Authorization: `Token ${userToken}` },
      data: {
        article: {
          title: originalTitle,
          description: originalDescription,
          body: originalBody,
          tagList: originalTags,
        },
      },
    });
    expect(createArticleResponse.ok()).toBeTruthy();
    const articleJson = await createArticleResponse.json();
    const articleSlug = articleJson.article.slug;

    await articlePage.navigate(articleSlug);
    await articlePage.clickEditArticle();

    const updatedTitle = `Updated Article ${Date.now()}`;
    const updatedBody = article.updatedBody;

    await newArticlePage.articleTitleInput.fill(updatedTitle);
    await newArticlePage.articleBodyTextarea.fill(updatedBody);
    await newArticlePage.publishArticleButton.click();

    await expect(articlePage.articleTitle).toHaveText(updatedTitle);
    await expect(articlePage.articleBody).toHaveText(updatedBody);
  });

  test('should allow a user to delete an existing article',{ tag: ["@module:article", "@p2", "@type:smoketest", "@type:sanitytest", "@type:regression"] }, async ({ page, request }) => {
    const homePage = new HomePage(page);
    const articlePage = new ArticlePage(page);

    // Pre-condition: Create article via API
    const articleTitle = `Article to Delete ${Date.now()}`;
    const articleDescription = article.deleteDescription;
    const articleBody = article.deleteBody;

    const createArticleResponse = await request.post(`${process.env.API_URL}/articles`, {
      headers: { Authorization: `Token ${userToken}` },
      data: {
        article: {
          title: articleTitle,
          description: articleDescription,
          body: articleBody,
          tagList: [],
        },
      },
    });
    expect(createArticleResponse.ok()).toBeTruthy();
    const articleJson = await createArticleResponse.json();
    const articleSlug = articleJson.article.slug;

    await articlePage.navigate(articleSlug);
    await articlePage.clickDeleteArticle();

    // Expect redirection to home page or global feed after deletion
    await expect(page).toHaveURL(new RegExp(`${process.env.PROD_URL}/?`));
    await expect(homePage.globalFeedTab).toBeVisible();

    // Verify article is no longer accessible (optional, but good for robustness)
    await page.goto(`${process.env.PROD_URL}/article/${articleSlug}`);
    await expect(page.locator('.article-page')).not.toBeVisible(); // Or expect a 404 message
  });
});