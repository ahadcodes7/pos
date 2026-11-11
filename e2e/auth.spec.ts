import { expect, test } from "./fixtures";

async function logIn(page: import("@playwright/test").Page, username: string, password: string) {
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Login" }).click();
}

test.describe("auth", () => {
  test("an unauthenticated app opens on the login screen", async ({ page }) => {
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByText("POS Login")).toBeVisible();
  });

  test("a user can log in and lands on the dashboard", async ({ page, seedUser }) => {
    const user = await seedUser();

    await logIn(page, user.username, user.password);

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByText(`Welcome back, ${user.username}!`)).toBeVisible();
    await expect(page.getByRole("button", { name: "Inventory" })).toBeVisible();
  });

  test("an unknown user sees the error and stays on the login screen", async ({ page }) => {
    await logIn(page, "nobody_here", "password123");

    await expect(page.getByText("User not found").first()).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("the session survives a renderer reload", async ({ page, seedUser }) => {
    const user = await seedUser();
    await logIn(page, user.username, user.password);
    await expect(page).toHaveURL(/\/dashboard$/);

    await page.reload();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("button", { name: "Inventory" })).toBeVisible();
  });

  test("protected pages redirect to login without a session", async ({ page }) => {
    await page.evaluate(() => window.history.pushState({}, "", "/dashboard/settings"));
    await page.reload();

    await expect(page).toHaveURL(/\/login$/);
  });
});
