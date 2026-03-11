import path from "path";
import dotenv from "dotenv";
import { defineConfig } from "@prisma/config";

// Biztos .env betöltés a projekt gyökeréből
dotenv.config({ path: path.join(process.cwd(), ".env") });

const dbUrl = (process.env.DATABASE_URL || "").replace(
  "localhost",
  "127.0.0.1",
);

if (!dbUrl) {
  throw new Error("DATABASE_URL hiányzik a környezeti változók közül!");
}

export default defineConfig({
  schema: path.join(process.cwd(), "prisma", "schema.prisma"),
  migrations: {
    path: path.join(process.cwd(), "prisma", "migrations"),
  },
  datasource: {
    url: dbUrl,
  },
});