import { test, expect } from '@playwright/test';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({
    url: "file:./prisma/dev.db",
  });

const prisma= new PrismaClient({ adapter });

// const prisma = new PrismaClient();
const TEST_EMAIL = 'playwright.test@example.com';
const TEST_PASSWORD = 'Password123!';
const TEST_NAME = 'Playwright Tester';

test.describe('Authentication Flows (Signup & Login)', () => {
  
  // Clean up any lingering test user from previous interrupted runs
  test.beforeAll(async () => {
    try {
      await prisma.user.deleteMany({
        where: { email: TEST_EMAIL }
      });
    } catch (error) {
      console.error('Error during beforeAll database cleanup:', error);
    } finally {
      await prisma.$disconnect();
    }
  });

  // Clean up after the suite completes to leave the SQLite DB in a pristine state
  test.afterAll(async () => {
    try {
      await prisma.user.deleteMany({
        where: { email: TEST_EMAIL }
      });
    } catch (error) {
      console.error('Error during afterAll database cleanup:', error);
    } finally {
      await prisma.$disconnect();
    }
  });

  test('should successfully register a new user account', async ({ page }) => {
    // 1. Navigate to the registration page
    await page.goto('/register');
    
    // Verify structural headings are present
    await expect(page.getByRole('heading', { name: 'Create an account' })).toBeVisible();

    // 2. Fill out the registration form matching your RegisterForm fields
    await page.getByTestId('register-input-full-name').fill(TEST_NAME);
    await page.getByTestId('register-input-email').fill(TEST_EMAIL);
    await page.getByTestId('register-input-password',).fill(TEST_PASSWORD);
    await page.getByTestId('register-input-confirm-password').fill(TEST_PASSWORD);

    // 3. Submit the registration form
    await page.getByTestId('register-button-submit').click();

    // 4. Assert redirection to the login page with the registration toast parameter
    await page.waitForURL('**/login?registered=true');
    
    // Assert visual feedback confirmation message
    const successToast = page.locator('text=Account created successfully! Please sign in below.');
    await expect(successToast).toBeVisible();
  });

  test('should successfully log in with newly created credentials', async ({ page }) => {
    // 1. Navigate to the login page
    await page.goto('/login');

    // 2. Fill out the authentication credentials
    await page.getByTestId('login-input-email').fill(TEST_EMAIL);
    await page.getByTestId('login-input-password').fill(TEST_PASSWORD);

    // 3. Intercept and monitor NextAuth session processing
    await page.getByTestId('login-button-submit').click();

    // 4. Assert security redirection to the main protected dashboard
    await page.waitForURL('**/quotes', { timeout: 10000 });
    
    // Double check that we are exactly where we expect to be
    await expect(page).toHaveURL(/\/quotes$/);
  });

  test('should present validation error messages for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    // Attempt login with non-existent account credentials
    await page.getByTestId('login-input-email').fill('wrong.user@badrequest.com');
    await page.getByTestId('login-input-password').fill('WrongPassword!');
    await page.getByTestId('login-button-submit').click();

    // Assert the server side error text block renders to user view
    const errorAlert = page.locator('text=Invalid email or password combination.');
    await expect(errorAlert).toBeVisible();
  });
});
