import { hasDatabaseUrl } from "../config/env.js";
import { InMemoryMarketplaceRepository } from "./in-memory-marketplace-repository.js";
import type { MarketplaceRepository } from "./marketplace-repository.js";
import { PrismaMarketplaceRepository } from "./prisma-marketplace-repository.js";

let repository: MarketplaceRepository | null = null;

export function getMarketplaceRepository() {
  if (!repository) {
    repository = hasDatabaseUrl()
      ? new PrismaMarketplaceRepository()
      : new InMemoryMarketplaceRepository();
  }

  return repository;
}
