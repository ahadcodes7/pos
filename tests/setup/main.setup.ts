import { afterAll, beforeEach, inject, vi } from "vitest";
import { copyTemplateDatabase, removeDatabaseFiles } from "./db-template";
import { keytarMock } from "./keytar.mock";

// better-sqlite3 is compiled for Electron's Node ABI, so this project only runs inside
// Electron's Node (scripts/test-main.mjs sets ELECTRON_RUN_AS_NODE=1).
if (!process.versions.electron) {
  throw new Error("Main-process tests must run under Electron's Node: use `npm run test:main`.");
}

// Runs before each test file's imports, so src/main/db.ts connects to this file's own copy.
const dbFile = copyTemplateDatabase(inject("templateDbFile"));
process.env.DATABASE_URL = `file:${dbFile}`;
process.env.SERVICE_NAME = "nayahisab-test";
process.env.DOTENV_CONFIG_QUIET = "true";

vi.mock("keytar", async () => ({ default: (await import("./keytar.mock")).keytarMock }));

beforeEach(() => {
  keytarMock.reset();
});

// Registered first, so it runs after the test file's own afterAll hooks (which disconnect Prisma).
afterAll(() => {
  removeDatabaseFiles(dbFile);
});
