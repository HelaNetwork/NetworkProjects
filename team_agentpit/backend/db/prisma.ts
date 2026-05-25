import { PrismaClient } from "@prisma/client";
import { hasDatabaseUrl } from "../config/env.js";

let prismaClient: PrismaClient | null = null;

export function getPrismaClient() {
  if (!hasDatabaseUrl()) {
    return null;
  }

  if (!prismaClient) {
    prismaClient = new PrismaClient();
  }

  return prismaClient;
}
