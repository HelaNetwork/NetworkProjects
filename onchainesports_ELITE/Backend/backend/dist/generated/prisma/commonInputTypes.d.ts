import * as $Enums from "./enums.js";
import type * as Prisma from "./internal/prismaNamespace.js";
export type StringFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    startsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    endsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    mode?: Prisma.QueryMode;
    not?: Prisma.NestedStringFilter<$PrismaModel> | string;
};
export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    startsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    endsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    mode?: Prisma.QueryMode;
    not?: Prisma.NestedStringNullableFilter<$PrismaModel> | string | null;
};
export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedDateTimeFilter<$PrismaModel> | Date | string;
};
export type SortOrderInput = {
    sort: Prisma.SortOrder;
    nulls?: Prisma.NullsOrder;
};
export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    startsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    endsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    mode?: Prisma.QueryMode;
    not?: Prisma.NestedStringWithAggregatesFilter<$PrismaModel> | string;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedStringFilter<$PrismaModel>;
    _max?: Prisma.NestedStringFilter<$PrismaModel>;
};
export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    startsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    endsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    mode?: Prisma.QueryMode;
    not?: Prisma.NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedStringNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedStringNullableFilter<$PrismaModel>;
};
export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedDateTimeFilter<$PrismaModel>;
    _max?: Prisma.NestedDateTimeFilter<$PrismaModel>;
};
export type EnumAssetTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.AssetType | Prisma.EnumAssetTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.AssetType[] | Prisma.ListEnumAssetTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.AssetType[] | Prisma.ListEnumAssetTypeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumAssetTypeFilter<$PrismaModel> | $Enums.AssetType;
};
export type FloatFilter<$PrismaModel = never> = {
    equals?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    in?: number[] | Prisma.ListFloatFieldRefInput<$PrismaModel>;
    notIn?: number[] | Prisma.ListFloatFieldRefInput<$PrismaModel>;
    lt?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedFloatFilter<$PrismaModel> | number;
};
export type IntFilter<$PrismaModel = never> = {
    equals?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    in?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    lt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedIntFilter<$PrismaModel> | number;
};
export type EnumAssetTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AssetType | Prisma.EnumAssetTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.AssetType[] | Prisma.ListEnumAssetTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.AssetType[] | Prisma.ListEnumAssetTypeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumAssetTypeWithAggregatesFilter<$PrismaModel> | $Enums.AssetType;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumAssetTypeFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumAssetTypeFilter<$PrismaModel>;
};
export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    in?: number[] | Prisma.ListFloatFieldRefInput<$PrismaModel>;
    notIn?: number[] | Prisma.ListFloatFieldRefInput<$PrismaModel>;
    lt?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedFloatWithAggregatesFilter<$PrismaModel> | number;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _avg?: Prisma.NestedFloatFilter<$PrismaModel>;
    _sum?: Prisma.NestedFloatFilter<$PrismaModel>;
    _min?: Prisma.NestedFloatFilter<$PrismaModel>;
    _max?: Prisma.NestedFloatFilter<$PrismaModel>;
};
export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    in?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    lt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedIntWithAggregatesFilter<$PrismaModel> | number;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _avg?: Prisma.NestedFloatFilter<$PrismaModel>;
    _sum?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedIntFilter<$PrismaModel>;
    _max?: Prisma.NestedIntFilter<$PrismaModel>;
};
export type EnumMatchStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.MatchStatus | Prisma.EnumMatchStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.MatchStatus[] | Prisma.ListEnumMatchStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.MatchStatus[] | Prisma.ListEnumMatchStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumMatchStatusFilter<$PrismaModel> | $Enums.MatchStatus;
};
export type EnumMatchResultNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.MatchResult | Prisma.EnumMatchResultFieldRefInput<$PrismaModel> | null;
    in?: $Enums.MatchResult[] | Prisma.ListEnumMatchResultFieldRefInput<$PrismaModel> | null;
    notIn?: $Enums.MatchResult[] | Prisma.ListEnumMatchResultFieldRefInput<$PrismaModel> | null;
    not?: Prisma.NestedEnumMatchResultNullableFilter<$PrismaModel> | $Enums.MatchResult | null;
};
export type EnumMatchStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MatchStatus | Prisma.EnumMatchStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.MatchStatus[] | Prisma.ListEnumMatchStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.MatchStatus[] | Prisma.ListEnumMatchStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumMatchStatusWithAggregatesFilter<$PrismaModel> | $Enums.MatchStatus;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumMatchStatusFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumMatchStatusFilter<$PrismaModel>;
};
export type EnumMatchResultNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MatchResult | Prisma.EnumMatchResultFieldRefInput<$PrismaModel> | null;
    in?: $Enums.MatchResult[] | Prisma.ListEnumMatchResultFieldRefInput<$PrismaModel> | null;
    notIn?: $Enums.MatchResult[] | Prisma.ListEnumMatchResultFieldRefInput<$PrismaModel> | null;
    not?: Prisma.NestedEnumMatchResultNullableWithAggregatesFilter<$PrismaModel> | $Enums.MatchResult | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumMatchResultNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumMatchResultNullableFilter<$PrismaModel>;
};
export type EnumMarketStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.MarketStatus | Prisma.EnumMarketStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.MarketStatus[] | Prisma.ListEnumMarketStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.MarketStatus[] | Prisma.ListEnumMarketStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumMarketStatusFilter<$PrismaModel> | $Enums.MarketStatus;
};
export type EnumMarketStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MarketStatus | Prisma.EnumMarketStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.MarketStatus[] | Prisma.ListEnumMarketStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.MarketStatus[] | Prisma.ListEnumMarketStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumMarketStatusWithAggregatesFilter<$PrismaModel> | $Enums.MarketStatus;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumMarketStatusFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumMarketStatusFilter<$PrismaModel>;
};
export type EnumPredictionSideFilter<$PrismaModel = never> = {
    equals?: $Enums.PredictionSide | Prisma.EnumPredictionSideFieldRefInput<$PrismaModel>;
    in?: $Enums.PredictionSide[] | Prisma.ListEnumPredictionSideFieldRefInput<$PrismaModel>;
    notIn?: $Enums.PredictionSide[] | Prisma.ListEnumPredictionSideFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumPredictionSideFilter<$PrismaModel> | $Enums.PredictionSide;
};
export type EnumPredictionSideWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PredictionSide | Prisma.EnumPredictionSideFieldRefInput<$PrismaModel>;
    in?: $Enums.PredictionSide[] | Prisma.ListEnumPredictionSideFieldRefInput<$PrismaModel>;
    notIn?: $Enums.PredictionSide[] | Prisma.ListEnumPredictionSideFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumPredictionSideWithAggregatesFilter<$PrismaModel> | $Enums.PredictionSide;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumPredictionSideFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumPredictionSideFilter<$PrismaModel>;
};
export type EnumTransactionTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.TransactionType | Prisma.EnumTransactionTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.TransactionType[] | Prisma.ListEnumTransactionTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.TransactionType[] | Prisma.ListEnumTransactionTypeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumTransactionTypeFilter<$PrismaModel> | $Enums.TransactionType;
};
export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | Prisma.IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel> | null;
    lt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedIntNullableFilter<$PrismaModel> | number | null;
};
export type EnumTransactionTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TransactionType | Prisma.EnumTransactionTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.TransactionType[] | Prisma.ListEnumTransactionTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.TransactionType[] | Prisma.ListEnumTransactionTypeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumTransactionTypeWithAggregatesFilter<$PrismaModel> | $Enums.TransactionType;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumTransactionTypeFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumTransactionTypeFilter<$PrismaModel>;
};
export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | Prisma.IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel> | null;
    lt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _avg?: Prisma.NestedFloatNullableFilter<$PrismaModel>;
    _sum?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedIntNullableFilter<$PrismaModel>;
};
export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    startsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    endsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedStringFilter<$PrismaModel> | string;
};
export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    startsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    endsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedStringNullableFilter<$PrismaModel> | string | null;
};
export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedDateTimeFilter<$PrismaModel> | Date | string;
};
export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    startsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    endsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedStringWithAggregatesFilter<$PrismaModel> | string;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedStringFilter<$PrismaModel>;
    _max?: Prisma.NestedStringFilter<$PrismaModel>;
};
export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    in?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    lt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedIntFilter<$PrismaModel> | number;
};
export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    startsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    endsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedStringNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedStringNullableFilter<$PrismaModel>;
};
export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | Prisma.IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel> | null;
    lt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedIntNullableFilter<$PrismaModel> | number | null;
};
export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedDateTimeFilter<$PrismaModel>;
    _max?: Prisma.NestedDateTimeFilter<$PrismaModel>;
};
export type NestedEnumAssetTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.AssetType | Prisma.EnumAssetTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.AssetType[] | Prisma.ListEnumAssetTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.AssetType[] | Prisma.ListEnumAssetTypeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumAssetTypeFilter<$PrismaModel> | $Enums.AssetType;
};
export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    in?: number[] | Prisma.ListFloatFieldRefInput<$PrismaModel>;
    notIn?: number[] | Prisma.ListFloatFieldRefInput<$PrismaModel>;
    lt?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedFloatFilter<$PrismaModel> | number;
};
export type NestedEnumAssetTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AssetType | Prisma.EnumAssetTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.AssetType[] | Prisma.ListEnumAssetTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.AssetType[] | Prisma.ListEnumAssetTypeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumAssetTypeWithAggregatesFilter<$PrismaModel> | $Enums.AssetType;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumAssetTypeFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumAssetTypeFilter<$PrismaModel>;
};
export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    in?: number[] | Prisma.ListFloatFieldRefInput<$PrismaModel>;
    notIn?: number[] | Prisma.ListFloatFieldRefInput<$PrismaModel>;
    lt?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedFloatWithAggregatesFilter<$PrismaModel> | number;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _avg?: Prisma.NestedFloatFilter<$PrismaModel>;
    _sum?: Prisma.NestedFloatFilter<$PrismaModel>;
    _min?: Prisma.NestedFloatFilter<$PrismaModel>;
    _max?: Prisma.NestedFloatFilter<$PrismaModel>;
};
export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    in?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    lt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedIntWithAggregatesFilter<$PrismaModel> | number;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _avg?: Prisma.NestedFloatFilter<$PrismaModel>;
    _sum?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedIntFilter<$PrismaModel>;
    _max?: Prisma.NestedIntFilter<$PrismaModel>;
};
export type NestedEnumMatchStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.MatchStatus | Prisma.EnumMatchStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.MatchStatus[] | Prisma.ListEnumMatchStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.MatchStatus[] | Prisma.ListEnumMatchStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumMatchStatusFilter<$PrismaModel> | $Enums.MatchStatus;
};
export type NestedEnumMatchResultNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.MatchResult | Prisma.EnumMatchResultFieldRefInput<$PrismaModel> | null;
    in?: $Enums.MatchResult[] | Prisma.ListEnumMatchResultFieldRefInput<$PrismaModel> | null;
    notIn?: $Enums.MatchResult[] | Prisma.ListEnumMatchResultFieldRefInput<$PrismaModel> | null;
    not?: Prisma.NestedEnumMatchResultNullableFilter<$PrismaModel> | $Enums.MatchResult | null;
};
export type NestedEnumMatchStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MatchStatus | Prisma.EnumMatchStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.MatchStatus[] | Prisma.ListEnumMatchStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.MatchStatus[] | Prisma.ListEnumMatchStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumMatchStatusWithAggregatesFilter<$PrismaModel> | $Enums.MatchStatus;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumMatchStatusFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumMatchStatusFilter<$PrismaModel>;
};
export type NestedEnumMatchResultNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MatchResult | Prisma.EnumMatchResultFieldRefInput<$PrismaModel> | null;
    in?: $Enums.MatchResult[] | Prisma.ListEnumMatchResultFieldRefInput<$PrismaModel> | null;
    notIn?: $Enums.MatchResult[] | Prisma.ListEnumMatchResultFieldRefInput<$PrismaModel> | null;
    not?: Prisma.NestedEnumMatchResultNullableWithAggregatesFilter<$PrismaModel> | $Enums.MatchResult | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumMatchResultNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumMatchResultNullableFilter<$PrismaModel>;
};
export type NestedEnumMarketStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.MarketStatus | Prisma.EnumMarketStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.MarketStatus[] | Prisma.ListEnumMarketStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.MarketStatus[] | Prisma.ListEnumMarketStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumMarketStatusFilter<$PrismaModel> | $Enums.MarketStatus;
};
export type NestedEnumMarketStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MarketStatus | Prisma.EnumMarketStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.MarketStatus[] | Prisma.ListEnumMarketStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.MarketStatus[] | Prisma.ListEnumMarketStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumMarketStatusWithAggregatesFilter<$PrismaModel> | $Enums.MarketStatus;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumMarketStatusFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumMarketStatusFilter<$PrismaModel>;
};
export type NestedEnumPredictionSideFilter<$PrismaModel = never> = {
    equals?: $Enums.PredictionSide | Prisma.EnumPredictionSideFieldRefInput<$PrismaModel>;
    in?: $Enums.PredictionSide[] | Prisma.ListEnumPredictionSideFieldRefInput<$PrismaModel>;
    notIn?: $Enums.PredictionSide[] | Prisma.ListEnumPredictionSideFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumPredictionSideFilter<$PrismaModel> | $Enums.PredictionSide;
};
export type NestedEnumPredictionSideWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PredictionSide | Prisma.EnumPredictionSideFieldRefInput<$PrismaModel>;
    in?: $Enums.PredictionSide[] | Prisma.ListEnumPredictionSideFieldRefInput<$PrismaModel>;
    notIn?: $Enums.PredictionSide[] | Prisma.ListEnumPredictionSideFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumPredictionSideWithAggregatesFilter<$PrismaModel> | $Enums.PredictionSide;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumPredictionSideFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumPredictionSideFilter<$PrismaModel>;
};
export type NestedEnumTransactionTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.TransactionType | Prisma.EnumTransactionTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.TransactionType[] | Prisma.ListEnumTransactionTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.TransactionType[] | Prisma.ListEnumTransactionTypeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumTransactionTypeFilter<$PrismaModel> | $Enums.TransactionType;
};
export type NestedEnumTransactionTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TransactionType | Prisma.EnumTransactionTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.TransactionType[] | Prisma.ListEnumTransactionTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.TransactionType[] | Prisma.ListEnumTransactionTypeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumTransactionTypeWithAggregatesFilter<$PrismaModel> | $Enums.TransactionType;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumTransactionTypeFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumTransactionTypeFilter<$PrismaModel>;
};
export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | Prisma.IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel> | null;
    lt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _avg?: Prisma.NestedFloatNullableFilter<$PrismaModel>;
    _sum?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedIntNullableFilter<$PrismaModel>;
};
export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | Prisma.FloatFieldRefInput<$PrismaModel> | null;
    in?: number[] | Prisma.ListFloatFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | Prisma.ListFloatFieldRefInput<$PrismaModel> | null;
    lt?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedFloatNullableFilter<$PrismaModel> | number | null;
};
//# sourceMappingURL=commonInputTypes.d.ts.map