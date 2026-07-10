import { test } from "@playwright/test";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: "file:./prisma/dev.db",
});

export const prisma = new PrismaClient({ adapter });

/**
 * Automatically registers beforeAll and afterAll hooks 
 * to wipe test users from the local SQLite database.
 */
export function useDatabaseTestCleanup(testEmail: string) {
  test.beforeAll(async () => {
    try {
      await prisma.user.deleteMany({
        where: { email: testEmail },
      });
    } catch (error) {
      console.error("Error during beforeAll database cleanup:", error);
    } finally {
      await prisma.$disconnect();
    }
  });

  test.afterAll(async () => {
    try {
      await prisma.user.deleteMany({
        where: { email: testEmail },
      });
    } catch (error) {
      console.error("Error during afterAll database cleanup:", error);
    } finally {
      await prisma.$disconnect();
    }
  });
}
