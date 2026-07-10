import { test, expect } from "@playwright/test";
import { useDatabaseTestCleanup, prisma } from "./helpers/db-setup";

const TEST_EMAIL = "playwright2.test@example.com";
const TEST_PASSWORD = "Password123!";
const TEST_NAME = "Playwright Tester";

test.describe("New Quote Evaluation Flow", () => {
  useDatabaseTestCleanup(TEST_EMAIL);
  
  // Ensure the test user exists in the SQLite database before running tests
  test.beforeAll(async () => {
    try {
      // Clean up any old instances
      await prisma.user.deleteMany({ where: { email: TEST_EMAIL } });
      
      // Create a clean test user record matching the auth criteria
      await prisma.user.create({
        data: {
          email: TEST_EMAIL,
          name: TEST_NAME,
          // If your schema hashes passwords, ensure this matches your application's seed/format
          password: TEST_PASSWORD, 
        },
      });
    } catch (error) {
      console.error("Error during beforeAll setup:", error);
    } finally {
      await prisma.$disconnect();
    }
  });

  // Authenticate and navigate to the quote page before each test case
  test.beforeEach(async ({ page }) => {
    // 1. Perform login steps matching auth.spec.ts
    await page.goto("/login");
    await page.getByTestId("login-input-email").fill(TEST_EMAIL);
    await page.getByTestId("login-input-password").fill(TEST_PASSWORD);
    await page.getByTestId("login-button-submit").click();
    await expect(page.getByTestId('new-quote-header')).toBeVisible({ timeout: 10000 });
    await page.waitForURL("/quotes", { timeout: 10000 });

    // 2. Navigate to the New Quote creation page
    await page.goto("/quotes/new");
    await expect(
      page.getByRole("heading", { name: "Configure New Solar Evaluation File" })
    ).toBeVisible();
  });

  test("should pre-populate client fields using active user session data", async ({ page }) => {
    const fullNameInput = page.getByTestId("new-quote-input-full-name");
    const emailInput = page.getByTestId("new-quote-input-email");

    // Verify properties populated from server-side session
    await expect(fullNameInput).toHaveValue(TEST_NAME);
    await expect(emailInput).toHaveValue(TEST_EMAIL);
  });

  test("should dynamically update live estimates sidebar when form fields become valid", async ({ page }) => {
    // Initially, form fields are empty or 0, showing placeholder text
    await expect(page.locator("text=No summary Available.")).toBeVisible();

    // Fill in valid configuration criteria to satisfy Zod schema rules
    await page.getByTestId("new-quote-input-address").fill("Müllerstraße 42, 13353 Berlin");
    await page.getByTestId("new-quote-input-monthly-consumption-kwh").fill("450");
    await page.getByTestId("new-quote-input-system-size-kw").fill("10");
    await page.getByTestId("new-quote-input-down-payment").fill("1500");

    // Live Sidebar results should render into view
    await expect(page.locator("text=No summary Available.")).not.toBeVisible();
    await expect(page.getByTestId("quote-result-risk-band")).toBeVisible();
    await expect(page.getByTestId("quote-result-system-price")).toBeVisible();
    await expect(page.getByTestId("quote-result-offers")).toBeVisible();
  });

  test("should handle validation error rules on form submission failure", async ({ page }) => {
    // Clear out default session strings to force base validation errors
    await page.getByTestId("new-quote-input-full-name").fill("");
    await page.getByTestId("new-quote-input-email").fill("");
    
    await page.getByTestId("new-quote-input-submit").click();

    // Verify form input field specific errors are visible
    // (Adjust text parameters to match your actual Zod error message outputs)
    await expect(page.locator("text=String must contain at least")).toBeVisible(); 
    await expect(page.locator("text=Invalid email")).toBeVisible();
  });

  test("should successfully submit form data and route directly to the generated quote view", async ({ page }) => {
    const MOCK_QUOTE_ID = "mock-quote-xyz-123";

    // Intercept API call to separate client E2E visual expectations from system API persistence dependencies
    await page.route("**/api/quotes", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          quote: { id: MOCK_QUOTE_ID },
        }),
      });
    });

    // Populate required input values
    await page.getByTestId("new-quote-input-address").fill("Müllerstraße 42, 13353 Berlin");
    await page.getByTestId("new-quote-input-monthly-consumption-kwh").fill("500");
    await page.getByTestId("new-quote-input-system-size-kw").fill("12");
    await page.getByTestId("new-quote-input-down-payment").fill("3000");

    // Execute underwriting submit engine
    await page.getByTestId("new-quote-input-submit").click();

    // Verify loading indicator button messaging swaps correctly during post execution
    await expect(page.getByTestId("new-quote-input-submit")).toHaveText("Running Underwriting Engine...");

    // Confirm browser app properly targets and re-routes toward the newly generated landing path URL
    await page.waitForURL(`/quotes/${MOCK_QUOTE_ID}`);
    await expect(page).toHaveURL(new RegExp(`/quotes/${MOCK_QUOTE_ID}$`));
  });

  test("should display server error alert banners when API responds with an explicit error", async ({ page }) => {
    const ERROR_MESSAGE = "Underwriting engine failed: Risk limit exceeded.";

    // Intercept backend API pipeline to force a 400 Bad Request simulation response
    await page.route("**/api/quotes", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ error: ERROR_MESSAGE }),
      });
    });

    // Complete mandatory form content
    await page.getByTestId("new-quote-input-address").fill("Müllerstraße 42, 13353 Berlin");
    await page.getByTestId("new-quote-input-monthly-consumption-kwh").fill("10000"); // Extreme inputs
    await page.getByTestId("new-quote-input-system-size-kw").fill("500");
    await page.getByTestId("new-quote-input-down-payment").fill("0");

    await page.getByTestId("new-quote-input-submit").click();

    // Verify Error Banner displays top string elements accurately matching data feedback values
    const errorAlert = page.locator("div.bg-red-50");
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert.locator(`text=${ERROR_MESSAGE}`)).toBeVisible();
  });
});
