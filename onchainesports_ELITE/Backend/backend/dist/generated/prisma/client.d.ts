import * as runtime from "@prisma/client/runtime/client";
import * as $Class from "./internal/class.js";
import * as Prisma from "./internal/prismaNamespace.js";
export * as $Enums from './enums.js';
export * from "./enums.js";
/**
 * ## Prisma Client
 *
 * Type-safe database client for TypeScript
 * @example
 * ```
 * const prisma = new PrismaClient({
 *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
 * })
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export declare const PrismaClient: $Class.PrismaClientConstructor;
export type PrismaClient<LogOpts extends Prisma.LogLevel = never, OmitOpts extends Prisma.PrismaClientOptions["omit"] = Prisma.PrismaClientOptions["omit"], ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = $Class.PrismaClient<LogOpts, OmitOpts, ExtArgs>;
export { Prisma };
/**
 * Model User
 *
 */
export type User = Prisma.UserModel;
/**
 * Model Team
 *
 */
export type Team = Prisma.TeamModel;
/**
 * Model AssetCollection
 *
 */
export type AssetCollection = Prisma.AssetCollectionModel;
/**
 * Model Asset
 *
 */
export type Asset = Prisma.AssetModel;
/**
 * Model UserAsset
 *
 */
export type UserAsset = Prisma.UserAssetModel;
/**
 * Model Match
 *
 */
export type Match = Prisma.MatchModel;
/**
 * Model PredictionMarket
 *
 */
export type PredictionMarket = Prisma.PredictionMarketModel;
/**
 * Model PredictionPosition
 *
 */
export type PredictionPosition = Prisma.PredictionPositionModel;
/**
 * Model Transaction
 *
 */
export type Transaction = Prisma.TransactionModel;
//# sourceMappingURL=client.d.ts.map