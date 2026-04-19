import * as runtime from "@prisma/client/runtime/index-browser";
export type * from '../models.js';
export type * from './prismaNamespace.js';
export declare const Decimal: typeof runtime.Decimal;
export declare const NullTypes: {
    DbNull: (new (secret: never) => typeof runtime.DbNull);
    JsonNull: (new (secret: never) => typeof runtime.JsonNull);
    AnyNull: (new (secret: never) => typeof runtime.AnyNull);
};
/**
 * Helper for filtering JSON entries that have `null` on the database (empty on the db)
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const DbNull: import("@prisma/client-runtime-utils").DbNullClass;
/**
 * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const JsonNull: import("@prisma/client-runtime-utils").JsonNullClass;
/**
 * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const AnyNull: import("@prisma/client-runtime-utils").AnyNullClass;
export declare const ModelName: {
    readonly User: "User";
    readonly Team: "Team";
    readonly AssetCollection: "AssetCollection";
    readonly Asset: "Asset";
    readonly UserAsset: "UserAsset";
    readonly Match: "Match";
    readonly PredictionMarket: "PredictionMarket";
    readonly PredictionPosition: "PredictionPosition";
    readonly Transaction: "Transaction";
};
export type ModelName = (typeof ModelName)[keyof typeof ModelName];
export declare const TransactionIsolationLevel: {
    readonly ReadUncommitted: "ReadUncommitted";
    readonly ReadCommitted: "ReadCommitted";
    readonly RepeatableRead: "RepeatableRead";
    readonly Serializable: "Serializable";
};
export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];
export declare const UserScalarFieldEnum: {
    readonly id: "id";
    readonly walletAddress: "walletAddress";
    readonly username: "username";
    readonly avatarUrl: "avatarUrl";
    readonly country: "country";
    readonly bio: "bio";
    readonly createdAt: "createdAt";
};
export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum];
export declare const TeamScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly game: "game";
    readonly region: "region";
    readonly logoUrl: "logoUrl";
    readonly createdAt: "createdAt";
};
export type TeamScalarFieldEnum = (typeof TeamScalarFieldEnum)[keyof typeof TeamScalarFieldEnum];
export declare const AssetCollectionScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly description: "description";
    readonly collectionMint: "collectionMint";
    readonly metadataUri: "metadataUri";
    readonly createdAt: "createdAt";
};
export type AssetCollectionScalarFieldEnum = (typeof AssetCollectionScalarFieldEnum)[keyof typeof AssetCollectionScalarFieldEnum];
export declare const AssetScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly assetType: "assetType";
    readonly teamId: "teamId";
    readonly collectionId: "collectionId";
    readonly mintAddress: "mintAddress";
    readonly metadataUri: "metadataUri";
    readonly basePrice: "basePrice";
    readonly currentPrice: "currentPrice";
    readonly totalSupply: "totalSupply";
    readonly circulating: "circulating";
    readonly bondingCurveK: "bondingCurveK";
    readonly createdAt: "createdAt";
};
export type AssetScalarFieldEnum = (typeof AssetScalarFieldEnum)[keyof typeof AssetScalarFieldEnum];
export declare const UserAssetScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly assetId: "assetId";
    readonly quantity: "quantity";
    readonly avgPrice: "avgPrice";
    readonly createdAt: "createdAt";
};
export type UserAssetScalarFieldEnum = (typeof UserAssetScalarFieldEnum)[keyof typeof UserAssetScalarFieldEnum];
export declare const MatchScalarFieldEnum: {
    readonly id: "id";
    readonly teamAId: "teamAId";
    readonly teamBId: "teamBId";
    readonly tournament: "tournament";
    readonly startTime: "startTime";
    readonly status: "status";
    readonly result: "result";
    readonly createdAt: "createdAt";
};
export type MatchScalarFieldEnum = (typeof MatchScalarFieldEnum)[keyof typeof MatchScalarFieldEnum];
export declare const PredictionMarketScalarFieldEnum: {
    readonly id: "id";
    readonly matchId: "matchId";
    readonly contractAddr: "contractAddr";
    readonly liquidityPool: "liquidityPool";
    readonly supplyA: "supplyA";
    readonly supplyB: "supplyB";
    readonly basePrice: "basePrice";
    readonly curveK: "curveK";
    readonly status: "status";
    readonly createdAt: "createdAt";
};
export type PredictionMarketScalarFieldEnum = (typeof PredictionMarketScalarFieldEnum)[keyof typeof PredictionMarketScalarFieldEnum];
export declare const PredictionPositionScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly marketId: "marketId";
    readonly team: "team";
    readonly amount: "amount";
    readonly avgPrice: "avgPrice";
    readonly createdAt: "createdAt";
};
export type PredictionPositionScalarFieldEnum = (typeof PredictionPositionScalarFieldEnum)[keyof typeof PredictionPositionScalarFieldEnum];
export declare const TransactionScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly txType: "txType";
    readonly assetId: "assetId";
    readonly marketId: "marketId";
    readonly quantity: "quantity";
    readonly amountUsdc: "amountUsdc";
    readonly txSignature: "txSignature";
    readonly createdAt: "createdAt";
};
export type TransactionScalarFieldEnum = (typeof TransactionScalarFieldEnum)[keyof typeof TransactionScalarFieldEnum];
export declare const SortOrder: {
    readonly asc: "asc";
    readonly desc: "desc";
};
export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];
export declare const QueryMode: {
    readonly default: "default";
    readonly insensitive: "insensitive";
};
export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];
export declare const NullsOrder: {
    readonly first: "first";
    readonly last: "last";
};
export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];
//# sourceMappingURL=prismaNamespaceBrowser.d.ts.map