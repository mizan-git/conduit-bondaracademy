import { request } from '@playwright/test';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

async function globalSetup() {
  const context = await request.newContext();

  const response = await context.post(`${process.env.API_URL}/users/login`, {
    data: {
      user: {
        email: process.env.TEST_USERNAME,
        password: process.env.TEST_PASSWORD,
      },
    },
  });

  const { user } = await response.json();

  const storageState = {
    cookies: [],
    origins: [
      {
        origin: process.env.PROD_URL as string,
        localStorage: [
          { name: 'jwtToken', value: user.token },
        ],
      },
    ],
  };

  fs.mkdirSync('playwright/.auth', { recursive: true });
  fs.writeFileSync('playwright/.auth/user.json', JSON.stringify(storageState));

  await context.dispose();
}

export default globalSetup;
