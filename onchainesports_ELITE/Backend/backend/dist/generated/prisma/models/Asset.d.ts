import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model Asset
 *
 */
export type AssetModel = runtime.Types.Result.DefaultSelection<Prisma.$AssetPayload>;
export type AggregateAsset = {
    _count: AssetCountAggregateOutputType | null;
    _avg: AssetAvgAggregateOutputType | null;
    _sum: AssetSumAggregateOutputType | null;
    _min: AssetMinAggregateOutputType | null;
    _max: AssetMaxAggregateOutputType | null;
};
export type AssetAvgAggregateOutputType = {
    basePrice: number | null;
    currentPrice: number | null;
    totalSupply: number | null;
    circulating: number | null;
    bondingCurveK: number | null;
};
export type AssetSumAggregateOutputType = {
    basePrice: number | null;
    currentPrice: number | null;
    totalSupply: number | null;
    circulating: number | null;
    bondingCurveK: number | null;
};
export type AssetMinAggregateOutputType = {
    id: string | null;
    name: string | null;
    assetType: $Enums.AssetType | null;
    teamId: string | null;
    collectionId: string | null;
    mintAddress: string | null;
    metadataUri: string | null;
    basePrice: number | null;
    currentPrice: number | null;
    totalSupply: number | null;
    circulating: number | null;
    bondingCurveK: number | null;
    createdAt: Date | null;
};
export type AssetMaxAggregateOutputType = {
    id: string | null;
    name: string | null;
    assetType: $Enums.AssetType | null;
    teamId: string | null;
    collectionId: string | null;
    mintAddress: string | null;
    metadataUri: string | null;
    basePrice: number | null;
    currentPrice: number | null;
    totalSupply: number | null;
    circulating: number | null;
    bondingCurveK: number | null;
    createdAt: Date | null;
};
export type AssetCountAggregateOutputType = {
    id: number;
    name: number;
    assetType: number;
    teamId: number;
    collectionId: number;
    mintAddress: number;
    metadataUri: number;
    basePrice: number;
    currentPrice: number;
    totalSupply: number;
    circulating: number;
    bondingCurveK: number;
    createdAt: number;
    _all: number;
};
export type AssetAvgAggregateInputType = {
    basePrice?: true;
    currentPrice?: true;
    totalSupply?: true;
    circulating?: true;
    bondingCurveK?: true;
};
export type AssetSumAggregateInputType = {
    basePrice?: true;
    currentPrice?: true;
    totalSupply?: true;
    circulating?: true;
    bondingCurveK?: true;
};
export type AssetMinAggregateInputType = {
    id?: true;
    name?: true;
    assetType?: true;
    teamId?: true;
    collectionId?: true;
    mintAddress?: true;
    metadataUri?: true;
    basePrice?: true;
    currentPrice?: true;
    totalSupply?: true;
    circulating?: true;
    bondingCurveK?: true;
    createdAt?: true;
};
export type AssetMaxAggregateInputType = {
    id?: true;
    name?: true;
    assetType?: true;
    teamId?: true;
    collectionId?: true;
    mintAddress?: true;
    metadataUri?: true;
    basePrice?: true;
    currentPrice?: true;
    totalSupply?: true;
    circulating?: true;
    bondingCurveK?: true;
    createdAt?: true;
};
export type AssetCountAggregateInputType = {
    id?: true;
    name?: true;
    assetType?: true;
    teamId?: true;
    collectionId?: true;
    mintAddress?: true;
    metadataUri?: true;
    basePrice?: true;
    currentPrice?: true;
    totalSupply?: true;
    circulating?: true;
    bondingCurveK?: true;
    createdAt?: true;
    _all?: true;
};
export type AssetAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which Asset to aggregate.
     */
    where?: Prisma.AssetWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Assets to fetch.
     */
    orderBy?: Prisma.AssetOrderByWithRelationInput | Prisma.AssetOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.AssetWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Assets from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Assets.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Assets
    **/
    _count?: true | AssetCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: AssetAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: AssetSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: AssetMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: AssetMaxAggregateInputType;
};
export type GetAssetAggregateType<T extends AssetAggregateArgs> = {
    [P in keyof T & keyof AggregateAsset]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateAsset[P]> : Prisma.GetScalarType<T[P], AggregateAsset[P]>;
};
export type AssetGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AssetWhereInput;
    orderBy?: Prisma.AssetOrderByWithAggregationInput | Prisma.AssetOrderByWithAggregationInput[];
    by: Prisma.AssetScalarFieldEnum[] | Prisma.AssetScalarFieldEnum;
    having?: Prisma.AssetScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: AssetCountAggregateInputType | true;
    _avg?: AssetAvgAggregateInputType;
    _sum?: AssetSumAggregateInputType;
    _min?: AssetMinAggregateInputType;
    _max?: AssetMaxAggregateInputType;
};
export type AssetGroupByOutputType = {
    id: string;
    name: string;
    assetType: $Enums.AssetType;
    teamId: string | null;
    collectionId: string | null;
    mintAddress: string | null;
    metadataUri: string | null;
    basePrice: number;
    currentPrice: number;
    totalSupply: number;
    circulating: number;
    bondingCurveK: number;
    createdAt: Date;
    _count: AssetCountAggregateOutputType | null;
    _avg: AssetAvgAggregateOutputType | null;
    _sum: AssetSumAggregateOutputType | null;
    _min: AssetMinAggregateOutputType | null;
    _max: AssetMaxAggregateOutputType | null;
};
type GetAssetGroupByPayload<T extends AssetGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<AssetGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof AssetGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], AssetGroupByOutputType[P]> : Prisma.GetScalarType<T[P], AssetGroupByOutputType[P]>;
}>>;
export type AssetWhereInput = {
    AND?: Prisma.AssetWhereInput | Prisma.AssetWhereInput[];
    OR?: Prisma.AssetWhereInput[];
    NOT?: Prisma.AssetWhereInput | Prisma.AssetWhereInput[];
    id?: Prisma.StringFilter<"Asset"> | string;
    name?: Prisma.StringFilter<"Asset"> | string;
    assetType?: Prisma.EnumAssetTypeFilter<"Asset"> | $Enums.AssetType;
    teamId?: Prisma.StringNullableFilter<"Asset"> | string | null;
    collectionId?: Prisma.StringNullableFilter<"Asset"> | string | null;
    mintAddress?: Prisma.StringNullableFilter<"Asset"> | string | null;
    metadataUri?: Prisma.StringNullableFilter<"Asset"> | string | null;
    basePrice?: Prisma.FloatFilter<"Asset"> | number;
    currentPrice?: Prisma.FloatFilter<"Asset"> | number;
    totalSupply?: Prisma.IntFilter<"Asset"> | number;
    circulating?: Prisma.IntFilter<"Asset"> | number;
    bondingCurveK?: Prisma.FloatFilter<"Asset"> | number;
    createdAt?: Prisma.DateTimeFilter<"Asset"> | Date | string;
    team?: Prisma.XOR<Prisma.TeamNullableScalarRelationFilter, Prisma.TeamWhereInput> | null;
    collection?: Prisma.XOR<Prisma.AssetCollectionNullableScalarRelationFilter, Prisma.AssetCollectionWhereInput> | null;
    holders?: Prisma.UserAssetListRelationFilter;
};
export type AssetOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    assetType?: Prisma.SortOrder;
    teamId?: Prisma.SortOrderInput | Prisma.SortOrder;
    collectionId?: Prisma.SortOrderInput | Prisma.SortOrder;
    mintAddress?: Prisma.SortOrderInput | Prisma.SortOrder;
    metadataUri?: Prisma.SortOrderInput | Prisma.SortOrder;
    basePrice?: Prisma.SortOrder;
    currentPrice?: Prisma.SortOrder;
    totalSupply?: Prisma.SortOrder;
    circulating?: Prisma.SortOrder;
    bondingCurveK?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    team?: Prisma.TeamOrderByWithRelationInput;
    collection?: Prisma.AssetCollectionOrderByWithRelationInput;
    holders?: Prisma.UserAssetOrderByRelationAggregateInput;
};
export type AssetWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.AssetWhereInput | Prisma.AssetWhereInput[];
    OR?: Prisma.AssetWhereInput[];
    NOT?: Prisma.AssetWhereInput | Prisma.AssetWhereInput[];
    name?: Prisma.StringFilter<"Asset"> | string;
    assetType?: Prisma.EnumAssetTypeFilter<"Asset"> | $Enums.AssetType;
    teamId?: Prisma.StringNullableFilter<"Asset"> | string | null;
    collectionId?: Prisma.StringNullableFilter<"Asset"> | string | null;
    mintAddress?: Prisma.StringNullableFilter<"Asset"> | string | null;
    metadataUri?: Prisma.StringNullableFilter<"Asset"> | string | null;
    basePrice?: Prisma.FloatFilter<"Asset"> | number;
    currentPrice?: Prisma.FloatFilter<"Asset"> | number;
    totalSupply?: Prisma.IntFilter<"Asset"> | number;
    circulating?: Prisma.IntFilter<"Asset"> | number;
    bondingCurveK?: Prisma.FloatFilter<"Asset"> | number;
    createdAt?: Prisma.DateTimeFilter<"Asset"> | Date | string;
    team?: Prisma.XOR<Prisma.TeamNullableScalarRelationFilter, Prisma.TeamWhereInput> | null;
    collection?: Prisma.XOR<Prisma.AssetCollectionNullableScalarRelationFilter, Prisma.AssetCollectionWhereInput> | null;
    holders?: Prisma.UserAssetListRelationFilter;
}, "id">;
export type AssetOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    assetType?: Prisma.SortOrder;
    teamId?: Prisma.SortOrderInput | Prisma.SortOrder;
    collectionId?: Prisma.SortOrderInput | Prisma.SortOrder;
    mintAddress?: Prisma.SortOrderInput | Prisma.SortOrder;
    metadataUri?: Prisma.SortOrderInput | Prisma.SortOrder;
    basePrice?: Prisma.SortOrder;
    currentPrice?: Prisma.SortOrder;
    totalSupply?: Prisma.SortOrder;
    circulating?: Prisma.SortOrder;
    bondingCurveK?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    _count?: Prisma.AssetCountOrderByAggregateInput;
    _avg?: Prisma.AssetAvgOrderByAggregateInput;
    _max?: Prisma.AssetMaxOrderByAggregateInput;
    _min?: Prisma.AssetMinOrderByAggregateInput;
    _sum?: Prisma.AssetSumOrderByAggregateInput;
};
export type AssetScalarWhereWithAggregatesInput = {
    AND?: Prisma.AssetScalarWhereWithAggregatesInput | Prisma.AssetScalarWhereWithAggregatesInput[];
    OR?: Prisma.AssetScalarWhereWithAggregatesInput[];
    NOT?: Prisma.AssetScalarWhereWithAggregatesInput | Prisma.AssetScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"Asset"> | string;
    name?: Prisma.StringWithAggregatesFilter<"Asset"> | string;
    assetType?: Prisma.EnumAssetTypeWithAggregatesFilter<"Asset"> | $Enums.AssetType;
    teamId?: Prisma.StringNullableWithAggregatesFilter<"Asset"> | string | null;
    collectionId?: Prisma.StringNullableWithAggregatesFilter<"Asset"> | string | null;
    mintAddress?: Prisma.StringNullableWithAggregatesFilter<"Asset"> | string | null;
    metadataUri?: Prisma.StringNullableWithAggregatesFilter<"Asset"> | string | null;
    basePrice?: Prisma.FloatWithAggregatesFilter<"Asset"> | number;
    currentPrice?: Prisma.FloatWithAggregatesFilter<"Asset"> | number;
    totalSupply?: Prisma.IntWithAggregatesFilter<"Asset"> | number;
    circulating?: Prisma.IntWithAggregatesFilter<"Asset"> | number;
    bondingCurveK?: Prisma.FloatWithAggregatesFilter<"Asset"> | number;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Asset"> | Date | string;
};
export type AssetCreateInput = {
    id?: string;
    name: string;
    assetType: $Enums.AssetType;
    mintAddress?: string | null;
    metadataUri?: string | null;
    basePrice: number;
    currentPrice: number;
    totalSupply: number;
    circulating: number;
    bondingCurveK: number;
    createdAt?: Date | string;
    team?: Prisma.TeamCreateNestedOneWithoutAssetsInput;
    collection?: Prisma.AssetCollectionCreateNestedOneWithoutAssetsInput;
    holders?: Prisma.UserAssetCreateNestedManyWithoutAssetInput;
};
export type AssetUncheckedCreateInput = {
    id?: string;
    name: string;
    assetType: $Enums.AssetType;
    teamId?: string | null;
    collectionId?: string | null;
    mintAddress?: string | null;
    metadataUri?: string | null;
    basePrice: number;
    currentPrice: number;
    totalSupply: number;
    circulating: number;
    bondingCurveK: number;
    createdAt?: Date | string;
    holders?: Prisma.UserAssetUncheckedCreateNestedManyWithoutAssetInput;
};
export type AssetUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    assetType?: Prisma.EnumAssetTypeFieldUpdateOperationsInput | $Enums.AssetType;
    mintAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    metadataUri?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    basePrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    currentPrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    totalSupply?: Prisma.IntFieldUpdateOperationsInput | number;
    circulating?: Prisma.IntFieldUpdateOperationsInput | number;
    bondingCurveK?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    team?: Prisma.TeamUpdateOneWithoutAssetsNestedInput;
    collection?: Prisma.AssetCollectionUpdateOneWithoutAssetsNestedInput;
    holders?: Prisma.UserAssetUpdateManyWithoutAssetNestedInput;
};
export type AssetUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    assetType?: Prisma.EnumAssetTypeFieldUpdateOperationsInput | $Enums.AssetType;
    teamId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    collectionId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    mintAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    metadataUri?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    basePrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    currentPrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    totalSupply?: Prisma.IntFieldUpdateOperationsInput | number;
    circulating?: Prisma.IntFieldUpdateOperationsInput | number;
    bondingCurveK?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    holders?: Prisma.UserAssetUncheckedUpdateManyWithoutAssetNestedInput;
};
export type AssetCreateManyInput = {
    id?: string;
    name: string;
    assetType: $Enums.AssetType;
    teamId?: string | null;
    collectionId?: string | null;
    mintAddress?: string | null;
    metadataUri?: string | null;
    basePrice: number;
    currentPrice: number;
    totalSupply: number;
    circulating: number;
    bondingCurveK: number;
    createdAt?: Date | string;
};
export type AssetUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    assetType?: Prisma.EnumAssetTypeFieldUpdateOperationsInput | $Enums.AssetType;
    mintAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    metadataUri?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    basePrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    currentPrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    totalSupply?: Prisma.IntFieldUpdateOperationsInput | number;
    circulating?: Prisma.IntFieldUpdateOperationsInput | number;
    bondingCurveK?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type AssetUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    assetType?: Prisma.EnumAssetTypeFieldUpdateOperationsInput | $Enums.AssetType;
    teamId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    collectionId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    mintAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    metadataUri?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    basePrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    currentPrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    totalSupply?: Prisma.IntFieldUpdateOperationsInput | number;
    circulating?: Prisma.IntFieldUpdateOperationsInput | number;
    bondingCurveK?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type AssetListRelationFilter = {
    every?: Prisma.AssetWhereInput;
    some?: Prisma.AssetWhereInput;
    none?: Prisma.AssetWhereInput;
};
export type AssetOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type AssetCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    assetType?: Prisma.SortOrder;
    teamId?: Prisma.SortOrder;
    collectionId?: Prisma.SortOrder;
    mintAddress?: Prisma.SortOrder;
    metadataUri?: Prisma.SortOrder;
    basePrice?: Prisma.SortOrder;
    currentPrice?: Prisma.SortOrder;
    totalSupply?: Prisma.SortOrder;
    circulating?: Prisma.SortOrder;
    bondingCurveK?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type AssetAvgOrderByAggregateInput = {
    basePrice?: Prisma.SortOrder;
    currentPrice?: Prisma.SortOrder;
    totalSupply?: Prisma.SortOrder;
    circulating?: Prisma.SortOrder;
    bondingCurveK?: Prisma.SortOrder;
};
export type AssetMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    assetType?: Prisma.SortOrder;
    teamId?: Prisma.SortOrder;
    collectionId?: Prisma.SortOrder;
    mintAddress?: Prisma.SortOrder;
    metadataUri?: Prisma.SortOrder;
    basePrice?: Prisma.SortOrder;
    currentPrice?: Prisma.SortOrder;
    totalSupply?: Prisma.SortOrder;
    circulating?: Prisma.SortOrder;
    bondingCurveK?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type AssetMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    assetType?: Prisma.SortOrder;
    teamId?: Prisma.SortOrder;
    collectionId?: Prisma.SortOrder;
    mintAddress?: Prisma.SortOrder;
    metadataUri?: Prisma.SortOrder;
    basePrice?: Prisma.SortOrder;
    currentPrice?: Prisma.SortOrder;
    totalSupply?: Prisma.SortOrder;
    circulating?: Prisma.SortOrder;
    bondingCurveK?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type AssetSumOrderByAggregateInput = {
    basePrice?: Prisma.SortOrder;
    currentPrice?: Prisma.SortOrder;
    totalSupply?: Prisma.SortOrder;
    circulating?: Prisma.SortOrder;
    bondingCurveK?: Prisma.SortOrder;
};
export type AssetScalarRelationFilter = {
    is?: Prisma.AssetWhereInput;
    isNot?: Prisma.AssetWhereInput;
};
export type AssetCreateNestedManyWithoutTeamInput = {
    create?: Prisma.XOR<Prisma.AssetCreateWithoutTeamInput, Prisma.AssetUncheckedCreateWithoutTeamInput> | Prisma.AssetCreateWithoutTeamInput[] | Prisma.AssetUncheckedCreateWithoutTeamInput[];
    connectOrCreate?: Prisma.AssetCreateOrConnectWithoutTeamInput | Prisma.AssetCreateOrConnectWithoutTeamInput[];
    createMany?: Prisma.AssetCreateManyTeamInputEnvelope;
    connect?: Prisma.AssetWhereUniqueInput | Prisma.AssetWhereUniqueInput[];
};
export type AssetUncheckedCreateNestedManyWithoutTeamInput = {
    create?: Prisma.XOR<Prisma.AssetCreateWithoutTeamInput, Prisma.AssetUncheckedCreateWithoutTeamInput> | Prisma.AssetCreateWithoutTeamInput[] | Prisma.AssetUncheckedCreateWithoutTeamInput[];
    connectOrCreate?: Prisma.AssetCreateOrConnectWithoutTeamInput | Prisma.AssetCreateOrConnectWithoutTeamInput[];
    createMany?: Prisma.AssetCreateManyTeamInputEnvelope;
    connect?: Prisma.AssetWhereUniqueInput | Prisma.AssetWhereUniqueInput[];
};
export type AssetUpdateManyWithoutTeamNestedInput = {
    create?: Prisma.XOR<Prisma.AssetCreateWithoutTeamInput, Prisma.AssetUncheckedCreateWithoutTeamInput> | Prisma.AssetCreateWithoutTeamInput[] | Prisma.AssetUncheckedCreateWithoutTeamInput[];
    connectOrCreate?: Prisma.AssetCreateOrConnectWithoutTeamInput | Prisma.AssetCreateOrConnectWithoutTeamInput[];
    upsert?: Prisma.AssetUpsertWithWhereUniqueWithoutTeamInput | Prisma.AssetUpsertWithWhereUniqueWithoutTeamInput[];
    createMany?: Prisma.AssetCreateManyTeamInputEnvelope;
    set?: Prisma.AssetWhereUniqueInput | Prisma.AssetWhereUniqueInput[];
    disconnect?: Prisma.AssetWhereUniqueInput | Prisma.AssetWhereUniqueInput[];
    delete?: Prisma.AssetWhereUniqueInput | Prisma.AssetWhereUniqueInput[];
    connect?: Prisma.AssetWhereUniqueInput | Prisma.AssetWhereUniqueInput[];
    update?: Prisma.AssetUpdateWithWhereUniqueWithoutTeamInput | Prisma.AssetUpdateWithWhereUniqueWithoutTeamInput[];
    updateMany?: Prisma.AssetUpdateManyWithWhereWithoutTeamInput | Prisma.AssetUpdateManyWithWhereWithoutTeamInput[];
    deleteMany?: Prisma.AssetScalarWhereInput | Prisma.AssetScalarWhereInput[];
};
export type AssetUncheckedUpdateManyWithoutTeamNestedInput = {
    create?: Prisma.XOR<Prisma.AssetCreateWithoutTeamInput, Prisma.AssetUncheckedCreateWithoutTeamInput> | Prisma.AssetCreateWithoutTeamInput[] | Prisma.AssetUncheckedCreateWithoutTeamInput[];
    connectOrCreate?: Prisma.AssetCreateOrConnectWithoutTeamInput | Prisma.AssetCreateOrConnectWithoutTeamInput[];
    upsert?: Prisma.AssetUpsertWithWhereUniqueWithoutTeamInput | Prisma.AssetUpsertWithWhereUniqueWithoutTeamInput[];
    createMany?: Prisma.AssetCreateManyTeamInputEnvelope;
    set?: Prisma.AssetWhereUniqueInput | Prisma.AssetWhereUniqueInput[];
    disconnect?: Prisma.AssetWhereUniqueInput | Prisma.AssetWhereUniqueInput[];
    delete?: Prisma.AssetWhereUniqueInput | Prisma.AssetWhereUniqueInput[];
    connect?: Prisma.AssetWhereUniqueInput | Prisma.AssetWhereUniqueInput[];
    update?: Prisma.AssetUpdateWithWhereUniqueWithoutTeamInput | Prisma.AssetUpdateWithWhereUniqueWithoutTeamInput[];
    updateMany?: Prisma.AssetUpdateManyWithWhereWithoutTeamInput | Prisma.AssetUpdateManyWithWhereWithoutTeamInput[];
    deleteMany?: Prisma.AssetScalarWhereInput | Prisma.AssetScalarWhereInput[];
};
export type AssetCreateNestedManyWithoutCollectionInput = {
    create?: Prisma.XOR<Prisma.AssetCreateWithoutCollectionInput, Prisma.AssetUncheckedCreateWithoutCollectionInput> | Prisma.AssetCreateWithoutCollectionInput[] | Prisma.AssetUncheckedCreateWithoutCollectionInput[];
    connectOrCreate?: Prisma.AssetCreateOrConnectWithoutCollectionInput | Prisma.AssetCreateOrConnectWithoutCollectionInput[];
    createMany?: Prisma.AssetCreateManyCollectionInputEnvelope;
    connect?: Prisma.AssetWhereUniqueInput | Prisma.AssetWhereUniqueInput[];
};
export type AssetUncheckedCreateNestedManyWithoutCollectionInput = {
    create?: Prisma.XOR<Prisma.AssetCreateWithoutCollectionInput, Prisma.AssetUncheckedCreateWithoutCollectionInput> | Prisma.AssetCreateWithoutCollectionInput[] | Prisma.AssetUncheckedCreateWithoutCollectionInput[];
    connectOrCreate?: Prisma.AssetCreateOrConnectWithoutCollectionInput | Prisma.AssetCreateOrConnectWithoutCollectionInput[];
    createMany?: Prisma.AssetCreateManyCollectionInputEnvelope;
    connect?: Prisma.AssetWhereUniqueInput | Prisma.AssetWhereUniqueInput[];
};
export type AssetUpdateManyWithoutCollectionNestedInput = {
    create?: Prisma.XOR<Prisma.AssetCreateWithoutCollectionInput, Prisma.AssetUncheckedCreateWithoutCollectionInput> | Prisma.AssetCreateWithoutCollectionInput[] | Prisma.AssetUncheckedCreateWithoutCollectionInput[];
    connectOrCreate?: Prisma.AssetCreateOrConnectWithoutCollectionInput | Prisma.AssetCreateOrConnectWithoutCollectionInput[];
    upsert?: Prisma.AssetUpsertWithWhereUniqueWithoutCollectionInput | Prisma.AssetUpsertWithWhereUniqueWithoutCollectionInput[];
    createMany?: Prisma.AssetCreateManyCollectionInputEnvelope;
    set?: Prisma.AssetWhereUniqueInput | Prisma.AssetWhereUniqueInput[];
    disconnect?: Prisma.AssetWhereUniqueInput | Prisma.AssetWhereUniqueInput[];
    delete?: Prisma.AssetWhereUniqueInput | Prisma.AssetWhereUniqueInput[];
    connect?: Prisma.AssetWhereUniqueInput | Prisma.AssetWhereUniqueInput[];
    update?: Prisma.AssetUpdateWithWhereUniqueWithoutCollectionInput | Prisma.AssetUpdateWithWhereUniqueWithoutCollectionInput[];
    updateMany?: Prisma.AssetUpdateManyWithWhereWithoutCollectionInput | Prisma.AssetUpdateManyWithWhereWithoutCollectionInput[];
    deleteMany?: Prisma.AssetScalarWhereInput | Prisma.AssetScalarWhereInput[];
};
export type AssetUncheckedUpdateManyWithoutCollectionNestedInput = {
    create?: Prisma.XOR<Prisma.AssetCreateWithoutCollectionInput, Prisma.AssetUncheckedCreateWithoutCollectionInput> | Prisma.AssetCreateWithoutCollectionInput[] | Prisma.AssetUncheckedCreateWithoutCollectionInput[];
    connectOrCreate?: Prisma.AssetCreateOrConnectWithoutCollectionInput | Prisma.AssetCreateOrConnectWithoutCollectionInput[];
    upsert?: Prisma.AssetUpsertWithWhereUniqueWithoutCollectionInput | Prisma.AssetUpsertWithWhereUniqueWithoutCollectionInput[];
    createMany?: Prisma.AssetCreateManyCollectionInputEnvelope;
    set?: Prisma.AssetWhereUniqueInput | Prisma.AssetWhereUniqueInput[];
    disconnect?: Prisma.AssetWhereUniqueInput | Prisma.AssetWhereUniqueInput[];
    delete?: Prisma.AssetWhereUniqueInput | Prisma.AssetWhereUniqueInput[];
    connect?: Prisma.AssetWhereUniqueInput | Prisma.AssetWhereUniqueInput[];
    update?: Prisma.AssetUpdateWithWhereUniqueWithoutCollectionInput | Prisma.AssetUpdateWithWhereUniqueWithoutCollectionInput[];
    updateMany?: Prisma.AssetUpdateManyWithWhereWithoutCollectionInput | Prisma.AssetUpdateManyWithWhereWithoutCollectionInput[];
    deleteMany?: Prisma.AssetScalarWhereInput | Prisma.AssetScalarWhereInput[];
};
export type EnumAssetTypeFieldUpdateOperationsInput = {
    set?: $Enums.AssetType;
};
export type FloatFieldUpdateOperationsInput = {
    set?: number;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
};
export type IntFieldUpdateOperationsInput = {
    set?: number;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
};
export type AssetCreateNestedOneWithoutHoldersInput = {
    create?: Prisma.XOR<Prisma.AssetCreateWithoutHoldersInput, Prisma.AssetUncheckedCreateWithoutHoldersInput>;
    connectOrCreate?: Prisma.AssetCreateOrConnectWithoutHoldersInput;
    connect?: Prisma.AssetWhereUniqueInput;
};
export type AssetUpdateOneRequiredWithoutHoldersNestedInput = {
    create?: Prisma.XOR<Prisma.AssetCreateWithoutHoldersInput, Prisma.AssetUncheckedCreateWithoutHoldersInput>;
    connectOrCreate?: Prisma.AssetCreateOrConnectWithoutHoldersInput;
    upsert?: Prisma.AssetUpsertWithoutHoldersInput;
    connect?: Prisma.AssetWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.AssetUpdateToOneWithWhereWithoutHoldersInput, Prisma.AssetUpdateWithoutHoldersInput>, Prisma.AssetUncheckedUpdateWithoutHoldersInput>;
};
export type AssetCreateWithoutTeamInput = {
    id?: string;
    name: string;
    assetType: $Enums.AssetType;
    mintAddress?: string | null;
    metadataUri?: string | null;
    basePrice: number;
    currentPrice: number;
    totalSupply: number;
    circulating: number;
    bondingCurveK: number;
    createdAt?: Date | string;
    collection?: Prisma.AssetCollectionCreateNestedOneWithoutAssetsInput;
    holders?: Prisma.UserAssetCreateNestedManyWithoutAssetInput;
};
export type AssetUncheckedCreateWithoutTeamInput = {
    id?: string;
    name: string;
    assetType: $Enums.AssetType;
    collectionId?: string | null;
    mintAddress?: string | null;
    metadataUri?: string | null;
    basePrice: number;
    currentPrice: number;
    totalSupply: number;
    circulating: number;
    bondingCurveK: number;
    createdAt?: Date | string;
    holders?: Prisma.UserAssetUncheckedCreateNestedManyWithoutAssetInput;
};
export type AssetCreateOrConnectWithoutTeamInput = {
    where: Prisma.AssetWhereUniqueInput;
    create: Prisma.XOR<Prisma.AssetCreateWithoutTeamInput, Prisma.AssetUncheckedCreateWithoutTeamInput>;
};
export type AssetCreateManyTeamInputEnvelope = {
    data: Prisma.AssetCreateManyTeamInput | Prisma.AssetCreateManyTeamInput[];
    skipDuplicates?: boolean;
};
export type AssetUpsertWithWhereUniqueWithoutTeamInput = {
    where: Prisma.AssetWhereUniqueInput;
    update: Prisma.XOR<Prisma.AssetUpdateWithoutTeamInput, Prisma.AssetUncheckedUpdateWithoutTeamInput>;
    create: Prisma.XOR<Prisma.AssetCreateWithoutTeamInput, Prisma.AssetUncheckedCreateWithoutTeamInput>;
};
export type AssetUpdateWithWhereUniqueWithoutTeamInput = {
    where: Prisma.AssetWhereUniqueInput;
    data: Prisma.XOR<Prisma.AssetUpdateWithoutTeamInput, Prisma.AssetUncheckedUpdateWithoutTeamInput>;
};
export type AssetUpdateManyWithWhereWithoutTeamInput = {
    where: Prisma.AssetScalarWhereInput;
    data: Prisma.XOR<Prisma.AssetUpdateManyMutationInput, Prisma.AssetUncheckedUpdateManyWithoutTeamInput>;
};
export type AssetScalarWhereInput = {
    AND?: Prisma.AssetScalarWhereInput | Prisma.AssetScalarWhereInput[];
    OR?: Prisma.AssetScalarWhereInput[];
    NOT?: Prisma.AssetScalarWhereInput | Prisma.AssetScalarWhereInput[];
    id?: Prisma.StringFilter<"Asset"> | string;
    name?: Prisma.StringFilter<"Asset"> | string;
    assetType?: Prisma.EnumAssetTypeFilter<"Asset"> | $Enums.AssetType;
    teamId?: Prisma.StringNullableFilter<"Asset"> | string | null;
    collectionId?: Prisma.StringNullableFilter<"Asset"> | string | null;
    mintAddress?: Prisma.StringNullableFilter<"Asset"> | string | null;
    metadataUri?: Prisma.StringNullableFilter<"Asset"> | string | null;
    basePrice?: Prisma.FloatFilter<"Asset"> | number;
    currentPrice?: Prisma.FloatFilter<"Asset"> | number;
    totalSupply?: Prisma.IntFilter<"Asset"> | number;
    circulating?: Prisma.IntFilter<"Asset"> | number;
    bondingCurveK?: Prisma.FloatFilter<"Asset"> | number;
    createdAt?: Prisma.DateTimeFilter<"Asset"> | Date | string;
};
export type AssetCreateWithoutCollectionInput = {
    id?: string;
    name: string;
    assetType: $Enums.AssetType;
    mintAddress?: string | null;
    metadataUri?: string | null;
    basePrice: number;
    currentPrice: number;
    totalSupply: number;
    circulating: number;
    bondingCurveK: number;
    createdAt?: Date | string;
    team?: Prisma.TeamCreateNestedOneWithoutAssetsInput;
    holders?: Prisma.UserAssetCreateNestedManyWithoutAssetInput;
};
export type AssetUncheckedCreateWithoutCollectionInput = {
    id?: string;
    name: string;
    assetType: $Enums.AssetType;
    teamId?: string | null;
    mintAddress?: string | null;
    metadataUri?: string | null;
    basePrice: number;
    currentPrice: number;
    totalSupply: number;
    circulating: number;
    bondingCurveK: number;
    createdAt?: Date | string;
    holders?: Prisma.UserAssetUncheckedCreateNestedManyWithoutAssetInput;
};
export type AssetCreateOrConnectWithoutCollectionInput = {
    where: Prisma.AssetWhereUniqueInput;
    create: Prisma.XOR<Prisma.AssetCreateWithoutCollectionInput, Prisma.AssetUncheckedCreateWithoutCollectionInput>;
};
export type AssetCreateManyCollectionInputEnvelope = {
    data: Prisma.AssetCreateManyCollectionInput | Prisma.AssetCreateManyCollectionInput[];
    skipDuplicates?: boolean;
};
export type AssetUpsertWithWhereUniqueWithoutCollectionInput = {
    where: Prisma.AssetWhereUniqueInput;
    update: Prisma.XOR<Prisma.AssetUpdateWithoutCollectionInput, Prisma.AssetUncheckedUpdateWithoutCollectionInput>;
    create: Prisma.XOR<Prisma.AssetCreateWithoutCollectionInput, Prisma.AssetUncheckedCreateWithoutCollectionInput>;
};
export type AssetUpdateWithWhereUniqueWithoutCollectionInput = {
    where: Prisma.AssetWhereUniqueInput;
    data: Prisma.XOR<Prisma.AssetUpdateWithoutCollectionInput, Prisma.AssetUncheckedUpdateWithoutCollectionInput>;
};
export type AssetUpdateManyWithWhereWithoutCollectionInput = {
    where: Prisma.AssetScalarWhereInput;
    data: Prisma.XOR<Prisma.AssetUpdateManyMutationInput, Prisma.AssetUncheckedUpdateManyWithoutCollectionInput>;
};
export type AssetCreateWithoutHoldersInput = {
    id?: string;
    name: string;
    assetType: $Enums.AssetType;
    mintAddress?: string | null;
    metadataUri?: string | null;
    basePrice: number;
    currentPrice: number;
    totalSupply: number;
    circulating: number;
    bondingCurveK: number;
    createdAt?: Date | string;
    team?: Prisma.TeamCreateNestedOneWithoutAssetsInput;
    collection?: Prisma.AssetCollectionCreateNestedOneWithoutAssetsInput;
};
export type AssetUncheckedCreateWithoutHoldersInput = {
    id?: string;
    name: string;
    assetType: $Enums.AssetType;
    teamId?: string | null;
    collectionId?: string | null;
    mintAddress?: string | null;
    metadataUri?: string | null;
    basePrice: number;
    currentPrice: number;
    totalSupply: number;
    circulating: number;
    bondingCurveK: number;
    createdAt?: Date | string;
};
export type AssetCreateOrConnectWithoutHoldersInput = {
    where: Prisma.AssetWhereUniqueInput;
    create: Prisma.XOR<Prisma.AssetCreateWithoutHoldersInput, Prisma.AssetUncheckedCreateWithoutHoldersInput>;
};
export type AssetUpsertWithoutHoldersInput = {
    update: Prisma.XOR<Prisma.AssetUpdateWithoutHoldersInput, Prisma.AssetUncheckedUpdateWithoutHoldersInput>;
    create: Prisma.XOR<Prisma.AssetCreateWithoutHoldersInput, Prisma.AssetUncheckedCreateWithoutHoldersInput>;
    where?: Prisma.AssetWhereInput;
};
export type AssetUpdateToOneWithWhereWithoutHoldersInput = {
    where?: Prisma.AssetWhereInput;
    data: Prisma.XOR<Prisma.AssetUpdateWithoutHoldersInput, Prisma.AssetUncheckedUpdateWithoutHoldersInput>;
};
export type AssetUpdateWithoutHoldersInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    assetType?: Prisma.EnumAssetTypeFieldUpdateOperationsInput | $Enums.AssetType;
    mintAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    metadataUri?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    basePrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    currentPrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    totalSupply?: Prisma.IntFieldUpdateOperationsInput | number;
    circulating?: Prisma.IntFieldUpdateOperationsInput | number;
    bondingCurveK?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    team?: Prisma.TeamUpdateOneWithoutAssetsNestedInput;
    collection?: Prisma.AssetCollectionUpdateOneWithoutAssetsNestedInput;
};
export type AssetUncheckedUpdateWithoutHoldersInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    assetType?: Prisma.EnumAssetTypeFieldUpdateOperationsInput | $Enums.AssetType;
    teamId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    collectionId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    mintAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    metadataUri?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    basePrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    currentPrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    totalSupply?: Prisma.IntFieldUpdateOperationsInput | number;
    circulating?: Prisma.IntFieldUpdateOperationsInput | number;
    bondingCurveK?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type AssetCreateManyTeamInput = {
    id?: string;
    name: string;
    assetType: $Enums.AssetType;
    collectionId?: string | null;
    mintAddress?: string | null;
    metadataUri?: string | null;
    basePrice: number;
    currentPrice: number;
    totalSupply: number;
    circulating: number;
    bondingCurveK: number;
    createdAt?: Date | string;
};
export type AssetUpdateWithoutTeamInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    assetType?: Prisma.EnumAssetTypeFieldUpdateOperationsInput | $Enums.AssetType;
    mintAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    metadataUri?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    basePrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    currentPrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    totalSupply?: Prisma.IntFieldUpdateOperationsInput | number;
    circulating?: Prisma.IntFieldUpdateOperationsInput | number;
    bondingCurveK?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    collection?: Prisma.AssetCollectionUpdateOneWithoutAssetsNestedInput;
    holders?: Prisma.UserAssetUpdateManyWithoutAssetNestedInput;
};
export type AssetUncheckedUpdateWithoutTeamInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    assetType?: Prisma.EnumAssetTypeFieldUpdateOperationsInput | $Enums.AssetType;
    collectionId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    mintAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    metadataUri?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    basePrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    currentPrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    totalSupply?: Prisma.IntFieldUpdateOperationsInput | number;
    circulating?: Prisma.IntFieldUpdateOperationsInput | number;
    bondingCurveK?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    holders?: Prisma.UserAssetUncheckedUpdateManyWithoutAssetNestedInput;
};
export type AssetUncheckedUpdateManyWithoutTeamInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    assetType?: Prisma.EnumAssetTypeFieldUpdateOperationsInput | $Enums.AssetType;
    collectionId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    mintAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    metadataUri?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    basePrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    currentPrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    totalSupply?: Prisma.IntFieldUpdateOperationsInput | number;
    circulating?: Prisma.IntFieldUpdateOperationsInput | number;
    bondingCurveK?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type AssetCreateManyCollectionInput = {
    id?: string;
    name: string;
    assetType: $Enums.AssetType;
    teamId?: string | null;
    mintAddress?: string | null;
    metadataUri?: string | null;
    basePrice: number;
    currentPrice: number;
    totalSupply: number;
    circulating: number;
    bondingCurveK: number;
    createdAt?: Date | string;
};
export type AssetUpdateWithoutCollectionInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    assetType?: Prisma.EnumAssetTypeFieldUpdateOperationsInput | $Enums.AssetType;
    mintAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    metadataUri?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    basePrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    currentPrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    totalSupply?: Prisma.IntFieldUpdateOperationsInput | number;
    circulating?: Prisma.IntFieldUpdateOperationsInput | number;
    bondingCurveK?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    team?: Prisma.TeamUpdateOneWithoutAssetsNestedInput;
    holders?: Prisma.UserAssetUpdateManyWithoutAssetNestedInput;
};
export type AssetUncheckedUpdateWithoutCollectionInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    assetType?: Prisma.EnumAssetTypeFieldUpdateOperationsInput | $Enums.AssetType;
    teamId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    mintAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    metadataUri?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    basePrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    currentPrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    totalSupply?: Prisma.IntFieldUpdateOperationsInput | number;
    circulating?: Prisma.IntFieldUpdateOperationsInput | number;
    bondingCurveK?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    holders?: Prisma.UserAssetUncheckedUpdateManyWithoutAssetNestedInput;
};
export type AssetUncheckedUpdateManyWithoutCollectionInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    assetType?: Prisma.EnumAssetTypeFieldUpdateOperationsInput | $Enums.AssetType;
    teamId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    mintAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    metadataUri?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    basePrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    currentPrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    totalSupply?: Prisma.IntFieldUpdateOperationsInput | number;
    circulating?: Prisma.IntFieldUpdateOperationsInput | number;
    bondingCurveK?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
/**
 * Count Type AssetCountOutputType
 */
export type AssetCountOutputType = {
    holders: number;
};
export type AssetCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    holders?: boolean | AssetCountOutputTypeCountHoldersArgs;
};
/**
 * AssetCountOutputType without action
 */
export type AssetCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetCountOutputType
     */
    select?: Prisma.AssetCountOutputTypeSelect<ExtArgs> | null;
};
/**
 * AssetCountOutputType without action
 */
export type AssetCountOutputTypeCountHoldersArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.UserAssetWhereInput;
};
export type AssetSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    assetType?: boolean;
    teamId?: boolean;
    collectionId?: boolean;
    mintAddress?: boolean;
    metadataUri?: boolean;
    basePrice?: boolean;
    currentPrice?: boolean;
    totalSupply?: boolean;
    circulating?: boolean;
    bondingCurveK?: boolean;
    createdAt?: boolean;
    team?: boolean | Prisma.Asset$teamArgs<ExtArgs>;
    collection?: boolean | Prisma.Asset$collectionArgs<ExtArgs>;
    holders?: boolean | Prisma.Asset$holdersArgs<ExtArgs>;
    _count?: boolean | Prisma.AssetCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["asset"]>;
export type AssetSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    assetType?: boolean;
    teamId?: boolean;
    collectionId?: boolean;
    mintAddress?: boolean;
    metadataUri?: boolean;
    basePrice?: boolean;
    currentPrice?: boolean;
    totalSupply?: boolean;
    circulating?: boolean;
    bondingCurveK?: boolean;
    createdAt?: boolean;
    team?: boolean | Prisma.Asset$teamArgs<ExtArgs>;
    collection?: boolean | Prisma.Asset$collectionArgs<ExtArgs>;
}, ExtArgs["result"]["asset"]>;
export type AssetSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    assetType?: boolean;
    teamId?: boolean;
    collectionId?: boolean;
    mintAddress?: boolean;
    metadataUri?: boolean;
    basePrice?: boolean;
    currentPrice?: boolean;
    totalSupply?: boolean;
    circulating?: boolean;
    bondingCurveK?: boolean;
    createdAt?: boolean;
    team?: boolean | Prisma.Asset$teamArgs<ExtArgs>;
    collection?: boolean | Prisma.Asset$collectionArgs<ExtArgs>;
}, ExtArgs["result"]["asset"]>;
export type AssetSelectScalar = {
    id?: boolean;
    name?: boolean;
    assetType?: boolean;
    teamId?: boolean;
    collectionId?: boolean;
    mintAddress?: boolean;
    metadataUri?: boolean;
    basePrice?: boolean;
    currentPrice?: boolean;
    totalSupply?: boolean;
    circulating?: boolean;
    bondingCurveK?: boolean;
    createdAt?: boolean;
};
export type AssetOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "name" | "assetType" | "teamId" | "collectionId" | "mintAddress" | "metadataUri" | "basePrice" | "currentPrice" | "totalSupply" | "circulating" | "bondingCurveK" | "createdAt", ExtArgs["result"]["asset"]>;
export type AssetInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    team?: boolean | Prisma.Asset$teamArgs<ExtArgs>;
    collection?: boolean | Prisma.Asset$collectionArgs<ExtArgs>;
    holders?: boolean | Prisma.Asset$holdersArgs<ExtArgs>;
    _count?: boolean | Prisma.AssetCountOutputTypeDefaultArgs<ExtArgs>;
};
export type AssetIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    team?: boolean | Prisma.Asset$teamArgs<ExtArgs>;
    collection?: boolean | Prisma.Asset$collectionArgs<ExtArgs>;
};
export type AssetIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    team?: boolean | Prisma.Asset$teamArgs<ExtArgs>;
    collection?: boolean | Prisma.Asset$collectionArgs<ExtArgs>;
};
export type $AssetPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Asset";
    objects: {
        team: Prisma.$TeamPayload<ExtArgs> | null;
        collection: Prisma.$AssetCollectionPayload<ExtArgs> | null;
        holders: Prisma.$UserAssetPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        name: string;
        assetType: $Enums.AssetType;
        teamId: string | null;
        collectionId: string | null;
        mintAddress: string | null;
        metadataUri: string | null;
        basePrice: number;
        currentPrice: number;
        totalSupply: number;
        circulating: number;
        bondingCurveK: number;
        createdAt: Date;
    }, ExtArgs["result"]["asset"]>;
    composites: {};
};
export type AssetGetPayload<S extends boolean | null | undefined | AssetDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$AssetPayload, S>;
export type AssetCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<AssetFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: AssetCountAggregateInputType | true;
};
export interface AssetDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Asset'];
        meta: {
            name: 'Asset';
        };
    };
    /**
     * Find zero or one Asset that matches the filter.
     * @param {AssetFindUniqueArgs} args - Arguments to find a Asset
     * @example
     * // Get one Asset
     * const asset = await prisma.asset.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AssetFindUniqueArgs>(args: Prisma.SelectSubset<T, AssetFindUniqueArgs<ExtArgs>>): Prisma.Prisma__AssetClient<runtime.Types.Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one Asset that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AssetFindUniqueOrThrowArgs} args - Arguments to find a Asset
     * @example
     * // Get one Asset
     * const asset = await prisma.asset.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AssetFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, AssetFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__AssetClient<runtime.Types.Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first Asset that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetFindFirstArgs} args - Arguments to find a Asset
     * @example
     * // Get one Asset
     * const asset = await prisma.asset.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AssetFindFirstArgs>(args?: Prisma.SelectSubset<T, AssetFindFirstArgs<ExtArgs>>): Prisma.Prisma__AssetClient<runtime.Types.Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first Asset that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetFindFirstOrThrowArgs} args - Arguments to find a Asset
     * @example
     * // Get one Asset
     * const asset = await prisma.asset.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AssetFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, AssetFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__AssetClient<runtime.Types.Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more Assets that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Assets
     * const assets = await prisma.asset.findMany()
     *
     * // Get first 10 Assets
     * const assets = await prisma.asset.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const assetWithIdOnly = await prisma.asset.findMany({ select: { id: true } })
     *
     */
    findMany<T extends AssetFindManyArgs>(args?: Prisma.SelectSubset<T, AssetFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a Asset.
     * @param {AssetCreateArgs} args - Arguments to create a Asset.
     * @example
     * // Create one Asset
     * const Asset = await prisma.asset.create({
     *   data: {
     *     // ... data to create a Asset
     *   }
     * })
     *
     */
    create<T extends AssetCreateArgs>(args: Prisma.SelectSubset<T, AssetCreateArgs<ExtArgs>>): Prisma.Prisma__AssetClient<runtime.Types.Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many Assets.
     * @param {AssetCreateManyArgs} args - Arguments to create many Assets.
     * @example
     * // Create many Assets
     * const asset = await prisma.asset.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends AssetCreateManyArgs>(args?: Prisma.SelectSubset<T, AssetCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many Assets and returns the data saved in the database.
     * @param {AssetCreateManyAndReturnArgs} args - Arguments to create many Assets.
     * @example
     * // Create many Assets
     * const asset = await prisma.asset.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Assets and only return the `id`
     * const assetWithIdOnly = await prisma.asset.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends AssetCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, AssetCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a Asset.
     * @param {AssetDeleteArgs} args - Arguments to delete one Asset.
     * @example
     * // Delete one Asset
     * const Asset = await prisma.asset.delete({
     *   where: {
     *     // ... filter to delete one Asset
     *   }
     * })
     *
     */
    delete<T extends AssetDeleteArgs>(args: Prisma.SelectSubset<T, AssetDeleteArgs<ExtArgs>>): Prisma.Prisma__AssetClient<runtime.Types.Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one Asset.
     * @param {AssetUpdateArgs} args - Arguments to update one Asset.
     * @example
     * // Update one Asset
     * const asset = await prisma.asset.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends AssetUpdateArgs>(args: Prisma.SelectSubset<T, AssetUpdateArgs<ExtArgs>>): Prisma.Prisma__AssetClient<runtime.Types.Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more Assets.
     * @param {AssetDeleteManyArgs} args - Arguments to filter Assets to delete.
     * @example
     * // Delete a few Assets
     * const { count } = await prisma.asset.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends AssetDeleteManyArgs>(args?: Prisma.SelectSubset<T, AssetDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more Assets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Assets
     * const asset = await prisma.asset.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends AssetUpdateManyArgs>(args: Prisma.SelectSubset<T, AssetUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more Assets and returns the data updated in the database.
     * @param {AssetUpdateManyAndReturnArgs} args - Arguments to update many Assets.
     * @example
     * // Update many Assets
     * const asset = await prisma.asset.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more Assets and only return the `id`
     * const assetWithIdOnly = await prisma.asset.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends AssetUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, AssetUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one Asset.
     * @param {AssetUpsertArgs} args - Arguments to update or create a Asset.
     * @example
     * // Update or create a Asset
     * const asset = await prisma.asset.upsert({
     *   create: {
     *     // ... data to create a Asset
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Asset we want to update
     *   }
     * })
     */
    upsert<T extends AssetUpsertArgs>(args: Prisma.SelectSubset<T, AssetUpsertArgs<ExtArgs>>): Prisma.Prisma__AssetClient<runtime.Types.Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of Assets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetCountArgs} args - Arguments to filter Assets to count.
     * @example
     * // Count the number of Assets
     * const count = await prisma.asset.count({
     *   where: {
     *     // ... the filter for the Assets we want to count
     *   }
     * })
    **/
    count<T extends AssetCountArgs>(args?: Prisma.Subset<T, AssetCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], AssetCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a Asset.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AssetAggregateArgs>(args: Prisma.Subset<T, AssetAggregateArgs>): Prisma.PrismaPromise<GetAssetAggregateType<T>>;
    /**
     * Group by Asset.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
    **/
    groupBy<T extends AssetGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: AssetGroupByArgs['orderBy'];
    } : {
        orderBy?: AssetGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, AssetGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAssetGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the Asset model
     */
    readonly fields: AssetFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for Asset.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__AssetClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    team<T extends Prisma.Asset$teamArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Asset$teamArgs<ExtArgs>>): Prisma.Prisma__TeamClient<runtime.Types.Result.GetResult<Prisma.$TeamPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    collection<T extends Prisma.Asset$collectionArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Asset$collectionArgs<ExtArgs>>): Prisma.Prisma__AssetCollectionClient<runtime.Types.Result.GetResult<Prisma.$AssetCollectionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    holders<T extends Prisma.Asset$holdersArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Asset$holdersArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UserAssetPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
/**
 * Fields of the Asset model
 */
export interface AssetFieldRefs {
    readonly id: Prisma.FieldRef<"Asset", 'String'>;
    readonly name: Prisma.FieldRef<"Asset", 'String'>;
    readonly assetType: Prisma.FieldRef<"Asset", 'AssetType'>;
    readonly teamId: Prisma.FieldRef<"Asset", 'String'>;
    readonly collectionId: Prisma.FieldRef<"Asset", 'String'>;
    readonly mintAddress: Prisma.FieldRef<"Asset", 'String'>;
    readonly metadataUri: Prisma.FieldRef<"Asset", 'String'>;
    readonly basePrice: Prisma.FieldRef<"Asset", 'Float'>;
    readonly currentPrice: Prisma.FieldRef<"Asset", 'Float'>;
    readonly totalSupply: Prisma.FieldRef<"Asset", 'Int'>;
    readonly circulating: Prisma.FieldRef<"Asset", 'Int'>;
    readonly bondingCurveK: Prisma.FieldRef<"Asset", 'Float'>;
    readonly createdAt: Prisma.FieldRef<"Asset", 'DateTime'>;
}
/**
 * Asset findUnique
 */
export type AssetFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: Prisma.AssetSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Asset
     */
    omit?: Prisma.AssetOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.AssetInclude<ExtArgs> | null;
    /**
     * Filter, which Asset to fetch.
     */
    where: Prisma.AssetWhereUniqueInput;
};
/**
 * Asset findUniqueOrThrow
 */
export type AssetFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: Prisma.AssetSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Asset
     */
    omit?: Prisma.AssetOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.AssetInclude<ExtArgs> | null;
    /**
     * Filter, which Asset to fetch.
     */
    where: Prisma.AssetWhereUniqueInput;
};
/**
 * Asset findFirst
 */
export type AssetFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: Prisma.AssetSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Asset
     */
    omit?: Prisma.AssetOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.AssetInclude<ExtArgs> | null;
    /**
     * Filter, which Asset to fetch.
     */
    where?: Prisma.AssetWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Assets to fetch.
     */
    orderBy?: Prisma.AssetOrderByWithRelationInput | Prisma.AssetOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Assets.
     */
    cursor?: Prisma.AssetWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Assets from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Assets.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Assets.
     */
    distinct?: Prisma.AssetScalarFieldEnum | Prisma.AssetScalarFieldEnum[];
};
/**
 * Asset findFirstOrThrow
 */
export type AssetFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: Prisma.AssetSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Asset
     */
    omit?: Prisma.AssetOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.AssetInclude<ExtArgs> | null;
    /**
     * Filter, which Asset to fetch.
     */
    where?: Prisma.AssetWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Assets to fetch.
     */
    orderBy?: Prisma.AssetOrderByWithRelationInput | Prisma.AssetOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Assets.
     */
    cursor?: Prisma.AssetWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Assets from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Assets.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Assets.
     */
    distinct?: Prisma.AssetScalarFieldEnum | Prisma.AssetScalarFieldEnum[];
};
/**
 * Asset findMany
 */
export type AssetFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: Prisma.AssetSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Asset
     */
    omit?: Prisma.AssetOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.AssetInclude<ExtArgs> | null;
    /**
     * Filter, which Assets to fetch.
     */
    where?: Prisma.AssetWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Assets to fetch.
     */
    orderBy?: Prisma.AssetOrderByWithRelationInput | Prisma.AssetOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Assets.
     */
    cursor?: Prisma.AssetWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Assets from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Assets.
     */
    skip?: number;
    distinct?: Prisma.AssetScalarFieldEnum | Prisma.AssetScalarFieldEnum[];
};
/**
 * Asset create
 */
export type AssetCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: Prisma.AssetSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Asset
     */
    omit?: Prisma.AssetOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.AssetInclude<ExtArgs> | null;
    /**
     * The data needed to create a Asset.
     */
    data: Prisma.XOR<Prisma.AssetCreateInput, Prisma.AssetUncheckedCreateInput>;
};
/**
 * Asset createMany
 */
export type AssetCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many Assets.
     */
    data: Prisma.AssetCreateManyInput | Prisma.AssetCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * Asset createManyAndReturn
 */
export type AssetCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: Prisma.AssetSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Asset
     */
    omit?: Prisma.AssetOmit<ExtArgs> | null;
    /**
     * The data used to create many Assets.
     */
    data: Prisma.AssetCreateManyInput | Prisma.AssetCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.AssetIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * Asset update
 */
export type AssetUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: Prisma.AssetSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Asset
     */
    omit?: Prisma.AssetOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.AssetInclude<ExtArgs> | null;
    /**
     * The data needed to update a Asset.
     */
    data: Prisma.XOR<Prisma.AssetUpdateInput, Prisma.AssetUncheckedUpdateInput>;
    /**
     * Choose, which Asset to update.
     */
    where: Prisma.AssetWhereUniqueInput;
};
/**
 * Asset updateMany
 */
export type AssetUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update Assets.
     */
    data: Prisma.XOR<Prisma.AssetUpdateManyMutationInput, Prisma.AssetUncheckedUpdateManyInput>;
    /**
     * Filter which Assets to update
     */
    where?: Prisma.AssetWhereInput;
    /**
     * Limit how many Assets to update.
     */
    limit?: number;
};
/**
 * Asset updateManyAndReturn
 */
export type AssetUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: Prisma.AssetSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Asset
     */
    omit?: Prisma.AssetOmit<ExtArgs> | null;
    /**
     * The data used to update Assets.
     */
    data: Prisma.XOR<Prisma.AssetUpdateManyMutationInput, Prisma.AssetUncheckedUpdateManyInput>;
    /**
     * Filter which Assets to update
     */
    where?: Prisma.AssetWhereInput;
    /**
     * Limit how many Assets to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.AssetIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * Asset upsert
 */
export type AssetUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: Prisma.AssetSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Asset
     */
    omit?: Prisma.AssetOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.AssetInclude<ExtArgs> | null;
    /**
     * The filter to search for the Asset to update in case it exists.
     */
    where: Prisma.AssetWhereUniqueInput;
    /**
     * In case the Asset found by the `where` argument doesn't exist, create a new Asset with this data.
     */
    create: Prisma.XOR<Prisma.AssetCreateInput, Prisma.AssetUncheckedCreateInput>;
    /**
     * In case the Asset was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.AssetUpdateInput, Prisma.AssetUncheckedUpdateInput>;
};
/**
 * Asset delete
 */
export type AssetDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: Prisma.AssetSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Asset
     */
    omit?: Prisma.AssetOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.AssetInclude<ExtArgs> | null;
    /**
     * Filter which Asset to delete.
     */
    where: Prisma.AssetWhereUniqueInput;
};
/**
 * Asset deleteMany
 */
export type AssetDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which Assets to delete
     */
    where?: Prisma.AssetWhereInput;
    /**
     * Limit how many Assets to delete.
     */
    limit?: number;
};
/**
 * Asset.team
 */
export type Asset$teamArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Team
     */
    select?: Prisma.TeamSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Team
     */
    omit?: Prisma.TeamOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.TeamInclude<ExtArgs> | null;
    where?: Prisma.TeamWhereInput;
};
/**
 * Asset.collection
 */
export type Asset$collectionArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetCollection
     */
    select?: Prisma.AssetCollectionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AssetCollection
     */
    omit?: Prisma.AssetCollectionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.AssetCollectionInclude<ExtArgs> | null;
    where?: Prisma.AssetCollectionWhereInput;
};
/**
 * Asset.holders
 */
export type Asset$holdersArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserAsset
     */
    select?: Prisma.UserAssetSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the UserAsset
     */
    omit?: Prisma.UserAssetOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.UserAssetInclude<ExtArgs> | null;
    where?: Prisma.UserAssetWhereInput;
    orderBy?: Prisma.UserAssetOrderByWithRelationInput | Prisma.UserAssetOrderByWithRelationInput[];
    cursor?: Prisma.UserAssetWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.UserAssetScalarFieldEnum | Prisma.UserAssetScalarFieldEnum[];
};
/**
 * Asset without action
 */
export type AssetDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: Prisma.AssetSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Asset
     */
    omit?: Prisma.AssetOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.AssetInclude<ExtArgs> | null;
};
export {};
//# sourceMappingURL=Asset.d.ts.map