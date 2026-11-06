import { afterAll, beforeEach } from "vitest";
import prisma from "@/main/db";

/**
 * Use in integration tests that touch the database. Each test file already has its own
 * database copy (tests/setup/main.setup.ts); this empties every table before each test so
 * tests never depend on each other or on order, and disconnects when the file is done.
 */
export function useTestDatabase() {
  beforeEach(async () => {
    const tables = await prisma.$queryRawUnsafe<{ name: string }[]>(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name != '_prisma_migrations'",
    );
    await prisma.$executeRawUnsafe("PRAGMA foreign_keys = OFF");
    for (const { name } of tables) {
      await prisma.$executeRawUnsafe(`DELETE FROM "${name.replaceAll('"', '""')}"`);
    }
    await prisma.$executeRawUnsafe("PRAGMA foreign_keys = ON");
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  return prisma;
}
