import { test, expect, APIRequestContext } from '@playwright/test';
import { HomePage } from '../pages/home.page';
import { readInputData } from '../utils/jsonReader';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const inputData = readInputData();
const article = inputData.article as {
  filterDesc: string;
  filterBody: string;
  filterExtraTag: string;
  filterUnrelatedTag: string;
  nonExistentTagPrefix: string;
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

  // // Pre-condition: Ensure articles with the test tag exist
  // const articleTitle1 = `Tagged Article 1 ${Date.now()}`;
  // const articleTitle2 = `Tagged Article 2 ${Date.now() + 1}`;
  // const untaggedArticleTitle = `Untagged Article ${Date.now() + 2}`;

  // await request.post(`${process.env.API_URL}/articles`, {
  //   headers: { Authorization: `Token ${userToken}` },
  //   data: { article: { title: articleTitle1, description: article.filterDesc, body: article.filterBody, tagList: [process.env.TEST_TAG] } },
  // });
  // await request.post(`${process.env.API_URL}/articles`, {
  //   headers: { Authorization: `Token ${userToken}` },
  //   data: { article: { title: articleTitle2, description: article.filterDesc, body: article.filterBody, tagList: [process.env.TEST_TAG, article.filterExtraTag] } },
  // });
  // await request.post(`${process.env.API_URL}/articles`, {
  //   headers: { Authorization: `Token ${userToken}` },
  //   data: { article: { title: untaggedArticleTitle, description: article.filterDesc, body: article.filterBody, tagList: [article.filterUnrelatedTag] } },
  // });

  await page.goto(process.env.PROD_URL as string);
});

test.describe('Article Filtering', () => {
  test('should allow filtering articles by a specific tag',{ tag: ["@module:filter", "@p2", "@type:smoketest", "@type:sanitytest", "@type:regression"] }, async ({ page }) => {
    const homePage = new HomePage(page);
    const testTag = process.env.TEST_TAG as string;

    await homePage.filterByTag(testTag);

    // Assert that the tag is highlighted/active
    await expect(page.locator('.nav.nav-pills.outline-active .nav-link.active')).toContainText(testTag);


    // Assert that only articles containing the tag are displayed
    const articleTitles = await homePage.getArticleTitles();
    for (const title of articleTitles) {
      // This assertion is tricky as the UI doesn't explicitly show tags on the preview.
      // We rely on the backend filtering and the presence of the articles we created with the tag.
      // A more robust check would involve inspecting the article's tags if they were visible on the preview.
      // For now, we'll check if the titles of our tagged articles are present.
      expect(title).toMatch(/Tagged Article/);
    }
    // Ensure the untagged article is NOT present
    expect(articleTitles.some(title => title.includes('Untagged Article'))).toBeFalsy();
  });

  test('should display no articles when filtering by a non-existent tag',{tag: ["@module:filter","@type:negative"]}, async ({ page }) => {
    const homePage = new HomePage(page);
    const nonExistentTag = `${article.nonExistentTagPrefix}-${Date.now()}`;

    await page.goto(`${process.env.PROD_URL}/?tag=${nonExistentTag}`);
    await expect(page.locator('.article-preview')).toHaveCount(0);
    await expect(page.getByText('No articles are here... yet.')).toBeVisible();
  });
});