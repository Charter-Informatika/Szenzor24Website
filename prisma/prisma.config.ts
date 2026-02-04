import 'dotenv/config';
import { defineConfig } from "prisma/config";
import path from 'path';

// Get DATABASE_URL and fix localhost to 127.0.0.1 for IPv6 issues
const dbUrl = process.env.DATABASE_URL?.replace('localhost', '127.0.0.1') || '';

export default defineConfig({
  schema: path.join(__dirname, 'schema.prisma'),
  migrations: {
    path: path.join(__dirname, 'migrations'),
  },
  datasource: {
    url: dbUrl,
  },
});