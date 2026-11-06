import { PrismaClient } from "./generated/prisma/client.ts";
import { config } from "dotenv";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

config();

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaBetterSqlite3({
  url: connectionString,
});

const globalForPrisma = globalThis as typeof globalThis & { prisma?: PrismaClient };

const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

async function configureSqlite() {
  await prisma.$executeRawUnsafe(`PRAGMA journal_mode = WAL;`);
  await prisma.$executeRawUnsafe(`PRAGMA synchronous = NORMAL;`);
  await prisma.$executeRawUnsafe(`PRAGMA foreign_keys = ON;`);

  // Performance tuning
  await prisma.$executeRawUnsafe(`PRAGMA cache_size = -64000;`);
  await prisma.$executeRawUnsafe(`PRAGMA mmap_size = 268435456;`);

  // avoids locks
  // await prisma.$executeRawUnsafe(`PRAGMA busy_timeout = 5000;`);
}

configureSqlite()
  .then(() => {
    console.log("SQLite configured successfully");
  })
  .catch((error) => {
    console.error("Failed to configure SQLite:", error);
  });

export default prisma;
