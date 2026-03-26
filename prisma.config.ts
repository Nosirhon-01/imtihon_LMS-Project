import "dotenv/config";
import { defineConfig } from "prisma/config";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:1234@localhost:5432/lms_db?schema=public";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: connectionString,
  },
});
