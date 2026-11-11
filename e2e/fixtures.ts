import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { test as base, expect, _electron, type ElectronApplication, type Page } from "@playwright/test";
import { copyTemplateDatabase, removeDatabaseFiles } from "../tests/setup/db-template";

const ROOT = path.resolve(import.meta.dirname, "..");

interface AppFixtures {
  /** A freshly launched app: own main process, own database, own credential namespace. */
  app: ElectronApplication;
  /** The app's window, already showing the renderer. */
  page: Page;
  /** Creates a user through the app's own user:create route (real service + Prisma). */
  seedUser: (username?: string) => Promise<{ username: string; password: string }>;
}

export const test = base.extend<AppFixtures>({
  // eslint-disable-next-line no-empty-pattern -- Playwright fixtures require the destructuring argument
  app: async ({}, use, testInfo) => {
    const dbFile = copyTemplateDatabase(process.env.E2E_TEMPLATE_DB!);
    // Own Chromium profile: the default is the real app's, shared by every running instance.
    const profileDir = path.join(os.tmpdir(), `nayahisab-profile-${randomUUID()}`);
    // Login writes lastUserId to the OS credential store via keytar; a unique service name
    // keeps it apart from the real app, and teardown removes it (through auth:logout).
    const serviceName = `nayahisab-e2e-${testInfo.workerIndex}-${randomUUID().slice(0, 8)}`;

    const app = await _electron.launch({
      args: [`--user-data-dir=${profileDir}`, "."],
      cwd: ROOT,
      env: {
        ...process.env,
        NODE_ENV: "production", // no DevTools window
        DATABASE_URL: `file:${dbFile}`,
        SERVICE_NAME: serviceName,
        DEV_SERVER_URL: process.env.E2E_RENDERER_URL!,
      },
    });

    try {
      await use(app);
    } finally {
      const [page] = app.windows();
      // Clears the session and deletes this test's keytar entry via the app's own route.
      // Errors are ignored only because the window may already be gone if the test crashed it.
      await page?.evaluate(() => window.electronAPI.auth.logout()).catch(() => {});
      await app.close();
      removeDatabaseFiles(dbFile);
      // Windows can hold profile files for a moment after the process exits.
      fs.rmSync(profileDir, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
    }
  },

  page: async ({ app }, use) => {
    const page = await app.firstWindow();
    await page.waitForLoadState("load");
    await use(page);
  },

  seedUser: async ({ page }, use) => {
    await use(async (username = `e2e_${randomUUID().slice(0, 8)}`) => {
      const password = "password123";
      const reply = await page.evaluate((input) => window.electronAPI.user.create(input), { username, password });
      expect(reply, "seeding a user through user:create").toMatchObject({ success: true });
      return { username, password };
    });
  },
});

export { expect };
