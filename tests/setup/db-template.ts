import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { DatabaseSync } from "node:sqlite";

const MIGRATIONS_DIR = path.resolve(import.meta.dirname, "../../prisma/migrations");

/** Prefix for every database file tests create, so leftovers are easy to find. */
export const TEST_DB_PREFIX = "nayahisab-test-";

/**
 * Builds a fully migrated SQLite file by applying prisma/migrations/<name>/migration.sql in
 * order. (`prisma migrate` is not used: it parses schema.prisma, which currently has a
 * stray TODO line.) Built once per test run; each test file/worker copies it.
 */
export function buildTemplateDatabase(): string {
  const file = path.join(os.tmpdir(), `${TEST_DB_PREFIX}template-${randomUUID()}.db`);
  const db = new DatabaseSync(file);
  try {
    const migrations = fs
      .readdirSync(MIGRATIONS_DIR, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
    for (const name of migrations) {
      db.exec(fs.readFileSync(path.join(MIGRATIONS_DIR, name, "migration.sql"), "utf8"));
    }
  } finally {
    db.close();
  }
  return file;
}

/** Copies the template to a new uniquely named file. A plain file copy: no re-migrating. */
export function copyTemplateDatabase(templateFile: string): string {
  const file = path.join(os.tmpdir(), `${TEST_DB_PREFIX}${process.pid}-${randomUUID()}.db`);
  fs.copyFileSync(templateFile, file);
  return file;
}

/** Removes a test database and its SQLite side files (-wal, -shm, -journal). */
export function removeDatabaseFiles(file: string) {
  for (const suffix of ["", "-wal", "-shm", "-journal"]) {
    fs.rmSync(file + suffix, { force: true });
  }
}
