import * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../models.js";
import { type PrismaClient } from "./class.js";
export type * from '../models.js';
export type DMMF = typeof runtime.DMMF;
export type PrismaPromise<T> = runtime.Types.Public.PrismaPromise<T>;
/**
 * Prisma Errors
 */
export declare const PrismaClientKnownRequestError: typeof runtime.PrismaClientKnownRequestError;
export type PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError;
export declare const PrismaClientUnknownRequestError: typeof runtime.PrismaClientUnknownRequestError;
export type PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError;
export declare const PrismaClientRustPanicError: typeof runtime.PrismaClientRustPanicError;
export type PrismaClientRustPanicError = runtime.PrismaClientRustPanicError;
export declare const PrismaClientInitializationError: typeof runtime.PrismaClientInitializationError;
export type PrismaClientInitializationError = runtime.PrismaClientInitializationError;
export declare const PrismaClientValidationError: typeof runtime.PrismaClientValidationError;
export type PrismaClientValidationError = runtime.PrismaClientValidationError;
/**
 * Re-export of sql-template-tag
 */
export declare const sql: typeof runtime.sqltag;
export declare const empty: runtime.Sql;
export declare const join: typeof runtime.join;
export declare const raw: typeof runtime.raw;
export declare const Sql: typeof runtime.Sql;
export type Sql = runtime.Sql;
/**
 * Decimal.js
 */
export declare const Decimal: typeof runtime.Decimal;
export type Decimal = runtime.Decimal;
export type DecimalJsLike = runtime.DecimalJsLike;
/**
* Extensions
*/
export type Extension = runtime.Types.Extensions.UserArgs;
export declare const getExtensionContext: typeof runtime.Extensions.getExtensionContext;
export type Args<T, F extends runtime.Operation> = runtime.Types.Public.Args<T, F>;
export type Payload<T, F extends runtime.Operation = never> = runtime.Types.Public.Payload<T, F>;
export type Result<T, A, F extends runtime.Operation> = runtime.Types.Public.Result<T, A, F>;
export type Exact<A, W> = runtime.Types.Public.Exact<A, W>;
export type PrismaVersion = {
    client: string;
    engine: string;
};
/**
 * Prisma Client JS version: 7.4.2
 * Query Engine version: 94a226be1cf2967af2541cca5529f0f7ba866919
 */
export declare const prismaVersion: PrismaVersion;
/**
 * Utility Types
 */
export type Bytes = runtime.Bytes;
export type JsonObject = runtime.JsonObject;
export type JsonArray = runtime.JsonArray;
export type JsonValue = runtime.JsonValue;
export type InputJsonObject = runtime.InputJsonObject;
export type InputJsonArray = runtime.InputJsonArray;
export type InputJsonValue = runtime.InputJsonValue;
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
export declare const DbNull: runtime.DbNullClass;
/**
 * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const JsonNull: runtime.JsonNullClass;
/**
 * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const AnyNull: runtime.AnyNullClass;
type SelectAndInclude = {
    select: any;
    include: any;
};
type SelectAndOmit = {
    select: any;
    omit: any;
};
/**
 * From T, pick a set of properties whose keys are in the union K
 */
type Prisma__Pick<T, K extends keyof T> = {
    [P in K]: T[P];
};
export type Enumerable<T> = T | Array<T>;
/**
 * Subset
 * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
 */
export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
};
/**
 * SelectSubset
 * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
 * Additionally, it validates, if both select and include are present. If the case, it errors.
 */
export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
} & (T extends SelectAndInclude ? 'Please either choose `select` or `include`.' : T extends SelectAndOmit ? 'Please either choose `select` or `omit`.' : {});
/**
 * Subset + Intersection
 * @desc From `T` pick properties that exist in `U` and intersect `K`
 */
export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
} & K;
type Without<T, U> = {
    [P in Exclude<keyof T, keyof U>]?: never;
};
/**
 * XOR is needed to have a real mutually exclusive union type
 * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
 */
export type XOR<T, U> = T extends object ? U extends object ? (Without<T, U> & U) | (Without<U, T> & T) : U : T;
/**
 * Is T a Record?
 */
type IsObject<T extends any> = T extends Array<any> ? False : T extends Date ? False : T extends Uint8Array ? False : T extends BigInt ? False : T extends object ? True : False;
/**
 * If it's T[], return T
 */
export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T;
/**
 * From ts-toolbelt
 */
type __Either<O extends object, K extends Key> = Omit<O, K> & {
    [P in K]: Prisma__Pick<O, P & keyof O>;
}[K];
type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>;
type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>;
type _Either<O extends object, K extends Key, strict extends Boolean> = {
    1: EitherStrict<O, K>;
    0: EitherLoose<O, K>;
}[strict];
export type Either<O extends object, K extends Key, strict extends Boolean = 1> = O extends unknown ? _Either<O, K, strict> : never;
export type Union = any;
export type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K];
} & {};
/** Helper Types for "Merge" **/
export type IntersectOf<U extends Union> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
export type Overwrite<O extends object, O1 extends object> = {
    [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
} & {};
type _Merge<U extends object> = IntersectOf<Overwrite<U, {
    [K in keyof U]-?: At<U, K>;
}>>;
type Key = string | number | symbol;
type AtStrict<O extends object, K extends Key> = O[K & keyof O];
type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
    1: AtStrict<O, K>;
    0: AtLoose<O, K>;
}[strict];
export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
} & {};
export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
} & {};
type _Record<K extends keyof any, T> = {
    [P in K]: T;
};
type NoExpand<T> = T extends unknown ? T : never;
export type AtLeast<O extends object, K extends string> = NoExpand<O extends unknown ? (K extends keyof O ? {
    [P in K]: O[P];
} & O : O) | {
    [P in keyof O as P extends K ? P : never]-?: O[P];
} & O : never>;
type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;
export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
/** End Helper Types for "Merge" **/
export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;
export type Boolean = True | False;
export type True = 1;
export type False = 0;
export type Not<B extends Boolean> = {
    0: 1;
    1: 0;
}[B];
export type Extends<A1 extends any, A2 extends any> = [A1] extends [never] ? 0 : A1 extends A2 ? 1 : 0;
export type Has<U extends Union, U1 extends Union> = Not<Extends<Exclude<U1, U>, U1>>;
export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
        0: 0;
        1: 1;
    };
    1: {
        0: 1;
        1: 1;
    };
}[B1][B2];
export type Keys<U extends Union> = U extends unknown ? keyof U : never;
export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O ? O[P] : never;
} : never;
type FieldPaths<T, U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>> = IsObject<T> extends True ? U : T;
export type GetHavingFields<T> = {
    [K in keyof T]: Or<Or<Extends<'OR', K>, Extends<'AND', K>>, Extends<'NOT', K>> extends True ? T[K] extends infer TK ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never> : never : {} extends FieldPaths<T[K]> ? never : K;
}[keyof T];
/**
 * Convert tuple to union
 */
type _TupleToUnion<T> = T extends (infer E)[] ? E : never;
type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>;
export type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T;
/**
 * Like `Pick`, but additionally can also accept an array of keys
 */
export type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>;
/**
 * Exclude all keys with underscores
 */
export type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T;
export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>;
type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>;
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
export interface TypeMapCb<GlobalOmitOptions = {}> extends runtime.Types.Utils.Fn<{
    extArgs: runtime.Types.Extensions.InternalArgs;
}, runtime.Types.Utils.Record<string, any>> {
    returns: TypeMap<this['params']['extArgs'], GlobalOmitOptions>;
}
export type TypeMap<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
        omit: GlobalOmitOptions;
    };
    meta: {
        modelProps: "user" | "team" | "assetCollection" | "asset" | "userAsset" | "match" | "predictionMarket" | "predictionPosition" | "transaction";
        txIsolationLevel: TransactionIsolationLevel;
    };
    model: {
        User: {
            payload: Prisma.$UserPayload<ExtArgs>;
            fields: Prisma.UserFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.UserFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                findFirst: {
                    args: Prisma.UserFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                findMany: {
                    args: Prisma.UserFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>[];
                };
                create: {
                    args: Prisma.UserCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                createMany: {
                    args: Prisma.UserCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>[];
                };
                delete: {
                    args: Prisma.UserDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                update: {
                    args: Prisma.UserUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                deleteMany: {
                    args: Prisma.UserDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.UserUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>[];
                };
                upsert: {
                    args: Prisma.UserUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                aggregate: {
                    args: Prisma.UserAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateUser>;
                };
                groupBy: {
                    args: Prisma.UserGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.UserGroupByOutputType>[];
                };
                count: {
                    args: Prisma.UserCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.UserCountAggregateOutputType> | number;
                };
            };
        };
        Team: {
            payload: Prisma.$TeamPayload<ExtArgs>;
            fields: Prisma.TeamFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.TeamFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TeamPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.TeamFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TeamPayload>;
                };
                findFirst: {
                    args: Prisma.TeamFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TeamPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.TeamFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TeamPayload>;
                };
                findMany: {
                    args: Prisma.TeamFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TeamPayload>[];
                };
                create: {
                    args: Prisma.TeamCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TeamPayload>;
                };
                createMany: {
                    args: Prisma.TeamCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.TeamCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TeamPayload>[];
                };
                delete: {
                    args: Prisma.TeamDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TeamPayload>;
                };
                update: {
                    args: Prisma.TeamUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TeamPayload>;
                };
                deleteMany: {
                    args: Prisma.TeamDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.TeamUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.TeamUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TeamPayload>[];
                };
                upsert: {
                    args: Prisma.TeamUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TeamPayload>;
                };
                aggregate: {
                    args: Prisma.TeamAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateTeam>;
                };
                groupBy: {
                    args: Prisma.TeamGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TeamGroupByOutputType>[];
                };
                count: {
                    args: Prisma.TeamCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TeamCountAggregateOutputType> | number;
                };
            };
        };
        AssetCollection: {
            payload: Prisma.$AssetCollectionPayload<ExtArgs>;
            fields: Prisma.AssetCollectionFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.AssetCollectionFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AssetCollectionPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.AssetCollectionFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AssetCollectionPayload>;
                };
                findFirst: {
                    args: Prisma.AssetCollectionFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AssetCollectionPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.AssetCollectionFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AssetCollectionPayload>;
                };
                findMany: {
                    args: Prisma.AssetCollectionFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AssetCollectionPayload>[];
                };
                create: {
                    args: Prisma.AssetCollectionCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AssetCollectionPayload>;
                };
                createMany: {
                    args: Prisma.AssetCollectionCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.AssetCollectionCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AssetCollectionPayload>[];
                };
                delete: {
                    args: Prisma.AssetCollectionDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AssetCollectionPayload>;
                };
                update: {
                    args: Prisma.AssetCollectionUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AssetCollectionPayload>;
                };
                deleteMany: {
                    args: Prisma.AssetCollectionDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.AssetCollectionUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.AssetCollectionUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AssetCollectionPayload>[];
                };
                upsert: {
                    args: Prisma.AssetCollectionUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AssetCollectionPayload>;
                };
                aggregate: {
                    args: Prisma.AssetCollectionAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateAssetCollection>;
                };
                groupBy: {
                    args: Prisma.AssetCollectionGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AssetCollectionGroupByOutputType>[];
                };
                count: {
                    args: Prisma.AssetCollectionCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AssetCollectionCountAggregateOutputType> | number;
                };
            };
        };
        Asset: {
            payload: Prisma.$AssetPayload<ExtArgs>;
            fields: Prisma.AssetFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.AssetFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AssetPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.AssetFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AssetPayload>;
                };
                findFirst: {
                    args: Prisma.AssetFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AssetPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.AssetFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AssetPayload>;
                };
                findMany: {
                    args: Prisma.AssetFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AssetPayload>[];
                };
                create: {
                    args: Prisma.AssetCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AssetPayload>;
                };
                createMany: {
                    args: Prisma.AssetCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.AssetCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AssetPayload>[];
                };
                delete: {
                    args: Prisma.AssetDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AssetPayload>;
                };
                update: {
                    args: Prisma.AssetUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AssetPayload>;
                };
                deleteMany: {
                    args: Prisma.AssetDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.AssetUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.AssetUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AssetPayload>[];
                };
                upsert: {
                    args: Prisma.AssetUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AssetPayload>;
                };
                aggregate: {
                    args: Prisma.AssetAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateAsset>;
                };
                groupBy: {
                    args: Prisma.AssetGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AssetGroupByOutputType>[];
                };
                count: {
                    args: Prisma.AssetCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AssetCountAggregateOutputType> | number;
                };
            };
        };
        UserAsset: {
            payload: Prisma.$UserAssetPayload<ExtArgs>;
            fields: Prisma.UserAssetFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.UserAssetFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserAssetPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.UserAssetFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserAssetPayload>;
                };
                findFirst: {
                    args: Prisma.UserAssetFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserAssetPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.UserAssetFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserAssetPayload>;
                };
                findMany: {
                    args: Prisma.UserAssetFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserAssetPayload>[];
                };
                create: {
                    args: Prisma.UserAssetCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserAssetPayload>;
                };
                createMany: {
                    args: Prisma.UserAssetCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.UserAssetCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserAssetPayload>[];
                };
                delete: {
                    args: Prisma.UserAssetDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserAssetPayload>;
                };
                update: {
                    args: Prisma.UserAssetUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserAssetPayload>;
                };
                deleteMany: {
                    args: Prisma.UserAssetDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.UserAssetUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.UserAssetUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserAssetPayload>[];
                };
                upsert: {
                    args: Prisma.UserAssetUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserAssetPayload>;
                };
                aggregate: {
                    args: Prisma.UserAssetAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateUserAsset>;
                };
                groupBy: {
                    args: Prisma.UserAssetGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.UserAssetGroupByOutputType>[];
                };
                count: {
                    args: Prisma.UserAssetCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.UserAssetCountAggregateOutputType> | number;
                };
            };
        };
        Match: {
            payload: Prisma.$MatchPayload<ExtArgs>;
            fields: Prisma.MatchFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.MatchFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MatchPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.MatchFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MatchPayload>;
                };
                findFirst: {
                    args: Prisma.MatchFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MatchPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.MatchFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MatchPayload>;
                };
                findMany: {
                    args: Prisma.MatchFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MatchPayload>[];
                };
                create: {
                    args: Prisma.MatchCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MatchPayload>;
                };
                createMany: {
                    args: Prisma.MatchCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.MatchCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MatchPayload>[];
                };
                delete: {
                    args: Prisma.MatchDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MatchPayload>;
                };
                update: {
                    args: Prisma.MatchUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MatchPayload>;
                };
                deleteMany: {
                    args: Prisma.MatchDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.MatchUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.MatchUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MatchPayload>[];
                };
                upsert: {
                    args: Prisma.MatchUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MatchPayload>;
                };
                aggregate: {
                    args: Prisma.MatchAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateMatch>;
                };
                groupBy: {
                    args: Prisma.MatchGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.MatchGroupByOutputType>[];
                };
                count: {
                    args: Prisma.MatchCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.MatchCountAggregateOutputType> | number;
                };
            };
        };
        PredictionMarket: {
            payload: Prisma.$PredictionMarketPayload<ExtArgs>;
            fields: Prisma.PredictionMarketFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.PredictionMarketFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PredictionMarketPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.PredictionMarketFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PredictionMarketPayload>;
                };
                findFirst: {
                    args: Prisma.PredictionMarketFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PredictionMarketPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.PredictionMarketFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PredictionMarketPayload>;
                };
                findMany: {
                    args: Prisma.PredictionMarketFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PredictionMarketPayload>[];
                };
                create: {
                    args: Prisma.PredictionMarketCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PredictionMarketPayload>;
                };
                createMany: {
                    args: Prisma.PredictionMarketCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.PredictionMarketCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PredictionMarketPayload>[];
                };
                delete: {
                    args: Prisma.PredictionMarketDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PredictionMarketPayload>;
                };
                update: {
                    args: Prisma.PredictionMarketUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PredictionMarketPayload>;
                };
                deleteMany: {
                    args: Prisma.PredictionMarketDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.PredictionMarketUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.PredictionMarketUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PredictionMarketPayload>[];
                };
                upsert: {
                    args: Prisma.PredictionMarketUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PredictionMarketPayload>;
                };
                aggregate: {
                    args: Prisma.PredictionMarketAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregatePredictionMarket>;
                };
                groupBy: {
                    args: Prisma.PredictionMarketGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PredictionMarketGroupByOutputType>[];
                };
                count: {
                    args: Prisma.PredictionMarketCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PredictionMarketCountAggregateOutputType> | number;
                };
            };
        };
        PredictionPosition: {
            payload: Prisma.$PredictionPositionPayload<ExtArgs>;
            fields: Prisma.PredictionPositionFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.PredictionPositionFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PredictionPositionPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.PredictionPositionFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PredictionPositionPayload>;
                };
                findFirst: {
                    args: Prisma.PredictionPositionFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PredictionPositionPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.PredictionPositionFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PredictionPositionPayload>;
                };
                findMany: {
                    args: Prisma.PredictionPositionFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PredictionPositionPayload>[];
                };
                create: {
                    args: Prisma.PredictionPositionCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PredictionPositionPayload>;
                };
                createMany: {
                    args: Prisma.PredictionPositionCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.PredictionPositionCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PredictionPositionPayload>[];
                };
                delete: {
                    args: Prisma.PredictionPositionDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PredictionPositionPayload>;
                };
                update: {
                    args: Prisma.PredictionPositionUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PredictionPositionPayload>;
                };
                deleteMany: {
                    args: Prisma.PredictionPositionDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.PredictionPositionUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.PredictionPositionUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PredictionPositionPayload>[];
                };
                upsert: {
                    args: Prisma.PredictionPositionUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PredictionPositionPayload>;
                };
                aggregate: {
                    args: Prisma.PredictionPositionAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregatePredictionPosition>;
                };
                groupBy: {
                    args: Prisma.PredictionPositionGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PredictionPositionGroupByOutputType>[];
                };
                count: {
                    args: Prisma.PredictionPositionCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PredictionPositionCountAggregateOutputType> | number;
                };
            };
        };
        Transaction: {
            payload: Prisma.$TransactionPayload<ExtArgs>;
            fields: Prisma.TransactionFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.TransactionFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TransactionPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.TransactionFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TransactionPayload>;
                };
                findFirst: {
                    args: Prisma.TransactionFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TransactionPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.TransactionFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TransactionPayload>;
                };
                findMany: {
                    args: Prisma.TransactionFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TransactionPayload>[];
                };
                create: {
                    args: Prisma.TransactionCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TransactionPayload>;
                };
                createMany: {
                    args: Prisma.TransactionCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.TransactionCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TransactionPayload>[];
                };
                delete: {
                    args: Prisma.TransactionDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TransactionPayload>;
                };
                update: {
                    args: Prisma.TransactionUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TransactionPayload>;
                };
                deleteMany: {
                    args: Prisma.TransactionDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.TransactionUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.TransactionUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TransactionPayload>[];
                };
                upsert: {
                    args: Prisma.TransactionUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TransactionPayload>;
                };
                aggregate: {
                    args: Prisma.TransactionAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateTransaction>;
                };
                groupBy: {
                    args: Prisma.TransactionGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TransactionGroupByOutputType>[];
                };
                count: {
                    args: Prisma.TransactionCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TransactionCountAggregateOutputType> | number;
                };
            };
        };
    };
} & {
    other: {
        payload: any;
        operations: {
            $executeRaw: {
                args: [query: TemplateStringsArray | Sql, ...values: any[]];
                result: any;
            };
            $executeRawUnsafe: {
                args: [query: string, ...values: any[]];
                result: any;
            };
            $queryRaw: {
                args: [query: TemplateStringsArray | Sql, ...values: any[]];
                result: any;
            };
            $queryRawUnsafe: {
                args: [query: string, ...values: any[]];
                result: any;
            };
        };
    };
};
/**
 * Enums
 */
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
/**
 * Field references
 */
/**
 * Reference to a field of type 'String'
 */
export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>;
/**
 * Reference to a field of type 'String[]'
 */
export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>;
/**
 * Reference to a field of type 'DateTime'
 */
export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>;
/**
 * Reference to a field of type 'DateTime[]'
 */
export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>;
/**
 * Reference to a field of type 'AssetType'
 */
export type EnumAssetTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AssetType'>;
/**
 * Reference to a field of type 'AssetType[]'
 */
export type ListEnumAssetTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AssetType[]'>;
/**
 * Reference to a field of type 'Float'
 */
export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>;
/**
 * Reference to a field of type 'Float[]'
 */
export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>;
/**
 * Reference to a field of type 'Int'
 */
export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>;
/**
 * Reference to a field of type 'Int[]'
 */
export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>;
/**
 * Reference to a field of type 'MatchStatus'
 */
export type EnumMatchStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MatchStatus'>;
/**
 * Reference to a field of type 'MatchStatus[]'
 */
export type ListEnumMatchStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MatchStatus[]'>;
/**
 * Reference to a field of type 'MatchResult'
 */
export type EnumMatchResultFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MatchResult'>;
/**
 * Reference to a field of type 'MatchResult[]'
 */
export type ListEnumMatchResultFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MatchResult[]'>;
/**
 * Reference to a field of type 'MarketStatus'
 */
export type EnumMarketStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MarketStatus'>;
/**
 * Reference to a field of type 'MarketStatus[]'
 */
export type ListEnumMarketStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MarketStatus[]'>;
/**
 * Reference to a field of type 'PredictionSide'
 */
export type EnumPredictionSideFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PredictionSide'>;
/**
 * Reference to a field of type 'PredictionSide[]'
 */
export type ListEnumPredictionSideFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PredictionSide[]'>;
/**
 * Reference to a field of type 'TransactionType'
 */
export type EnumTransactionTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TransactionType'>;
/**
 * Reference to a field of type 'TransactionType[]'
 */
export type ListEnumTransactionTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TransactionType[]'>;
/**
 * Batch Payload for updateMany & deleteMany & createMany
 */
export type BatchPayload = {
    count: number;
};
export declare const defineExtension: runtime.Types.Extensions.ExtendsHook<"define", TypeMapCb, runtime.Types.Extensions.DefaultArgs>;
export type DefaultPrismaClient = PrismaClient;
export type ErrorFormat = 'pretty' | 'colorless' | 'minimal';
export type PrismaClientOptions = ({
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-pg`.
     */
    adapter: runtime.SqlDriverAdapterFactory;
    accelerateUrl?: never;
} | {
    /**
     * Prisma Accelerate URL allowing the client to connect through Accelerate instead of a direct database.
     */
    accelerateUrl: string;
    adapter?: never;
}) & {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat;
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     *
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     *
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     *
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[];
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
        maxWait?: number;
        timeout?: number;
        isolationLevel?: TransactionIsolationLevel;
    };
    /**
     * Global configuration for omitting model fields by default.
     *
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: GlobalOmitConfig;
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     *
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[];
};
export type GlobalOmitConfig = {
    user?: Prisma.UserOmit;
    team?: Prisma.TeamOmit;
    assetCollection?: Prisma.AssetCollectionOmit;
    asset?: Prisma.AssetOmit;
    userAsset?: Prisma.UserAssetOmit;
    match?: Prisma.MatchOmit;
    predictionMarket?: Prisma.PredictionMarketOmit;
    predictionPosition?: Prisma.PredictionPositionOmit;
    transaction?: Prisma.TransactionOmit;
};
export type LogLevel = 'info' | 'query' | 'warn' | 'error';
export type LogDefinition = {
    level: LogLevel;
    emit: 'stdout' | 'event';
};
export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;
export type GetLogType<T> = CheckIsLogLevel<T extends LogDefinition ? T['level'] : T>;
export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition> ? GetLogType<T[number]> : never;
export type QueryEvent = {
    timestamp: Date;
    query: string;
    params: string;
    duration: number;
    target: string;
};
export type LogEvent = {
    timestamp: Date;
    message: string;
    target: string;
};
export type PrismaAction = 'findUnique' | 'findUniqueOrThrow' | 'findMany' | 'findFirst' | 'findFirstOrThrow' | 'create' | 'createMany' | 'createManyAndReturn' | 'update' | 'updateMany' | 'updateManyAndReturn' | 'upsert' | 'delete' | 'deleteMany' | 'executeRaw' | 'queryRaw' | 'aggregate' | 'count' | 'runCommandRaw' | 'findRaw' | 'groupBy';
/**
 * `PrismaClient` proxy available in interactive transactions.
 */
export type TransactionClient = Omit<DefaultPrismaClient, runtime.ITXClientDenyList>;
//# sourceMappingURL=prismaNamespace.d.ts.map