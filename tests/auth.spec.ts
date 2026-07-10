import { test, expect } from "@playwright/test";
import { useDatabaseTestCleanup } from "./helpers/db-setup";

const TEST_EMAIL = "playwright.test@example.com";
const TEST_PASSWORD = "Password123!";
const TEST_NAME = "Playwright Tester";

test.describe("Authentication Flows (Signup & Login)", () => {
  // Clean up any lingering test user from previous interrupted runs
  useDatabaseTestCleanup(TEST_EMAIL);

  test("should successfully register a new user account", async ({ page }) => {
    // 1. Navigate to the registration page
    await page.goto("/register");

    // Verify structural headings are present
    await expect(
      page.getByRole("heading", { name: "Create an account" }),
    ).toBeVisible();

    // 2. Fill out the registration form matching your RegisterForm fields
    await page.getByTestId("register-input-full-name").fill(TEST_NAME);
    await page.getByTestId("register-input-email").fill(TEST_EMAIL);
    await page.getByTestId("register-input-password").fill(TEST_PASSWORD);
    await page
      .getByTestId("register-input-confirm-password")
      .fill(TEST_PASSWORD);

    // 3. Submit the registration form
    await page.getByTestId("register-button-submit").click();

    // 4. Assert redirection to the login page with the registration toast parameter
    await page.waitForURL("**/login?registered=true");

    // Assert visual feedback confirmation message
    const successToast = page.locator(
      "text=Account created successfully! Please sign in below.",
    );
    await expect(successToast).toBeVisible();
  });

  test.describe("Registration Field Validations", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/register");
    });

    test("should show validation errors when submitting an empty form", async ({
      page,
    }) => {
      // Submit without entering data
      await page.getByTestId("register-button-submit").click();

      // Assert error messages appear under their respective fields
      await expect(
        page.locator("text=Name must be at least 2 characters long"),
      ).toBeVisible();
      await expect(
        page.locator("text=Please provide a valid email address"),
      ).toBeVisible();
      await expect(
        page.locator("text=Password must be at least 6 characters long"),
      ).toBeVisible();
      await expect(
        page.locator("text=Please confirm your password"),
      ).toBeVisible();
    });

    test("should show specific validation errors for short names and malformed emails", async ({
      page,
    }) => {
      await page.reload({ waitUntil: "networkidle" });
      await page.getByTestId("register-input-full-name").fill("A");
      await page
        .getByTestId("register-input-email")
        .fill("invalid-email-format");
      await page.getByTestId("register-input-password").fill("12345"); // < 6 chars

      await page.getByTestId("register-button-submit").click();

      await expect(
        page.locator("text=Name must be at least 2 characters long"),
      ).toBeVisible();
      await expect(
        page.locator("text=Please provide a valid email address"),
      ).toBeVisible();
      await expect(
        page.locator("text=Password must be at least 6 characters long"),
      ).toBeVisible();
    });

    test("should show an error if passwords do not match", async ({ page }) => {
      await page.getByTestId("register-input-full-name").fill("Valid Name");
      await page
        .getByTestId("register-input-email")
        .fill("valid.email@example.com");
      await page.getByTestId("register-input-password").fill("Secret123");
      await page
        .getByTestId("register-input-confirm-password")
        .fill("Different123");

      await page.getByTestId("register-button-submit").click();

      // The schema paths the mismatch message onto the confirmPassword key
      await expect(page.locator("text=Passwords do not match")).toBeVisible();

      // Confirm other field errors are not present
      await expect(
        page.locator("text=Name must be at least 2 characters long"),
      ).not.toBeVisible();
    });
  });

  test("should successfully log in with newly created credentials", async ({
    page,
  }) => {
    // 1. Navigate to the login page
    await page.goto("/login");

    // 2. Fill out the authentication credentials
    await page.getByTestId("login-input-email").fill(TEST_EMAIL);
    await page.getByTestId("login-input-password").fill(TEST_PASSWORD);

    // 3. Intercept and monitor NextAuth session processing
    await page.getByTestId("login-button-submit").click();

    // 4. Assert security redirection to the main protected dashboard
    await page.waitForURL("**/quotes", { timeout: 10000 });

    // Double check that we are exactly where we expect to be
    await expect(page).toHaveURL(/\/quotes$/);
  });

  test("should present validation error messages for invalid credentials", async ({
    page,
  }) => {
    await page.goto("/login");

    // Attempt login with non-existent account credentials
    await page
      .getByTestId("login-input-email")
      .fill("wrong.user@badrequest.com");
    await page.getByTestId("login-input-password").fill("WrongPassword!");
    await page.getByTestId("login-button-submit").click();

    // Assert the server side error text block renders to user view
    const errorAlert = page.locator(
      "text=Invalid email or password combination.",
    );
    await expect(errorAlert).toBeVisible();
  });
});
