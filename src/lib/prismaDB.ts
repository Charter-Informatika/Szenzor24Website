import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import dotenv from "dotenv";

dotenv.config();

declare global {
  var prisma: PrismaClient | undefined;
}

function parseDbUrl(url: string) {
  const regex = /mysql:\/\/([^:]+):([^@]+)@([^:\/]+)(?::(\d+))?\/([^?]+)/;
  const match = url.match(regex);
  if (!match) {
    throw new Error("Invalid DATABASE_URL format");
  }
  return {
    user: match[1],
    password: decodeURIComponent(match[2]),
    host: match[3].replace("localhost", "127.0.0.1"),
    port: match[4] ? parseInt(match[4], 10) : 3306,
    database: match[5],
  };
}

function getPrismaClient() {
  if (global.prisma) {
    return global.prisma;
  }

  const dbUrl = process.env.DATABASE_URL || "";
  if (!dbUrl) {
    throw new Error("[PrismaDB] DATABASE_URL nincs megadva!");
  }

  const dbConfig = parseDbUrl(dbUrl);

  const adapter = new PrismaMariaDb({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    connectionLimit: 5,
    acquireTimeout: 30000,
    connectTimeout: 10000,
    allowPublicKeyRetrieval: true,
  } as any);

  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    adapter,
  });

  global.prisma = client;
  return client;
}

export const prisma = getPrismaClient();
