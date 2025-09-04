import path from "node:path";
import type { PrismaConfig } from "prisma";

process.loadEnvFile();

export default {
  schema: path.join("src", "infra", "db", "prisma", "schema.prisma"),
  migrations: {
    path: path.join("src", "infra", "db", "migrations"),
  },
} satisfies PrismaConfig;
