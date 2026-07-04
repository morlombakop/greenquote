import "dotenv/config";
import { defineConfig, env } from "prisma/config";

const isProduction = process.env.NODE_ENV === "production";

export default defineConfig({
  // Dynamically select the correct schema file based on runtime target environment
  schema: isProduction ? "prisma/schema.prod.prisma" : "prisma/schema.dev.prisma",
  migrations: {
    path: isProduction ? "prisma/migrations/prod" : "prisma/migrations/dev",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: isProduction ? env("DATABASE_URL") : "file:./dev.db",
  },
});
