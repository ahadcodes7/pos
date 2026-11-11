import { DatabaseSync } from "node:sqlite";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import { config } from "dotenv";

config();

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const username = process.argv[2] ?? "adi71011";
const password = process.argv[3] ?? "123456";

const databaseUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const rawPath = databaseUrl.replace(/^file:/, "");
const dbPath = path.isAbsolute(rawPath) ? rawPath : path.resolve(projectRoot, rawPath);

const db = new DatabaseSync(dbPath);

try {
  db.exec("PRAGMA busy_timeout = 5000");
  db.exec("PRAGMA foreign_keys = ON");

  const hasUserTable = db
    .prepare(`SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'User'`)
    .get();

  if (!hasUserTable) {
    console.error(`No "User" table in ${dbPath}.`);
    console.error("Apply your migrations first, then re-run: npm run seed");
    process.exitCode = 1;
  } else {
    // Same hashing rounds as createUserService in src/main/modules/user/user.service.ts
    const hashedPassword = await bcrypt.hash(password, 10);

    // Matches the format written by @prisma/adapter-better-sqlite3 (iso8601)
    const now = new Date().toISOString().replace("Z", "+00:00");

    db.prepare(
      `INSERT INTO "User" ("id", "username", "password", "createdAt", "updatedAt")
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT("username") DO UPDATE SET
         "password" = excluded."password",
         "updatedAt" = excluded."updatedAt"`
    ).run(randomUUID(), username, hashedPassword, now, now);

    console.log(`Seeded user "${username}" in ${dbPath}`);
  }
} finally {
  db.close();
}
