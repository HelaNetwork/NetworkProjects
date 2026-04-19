import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model UserAsset
 *
 */
export type UserAssetModel = runtime.Types.Result.DefaultSelection<Prisma.$UserAssetPayload>;
export type AggregateUserAsset = {
    _count: UserAssetCountAggregateOutputType | null;
    _avg: UserAssetAvgAggregateOutputType | null;
    _sum: UserAssetSumAggregateOutputType | null;
    _min: UserAssetMinAggregateOutputType | null;
    _max: UserAssetMaxAggregateOutputType | null;
};
export type UserAssetAvgAggregateOutputType = {
    quantity: number | null;
    avgPrice: number | null;
};
export type UserAssetSumAggregateOutputType = {
    quantity: number | null;
    avgPrice: number | null;
};
export type UserAssetMinAggregateOutputType = {
    id: string | null;
    userId: string | null;
    assetId: string | null;
    quantity: number | null;
    avgPrice: number | null;
    createdAt: Date | null;
};
export type UserAssetMaxAggregateOutputType = {
    id: string | null;
    userId: string | null;
    assetId: string | null;
    quantity: number | null;
    avgPrice: number | null;
    createdAt: Date | null;
};
export type UserAssetCountAggregateOutputType = {
    id: number;
    userId: number;
    assetId: number;
    quantity: number;
    avgPrice: number;
    createdAt: number;
    _all: number;
};
export type UserAssetAvgAggregateInputType = {
    quantity?: true;
    avgPrice?: true;
};
export type UserAssetSumAggregateInputType = {
    quantity?: true;
    avgPrice?: true;
};
export type UserAssetMinAggregateInputType = {
    id?: true;
    userId?: true;
    assetId?: true;
    quantity?: true;
    avgPrice?: true;
    createdAt?: true;
};
export type UserAssetMaxAggregateInputType = {
    id?: true;
    userId?: true;
    assetId?: true;
    quantity?: true;
    avgPrice?: true;
    createdAt?: true;
};
export type UserAssetCountAggregateInputType = {
    id?: true;
    userId?: true;
    assetId?: true;
    quantity?: true;
    avgPrice?: true;
    createdAt?: true;
    _all?: true;
};
export type UserAssetAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which UserAsset to aggregate.
     */
    where?: Prisma.UserAssetWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of UserAssets to fetch.
     */
    orderBy?: Prisma.UserAssetOrderByWithRelationInput | Prisma.UserAssetOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.UserAssetWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` UserAssets from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` UserAssets.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned UserAssets
    **/
    _count?: true | UserAssetCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: UserAssetAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: UserAssetSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: UserAssetMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: UserAssetMaxAggregateInputType;
};
export type GetUserAssetAggregateType<T extends UserAssetAggregateArgs> = {
    [P in keyof T & keyof AggregateUserAsset]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateUserAsset[P]> : Prisma.GetScalarType<T[P], AggregateUserAsset[P]>;
};
export type UserAssetGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.UserAssetWhereInput;
    orderBy?: Prisma.UserAssetOrderByWithAggregationInput | Prisma.UserAssetOrderByWithAggregationInput[];
    by: Prisma.UserAssetScalarFieldEnum[] | Prisma.UserAssetScalarFieldEnum;
    having?: Prisma.UserAssetScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: UserAssetCountAggregateInputType | true;
    _avg?: UserAssetAvgAggregateInputType;
    _sum?: UserAssetSumAggregateInputType;
    _min?: UserAssetMinAggregateInputType;
    _max?: UserAssetMaxAggregateInputType;
};
export type UserAssetGroupByOutputType = {
    id: string;
    userId: string;
    assetId: string;
    quantity: number;
    avgPrice: number;
    createdAt: Date;
    _count: UserAssetCountAggregateOutputType | null;
    _avg: UserAssetAvgAggregateOutputType | null;
    _sum: UserAssetSumAggregateOutputType | null;
    _min: UserAssetMinAggregateOutputType | null;
    _max: UserAssetMaxAggregateOutputType | null;
};
type GetUserAssetGroupByPayload<T extends UserAssetGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<UserAssetGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof UserAssetGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], UserAssetGroupByOutputType[P]> : Prisma.GetScalarType<T[P], UserAssetGroupByOutputType[P]>;
}>>;
export type UserAssetWhereInput = {
    AND?: Prisma.UserAssetWhereInput | Prisma.UserAssetWhereInput[];
    OR?: Prisma.UserAssetWhereInput[];
    NOT?: Prisma.UserAssetWhereInput | Prisma.UserAssetWhereInput[];
    id?: Prisma.StringFilter<"UserAsset"> | string;
    userId?: Prisma.StringFilter<"UserAsset"> | string;
    assetId?: Prisma.StringFilter<"UserAsset"> | string;
    quantity?: Prisma.IntFilter<"UserAsset"> | number;
    avgPrice?: Prisma.FloatFilter<"UserAsset"> | number;
    createdAt?: Prisma.DateTimeFilter<"UserAsset"> | Date | string;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    asset?: Prisma.XOR<Prisma.AssetScalarRelationFilter, Prisma.AssetWhereInput>;
};
export type UserAssetOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    assetId?: Prisma.SortOrder;
    quantity?: Prisma.SortOrder;
    avgPrice?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    user?: Prisma.UserOrderByWithRelationInput;
    asset?: Prisma.AssetOrderByWithRelationInput;
};
export type UserAssetWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    userId_assetId?: Prisma.UserAssetUserIdAssetIdCompoundUniqueInput;
    AND?: Prisma.UserAssetWhereInput | Prisma.UserAssetWhereInput[];
    OR?: Prisma.UserAssetWhereInput[];
    NOT?: Prisma.UserAssetWhereInput | Prisma.UserAssetWhereInput[];
    userId?: Prisma.StringFilter<"UserAsset"> | string;
    assetId?: Prisma.StringFilter<"UserAsset"> | string;
    quantity?: Prisma.IntFilter<"UserAsset"> | number;
    avgPrice?: Prisma.FloatFilter<"UserAsset"> | number;
    createdAt?: Prisma.DateTimeFilter<"UserAsset"> | Date | string;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    asset?: Prisma.XOR<Prisma.AssetScalarRelationFilter, Prisma.AssetWhereInput>;
}, "id" | "userId_assetId">;
export type UserAssetOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    assetId?: Prisma.SortOrder;
    quantity?: Prisma.SortOrder;
    avgPrice?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    _count?: Prisma.UserAssetCountOrderByAggregateInput;
    _avg?: Prisma.UserAssetAvgOrderByAggregateInput;
    _max?: Prisma.UserAssetMaxOrderByAggregateInput;
    _min?: Prisma.UserAssetMinOrderByAggregateInput;
    _sum?: Prisma.UserAssetSumOrderByAggregateInput;
};
export type UserAssetScalarWhereWithAggregatesInput = {
    AND?: Prisma.UserAssetScalarWhereWithAggregatesInput | Prisma.UserAssetScalarWhereWithAggregatesInput[];
    OR?: Prisma.UserAssetScalarWhereWithAggregatesInput[];
    NOT?: Prisma.UserAssetScalarWhereWithAggregatesInput | Prisma.UserAssetScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"UserAsset"> | string;
    userId?: Prisma.StringWithAggregatesFilter<"UserAsset"> | string;
    assetId?: Prisma.StringWithAggregatesFilter<"UserAsset"> | string;
    quantity?: Prisma.IntWithAggregatesFilter<"UserAsset"> | number;
    avgPrice?: Prisma.FloatWithAggregatesFilter<"UserAsset"> | number;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"UserAsset"> | Date | string;
};
export type UserAssetCreateInput = {
    id?: string;
    quantity: number;
    avgPrice: number;
    createdAt?: Date | string;
    user: Prisma.UserCreateNestedOneWithoutAssetsInput;
    asset: Prisma.AssetCreateNestedOneWithoutHoldersInput;
};
export type UserAssetUncheckedCreateInput = {
    id?: string;
    userId: string;
    assetId: string;
    quantity: number;
    avgPrice: number;
    createdAt?: Date | string;
};
export type UserAssetUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    avgPrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneRequiredWithoutAssetsNestedInput;
    asset?: Prisma.AssetUpdateOneRequiredWithoutHoldersNestedInput;
};
export type UserAssetUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    assetId?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    avgPrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type UserAssetCreateManyInput = {
    id?: string;
    userId: string;
    assetId: string;
    quantity: number;
    avgPrice: number;
    createdAt?: Date | string;
};
export type UserAssetUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    avgPrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type UserAssetUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    assetId?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    avgPrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type UserAssetListRelationFilter = {
    every?: Prisma.UserAssetWhereInput;
    some?: Prisma.UserAssetWhereInput;
    none?: Prisma.UserAssetWhereInput;
};
export type UserAssetOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type UserAssetUserIdAssetIdCompoundUniqueInput = {
    userId: string;
    assetId: string;
};
export type UserAssetCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    assetId?: Prisma.SortOrder;
    quantity?: Prisma.SortOrder;
    avgPrice?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type UserAssetAvgOrderByAggregateInput = {
    quantity?: Prisma.SortOrder;
    avgPrice?: Prisma.SortOrder;
};
export type UserAssetMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    assetId?: Prisma.SortOrder;
    quantity?: Prisma.SortOrder;
    avgPrice?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type UserAssetMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    assetId?: Prisma.SortOrder;
    quantity?: Prisma.SortOrder;
    avgPrice?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type UserAssetSumOrderByAggregateInput = {
    quantity?: Prisma.SortOrder;
    avgPrice?: Prisma.SortOrder;
};
export type UserAssetCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.UserAssetCreateWithoutUserInput, Prisma.UserAssetUncheckedCreateWithoutUserInput> | Prisma.UserAssetCreateWithoutUserInput[] | Prisma.UserAssetUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.UserAssetCreateOrConnectWithoutUserInput | Prisma.UserAssetCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.UserAssetCreateManyUserInputEnvelope;
    connect?: Prisma.UserAssetWhereUniqueInput | Prisma.UserAssetWhereUniqueInput[];
};
export type UserAssetUncheckedCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.UserAssetCreateWithoutUserInput, Prisma.UserAssetUncheckedCreateWithoutUserInput> | Prisma.UserAssetCreateWithoutUserInput[] | Prisma.UserAssetUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.UserAssetCreateOrConnectWithoutUserInput | Prisma.UserAssetCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.UserAssetCreateManyUserInputEnvelope;
    connect?: Prisma.UserAssetWhereUniqueInput | Prisma.UserAssetWhereUniqueInput[];
};
export type UserAssetUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.UserAssetCreateWithoutUserInput, Prisma.UserAssetUncheckedCreateWithoutUserInput> | Prisma.UserAssetCreateWithoutUserInput[] | Prisma.UserAssetUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.UserAssetCreateOrConnectWithoutUserInput | Prisma.UserAssetCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.UserAssetUpsertWithWhereUniqueWithoutUserInput | Prisma.UserAssetUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.UserAssetCreateManyUserInputEnvelope;
    set?: Prisma.UserAssetWhereUniqueInput | Prisma.UserAssetWhereUniqueInput[];
    disconnect?: Prisma.UserAssetWhereUniqueInput | Prisma.UserAssetWhereUniqueInput[];
    delete?: Prisma.UserAssetWhereUniqueInput | Prisma.UserAssetWhereUniqueInput[];
    connect?: Prisma.UserAssetWhereUniqueInput | Prisma.UserAssetWhereUniqueInput[];
    update?: Prisma.UserAssetUpdateWithWhereUniqueWithoutUserInput | Prisma.UserAssetUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.UserAssetUpdateManyWithWhereWithoutUserInput | Prisma.UserAssetUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.UserAssetScalarWhereInput | Prisma.UserAssetScalarWhereInput[];
};
export type UserAssetUncheckedUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.UserAssetCreateWithoutUserInput, Prisma.UserAssetUncheckedCreateWithoutUserInput> | Prisma.UserAssetCreateWithoutUserInput[] | Prisma.UserAssetUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.UserAssetCreateOrConnectWithoutUserInput | Prisma.UserAssetCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.UserAssetUpsertWithWhereUniqueWithoutUserInput | Prisma.UserAssetUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.UserAssetCreateManyUserInputEnvelope;
    set?: Prisma.UserAssetWhereUniqueInput | Prisma.UserAssetWhereUniqueInput[];
    disconnect?: Prisma.UserAssetWhereUniqueInput | Prisma.UserAssetWhereUniqueInput[];
    delete?: Prisma.UserAssetWhereUniqueInput | Prisma.UserAssetWhereUniqueInput[];
    connect?: Prisma.UserAssetWhereUniqueInput | Prisma.UserAssetWhereUniqueInput[];
    update?: Prisma.UserAssetUpdateWithWhereUniqueWithoutUserInput | Prisma.UserAssetUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.UserAssetUpdateManyWithWhereWithoutUserInput | Prisma.UserAssetUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.UserAssetScalarWhereInput | Prisma.UserAssetScalarWhereInput[];
};
export type UserAssetCreateNestedManyWithoutAssetInput = {
    create?: Prisma.XOR<Prisma.UserAssetCreateWithoutAssetInput, Prisma.UserAssetUncheckedCreateWithoutAssetInput> | Prisma.UserAssetCreateWithoutAssetInput[] | Prisma.UserAssetUncheckedCreateWithoutAssetInput[];
    connectOrCreate?: Prisma.UserAssetCreateOrConnectWithoutAssetInput | Prisma.UserAssetCreateOrConnectWithoutAssetInput[];
    createMany?: Prisma.UserAssetCreateManyAssetInputEnvelope;
    connect?: Prisma.UserAssetWhereUniqueInput | Prisma.UserAssetWhereUniqueInput[];
};
export type UserAssetUncheckedCreateNestedManyWithoutAssetInput = {
    create?: Prisma.XOR<Prisma.UserAssetCreateWithoutAssetInput, Prisma.UserAssetUncheckedCreateWithoutAssetInput> | Prisma.UserAssetCreateWithoutAssetInput[] | Prisma.UserAssetUncheckedCreateWithoutAssetInput[];
    connectOrCreate?: Prisma.UserAssetCreateOrConnectWithoutAssetInput | Prisma.UserAssetCreateOrConnectWithoutAssetInput[];
    createMany?: Prisma.UserAssetCreateManyAssetInputEnvelope;
    connect?: Prisma.UserAssetWhereUniqueInput | Prisma.UserAssetWhereUniqueInput[];
};
export type UserAssetUpdateManyWithoutAssetNestedInput = {
    create?: Prisma.XOR<Prisma.UserAssetCreateWithoutAssetInput, Prisma.UserAssetUncheckedCreateWithoutAssetInput> | Prisma.UserAssetCreateWithoutAssetInput[] | Prisma.UserAssetUncheckedCreateWithoutAssetInput[];
    connectOrCreate?: Prisma.UserAssetCreateOrConnectWithoutAssetInput | Prisma.UserAssetCreateOrConnectWithoutAssetInput[];
    upsert?: Prisma.UserAssetUpsertWithWhereUniqueWithoutAssetInput | Prisma.UserAssetUpsertWithWhereUniqueWithoutAssetInput[];
    createMany?: Prisma.UserAssetCreateManyAssetInputEnvelope;
    set?: Prisma.UserAssetWhereUniqueInput | Prisma.UserAssetWhereUniqueInput[];
    disconnect?: Prisma.UserAssetWhereUniqueInput | Prisma.UserAssetWhereUniqueInput[];
    delete?: Prisma.UserAssetWhereUniqueInput | Prisma.UserAssetWhereUniqueInput[];
    connect?: Prisma.UserAssetWhereUniqueInput | Prisma.UserAssetWhereUniqueInput[];
    update?: Prisma.UserAssetUpdateWithWhereUniqueWithoutAssetInput | Prisma.UserAssetUpdateWithWhereUniqueWithoutAssetInput[];
    updateMany?: Prisma.UserAssetUpdateManyWithWhereWithoutAssetInput | Prisma.UserAssetUpdateManyWithWhereWithoutAssetInput[];
    deleteMany?: Prisma.UserAssetScalarWhereInput | Prisma.UserAssetScalarWhereInput[];
};
export type UserAssetUncheckedUpdateManyWithoutAssetNestedInput = {
    create?: Prisma.XOR<Prisma.UserAssetCreateWithoutAssetInput, Prisma.UserAssetUncheckedCreateWithoutAssetInput> | Prisma.UserAssetCreateWithoutAssetInput[] | Prisma.UserAssetUncheckedCreateWithoutAssetInput[];
    connectOrCreate?: Prisma.UserAssetCreateOrConnectWithoutAssetInput | Prisma.UserAssetCreateOrConnectWithoutAssetInput[];
    upsert?: Prisma.UserAssetUpsertWithWhereUniqueWithoutAssetInput | Prisma.UserAssetUpsertWithWhereUniqueWithoutAssetInput[];
    createMany?: Prisma.UserAssetCreateManyAssetInputEnvelope;
    set?: Prisma.UserAssetWhereUniqueInput | Prisma.UserAssetWhereUniqueInput[];
    disconnect?: Prisma.UserAssetWhereUniqueInput | Prisma.UserAssetWhereUniqueInput[];
    delete?: Prisma.UserAssetWhereUniqueInput | Prisma.UserAssetWhereUniqueInput[];
    connect?: Prisma.UserAssetWhereUniqueInput | Prisma.UserAssetWhereUniqueInput[];
    update?: Prisma.UserAssetUpdateWithWhereUniqueWithoutAssetInput | Prisma.UserAssetUpdateWithWhereUniqueWithoutAssetInput[];
    updateMany?: Prisma.UserAssetUpdateManyWithWhereWithoutAssetInput | Prisma.UserAssetUpdateManyWithWhereWithoutAssetInput[];
    deleteMany?: Prisma.UserAssetScalarWhereInput | Prisma.UserAssetScalarWhereInput[];
};
export type UserAssetCreateWithoutUserInput = {
    id?: string;
    quantity: number;
    avgPrice: number;
    createdAt?: Date | string;
    asset: Prisma.AssetCreateNestedOneWithoutHoldersInput;
};
export type UserAssetUncheckedCreateWithoutUserInput = {
    id?: string;
    assetId: string;
    quantity: number;
    avgPrice: number;
    createdAt?: Date | string;
};
export type UserAssetCreateOrConnectWithoutUserInput = {
    where: Prisma.UserAssetWhereUniqueInput;
    create: Prisma.XOR<Prisma.UserAssetCreateWithoutUserInput, Prisma.UserAssetUncheckedCreateWithoutUserInput>;
};
export type UserAssetCreateManyUserInputEnvelope = {
    data: Prisma.UserAssetCreateManyUserInput | Prisma.UserAssetCreateManyUserInput[];
    skipDuplicates?: boolean;
};
export type UserAssetUpsertWithWhereUniqueWithoutUserInput = {
    where: Prisma.UserAssetWhereUniqueInput;
    update: Prisma.XOR<Prisma.UserAssetUpdateWithoutUserInput, Prisma.UserAssetUncheckedUpdateWithoutUserInput>;
    create: Prisma.XOR<Prisma.UserAssetCreateWithoutUserInput, Prisma.UserAssetUncheckedCreateWithoutUserInput>;
};
export type UserAssetUpdateWithWhereUniqueWithoutUserInput = {
    where: Prisma.UserAssetWhereUniqueInput;
    data: Prisma.XOR<Prisma.UserAssetUpdateWithoutUserInput, Prisma.UserAssetUncheckedUpdateWithoutUserInput>;
};
export type UserAssetUpdateManyWithWhereWithoutUserInput = {
    where: Prisma.UserAssetScalarWhereInput;
    data: Prisma.XOR<Prisma.UserAssetUpdateManyMutationInput, Prisma.UserAssetUncheckedUpdateManyWithoutUserInput>;
};
export type UserAssetScalarWhereInput = {
    AND?: Prisma.UserAssetScalarWhereInput | Prisma.UserAssetScalarWhereInput[];
    OR?: Prisma.UserAssetScalarWhereInput[];
    NOT?: Prisma.UserAssetScalarWhereInput | Prisma.UserAssetScalarWhereInput[];
    id?: Prisma.StringFilter<"UserAsset"> | string;
    userId?: Prisma.StringFilter<"UserAsset"> | string;
    assetId?: Prisma.StringFilter<"UserAsset"> | string;
    quantity?: Prisma.IntFilter<"UserAsset"> | number;
    avgPrice?: Prisma.FloatFilter<"UserAsset"> | number;
    createdAt?: Prisma.DateTimeFilter<"UserAsset"> | Date | string;
};
export type UserAssetCreateWithoutAssetInput = {
    id?: string;
    quantity: number;
    avgPrice: number;
    createdAt?: Date | string;
    user: Prisma.UserCreateNestedOneWithoutAssetsInput;
};
export type UserAssetUncheckedCreateWithoutAssetInput = {
    id?: string;
    userId: string;
    quantity: number;
    avgPrice: number;
    createdAt?: Date | string;
};
export type UserAssetCreateOrConnectWithoutAssetInput = {
    where: Prisma.UserAssetWhereUniqueInput;
    create: Prisma.XOR<Prisma.UserAssetCreateWithoutAssetInput, Prisma.UserAssetUncheckedCreateWithoutAssetInput>;
};
export type UserAssetCreateManyAssetInputEnvelope = {
    data: Prisma.UserAssetCreateManyAssetInput | Prisma.UserAssetCreateManyAssetInput[];
    skipDuplicates?: boolean;
};
export type UserAssetUpsertWithWhereUniqueWithoutAssetInput = {
    where: Prisma.UserAssetWhereUniqueInput;
    update: Prisma.XOR<Prisma.UserAssetUpdateWithoutAssetInput, Prisma.UserAssetUncheckedUpdateWithoutAssetInput>;
    create: Prisma.XOR<Prisma.UserAssetCreateWithoutAssetInput, Prisma.UserAssetUncheckedCreateWithoutAssetInput>;
};
export type UserAssetUpdateWithWhereUniqueWithoutAssetInput = {
    where: Prisma.UserAssetWhereUniqueInput;
    data: Prisma.XOR<Prisma.UserAssetUpdateWithoutAssetInput, Prisma.UserAssetUncheckedUpdateWithoutAssetInput>;
};
export type UserAssetUpdateManyWithWhereWithoutAssetInput = {
    where: Prisma.UserAssetScalarWhereInput;
    data: Prisma.XOR<Prisma.UserAssetUpdateManyMutationInput, Prisma.UserAssetUncheckedUpdateManyWithoutAssetInput>;
};
export type UserAssetCreateManyUserInput = {
    id?: string;
    assetId: string;
    quantity: number;
    avgPrice: number;
    createdAt?: Date | string;
};
export type UserAssetUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    avgPrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    asset?: Prisma.AssetUpdateOneRequiredWithoutHoldersNestedInput;
};
export type UserAssetUncheckedUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    assetId?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    avgPrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type UserAssetUncheckedUpdateManyWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    assetId?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    avgPrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type UserAssetCreateManyAssetInput = {
    id?: string;
    userId: string;
    quantity: number;
    avgPrice: number;
    createdAt?: Date | string;
};
export type UserAssetUpdateWithoutAssetInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    avgPrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneRequiredWithoutAssetsNestedInput;
};
export type UserAssetUncheckedUpdateWithoutAssetInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    avgPrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type UserAssetUncheckedUpdateManyWithoutAssetInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    avgPrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type UserAssetSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    assetId?: boolean;
    quantity?: boolean;
    avgPrice?: boolean;
    createdAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    asset?: boolean | Prisma.AssetDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["userAsset"]>;
export type UserAssetSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    assetId?: boolean;
    quantity?: boolean;
    avgPrice?: boolean;
    createdAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    asset?: boolean | Prisma.AssetDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["userAsset"]>;
export type UserAssetSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    assetId?: boolean;
    quantity?: boolean;
    avgPrice?: boolean;
    createdAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    asset?: boolean | Prisma.AssetDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["userAsset"]>;
export type UserAssetSelectScalar = {
    id?: boolean;
    userId?: boolean;
    assetId?: boolean;
    quantity?: boolean;
    avgPrice?: boolean;
    createdAt?: boolean;
};
export type UserAssetOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "userId" | "assetId" | "quantity" | "avgPrice" | "createdAt", ExtArgs["result"]["userAsset"]>;
export type UserAssetInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    asset?: boolean | Prisma.AssetDefaultArgs<ExtArgs>;
};
export type UserAssetIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    asset?: boolean | Prisma.AssetDefaultArgs<ExtArgs>;
};
export type UserAssetIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    asset?: boolean | Prisma.AssetDefaultArgs<ExtArgs>;
};
export type $UserAssetPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "UserAsset";
    objects: {
        user: Prisma.$UserPayload<ExtArgs>;
        asset: Prisma.$AssetPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        userId: string;
        assetId: string;
        quantity: number;
        avgPrice: number;
        createdAt: Date;
    }, ExtArgs["result"]["userAsset"]>;
    composites: {};
};
export type UserAssetGetPayload<S extends boolean | null | undefined | UserAssetDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$UserAssetPayload, S>;
export type UserAssetCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<UserAssetFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: UserAssetCountAggregateInputType | true;
};
export interface UserAssetDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['UserAsset'];
        meta: {
            name: 'UserAsset';
        };
    };
    /**
     * Find zero or one UserAsset that matches the filter.
     * @param {UserAssetFindUniqueArgs} args - Arguments to find a UserAsset
     * @example
     * // Get one UserAsset
     * const userAsset = await prisma.userAsset.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserAssetFindUniqueArgs>(args: Prisma.SelectSubset<T, UserAssetFindUniqueArgs<ExtArgs>>): Prisma.Prisma__UserAssetClient<runtime.Types.Result.GetResult<Prisma.$UserAssetPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one UserAsset that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserAssetFindUniqueOrThrowArgs} args - Arguments to find a UserAsset
     * @example
     * // Get one UserAsset
     * const userAsset = await prisma.userAsset.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserAssetFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, UserAssetFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__UserAssetClient<runtime.Types.Result.GetResult<Prisma.$UserAssetPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first UserAsset that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAssetFindFirstArgs} args - Arguments to find a UserAsset
     * @example
     * // Get one UserAsset
     * const userAsset = await prisma.userAsset.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserAssetFindFirstArgs>(args?: Prisma.SelectSubset<T, UserAssetFindFirstArgs<ExtArgs>>): Prisma.Prisma__UserAssetClient<runtime.Types.Result.GetResult<Prisma.$UserAssetPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first UserAsset that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAssetFindFirstOrThrowArgs} args - Arguments to find a UserAsset
     * @example
     * // Get one UserAsset
     * const userAsset = await prisma.userAsset.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserAssetFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, UserAssetFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__UserAssetClient<runtime.Types.Result.GetResult<Prisma.$UserAssetPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more UserAssets that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAssetFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserAssets
     * const userAssets = await prisma.userAsset.findMany()
     *
     * // Get first 10 UserAssets
     * const userAssets = await prisma.userAsset.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const userAssetWithIdOnly = await prisma.userAsset.findMany({ select: { id: true } })
     *
     */
    findMany<T extends UserAssetFindManyArgs>(args?: Prisma.SelectSubset<T, UserAssetFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UserAssetPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a UserAsset.
     * @param {UserAssetCreateArgs} args - Arguments to create a UserAsset.
     * @example
     * // Create one UserAsset
     * const UserAsset = await prisma.userAsset.create({
     *   data: {
     *     // ... data to create a UserAsset
     *   }
     * })
     *
     */
    create<T extends UserAssetCreateArgs>(args: Prisma.SelectSubset<T, UserAssetCreateArgs<ExtArgs>>): Prisma.Prisma__UserAssetClient<runtime.Types.Result.GetResult<Prisma.$UserAssetPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many UserAssets.
     * @param {UserAssetCreateManyArgs} args - Arguments to create many UserAssets.
     * @example
     * // Create many UserAssets
     * const userAsset = await prisma.userAsset.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends UserAssetCreateManyArgs>(args?: Prisma.SelectSubset<T, UserAssetCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many UserAssets and returns the data saved in the database.
     * @param {UserAssetCreateManyAndReturnArgs} args - Arguments to create many UserAssets.
     * @example
     * // Create many UserAssets
     * const userAsset = await prisma.userAsset.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many UserAssets and only return the `id`
     * const userAssetWithIdOnly = await prisma.userAsset.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends UserAssetCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, UserAssetCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UserAssetPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a UserAsset.
     * @param {UserAssetDeleteArgs} args - Arguments to delete one UserAsset.
     * @example
     * // Delete one UserAsset
     * const UserAsset = await prisma.userAsset.delete({
     *   where: {
     *     // ... filter to delete one UserAsset
     *   }
     * })
     *
     */
    delete<T extends UserAssetDeleteArgs>(args: Prisma.SelectSubset<T, UserAssetDeleteArgs<ExtArgs>>): Prisma.Prisma__UserAssetClient<runtime.Types.Result.GetResult<Prisma.$UserAssetPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one UserAsset.
     * @param {UserAssetUpdateArgs} args - Arguments to update one UserAsset.
     * @example
     * // Update one UserAsset
     * const userAsset = await prisma.userAsset.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends UserAssetUpdateArgs>(args: Prisma.SelectSubset<T, UserAssetUpdateArgs<ExtArgs>>): Prisma.Prisma__UserAssetClient<runtime.Types.Result.GetResult<Prisma.$UserAssetPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more UserAssets.
     * @param {UserAssetDeleteManyArgs} args - Arguments to filter UserAssets to delete.
     * @example
     * // Delete a few UserAssets
     * const { count } = await prisma.userAsset.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends UserAssetDeleteManyArgs>(args?: Prisma.SelectSubset<T, UserAssetDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more UserAssets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAssetUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserAssets
     * const userAsset = await prisma.userAsset.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends UserAssetUpdateManyArgs>(args: Prisma.SelectSubset<T, UserAssetUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more UserAssets and returns the data updated in the database.
     * @param {UserAssetUpdateManyAndReturnArgs} args - Arguments to update many UserAssets.
     * @example
     * // Update many UserAssets
     * const userAsset = await prisma.userAsset.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more UserAssets and only return the `id`
     * const userAssetWithIdOnly = await prisma.userAsset.updateManyAndReturn({
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
    updateManyAndReturn<T extends UserAssetUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, UserAssetUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UserAssetPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one UserAsset.
     * @param {UserAssetUpsertArgs} args - Arguments to update or create a UserAsset.
     * @example
     * // Update or create a UserAsset
     * const userAsset = await prisma.userAsset.upsert({
     *   create: {
     *     // ... data to create a UserAsset
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserAsset we want to update
     *   }
     * })
     */
    upsert<T extends UserAssetUpsertArgs>(args: Prisma.SelectSubset<T, UserAssetUpsertArgs<ExtArgs>>): Prisma.Prisma__UserAssetClient<runtime.Types.Result.GetResult<Prisma.$UserAssetPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of UserAssets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAssetCountArgs} args - Arguments to filter UserAssets to count.
     * @example
     * // Count the number of UserAssets
     * const count = await prisma.userAsset.count({
     *   where: {
     *     // ... the filter for the UserAssets we want to count
     *   }
     * })
    **/
    count<T extends UserAssetCountArgs>(args?: Prisma.Subset<T, UserAssetCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], UserAssetCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a UserAsset.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAssetAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends UserAssetAggregateArgs>(args: Prisma.Subset<T, UserAssetAggregateArgs>): Prisma.PrismaPromise<GetUserAssetAggregateType<T>>;
    /**
     * Group by UserAsset.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAssetGroupByArgs} args - Group by arguments.
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
    groupBy<T extends UserAssetGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: UserAssetGroupByArgs['orderBy'];
    } : {
        orderBy?: UserAssetGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, UserAssetGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserAssetGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the UserAsset model
     */
    readonly fields: UserAssetFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for UserAsset.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__UserAssetClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    user<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    asset<T extends Prisma.AssetDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.AssetDefaultArgs<ExtArgs>>): Prisma.Prisma__AssetClient<runtime.Types.Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
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
 * Fields of the UserAsset model
 */
export interface UserAssetFieldRefs {
    readonly id: Prisma.FieldRef<"UserAsset", 'String'>;
    readonly userId: Prisma.FieldRef<"UserAsset", 'String'>;
    readonly assetId: Prisma.FieldRef<"UserAsset", 'String'>;
    readonly quantity: Prisma.FieldRef<"UserAsset", 'Int'>;
    readonly avgPrice: Prisma.FieldRef<"UserAsset", 'Float'>;
    readonly createdAt: Prisma.FieldRef<"UserAsset", 'DateTime'>;
}
/**
 * UserAsset findUnique
 */
export type UserAssetFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which UserAsset to fetch.
     */
    where: Prisma.UserAssetWhereUniqueInput;
};
/**
 * UserAsset findUniqueOrThrow
 */
export type UserAssetFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which UserAsset to fetch.
     */
    where: Prisma.UserAssetWhereUniqueInput;
};
/**
 * UserAsset findFirst
 */
export type UserAssetFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which UserAsset to fetch.
     */
    where?: Prisma.UserAssetWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of UserAssets to fetch.
     */
    orderBy?: Prisma.UserAssetOrderByWithRelationInput | Prisma.UserAssetOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for UserAssets.
     */
    cursor?: Prisma.UserAssetWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` UserAssets from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` UserAssets.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of UserAssets.
     */
    distinct?: Prisma.UserAssetScalarFieldEnum | Prisma.UserAssetScalarFieldEnum[];
};
/**
 * UserAsset findFirstOrThrow
 */
export type UserAssetFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which UserAsset to fetch.
     */
    where?: Prisma.UserAssetWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of UserAssets to fetch.
     */
    orderBy?: Prisma.UserAssetOrderByWithRelationInput | Prisma.UserAssetOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for UserAssets.
     */
    cursor?: Prisma.UserAssetWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` UserAssets from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` UserAssets.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of UserAssets.
     */
    distinct?: Prisma.UserAssetScalarFieldEnum | Prisma.UserAssetScalarFieldEnum[];
};
/**
 * UserAsset findMany
 */
export type UserAssetFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which UserAssets to fetch.
     */
    where?: Prisma.UserAssetWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of UserAssets to fetch.
     */
    orderBy?: Prisma.UserAssetOrderByWithRelationInput | Prisma.UserAssetOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing UserAssets.
     */
    cursor?: Prisma.UserAssetWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` UserAssets from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` UserAssets.
     */
    skip?: number;
    distinct?: Prisma.UserAssetScalarFieldEnum | Prisma.UserAssetScalarFieldEnum[];
};
/**
 * UserAsset create
 */
export type UserAssetCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * The data needed to create a UserAsset.
     */
    data: Prisma.XOR<Prisma.UserAssetCreateInput, Prisma.UserAssetUncheckedCreateInput>;
};
/**
 * UserAsset createMany
 */
export type UserAssetCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserAssets.
     */
    data: Prisma.UserAssetCreateManyInput | Prisma.UserAssetCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * UserAsset createManyAndReturn
 */
export type UserAssetCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserAsset
     */
    select?: Prisma.UserAssetSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the UserAsset
     */
    omit?: Prisma.UserAssetOmit<ExtArgs> | null;
    /**
     * The data used to create many UserAssets.
     */
    data: Prisma.UserAssetCreateManyInput | Prisma.UserAssetCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.UserAssetIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * UserAsset update
 */
export type UserAssetUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * The data needed to update a UserAsset.
     */
    data: Prisma.XOR<Prisma.UserAssetUpdateInput, Prisma.UserAssetUncheckedUpdateInput>;
    /**
     * Choose, which UserAsset to update.
     */
    where: Prisma.UserAssetWhereUniqueInput;
};
/**
 * UserAsset updateMany
 */
export type UserAssetUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update UserAssets.
     */
    data: Prisma.XOR<Prisma.UserAssetUpdateManyMutationInput, Prisma.UserAssetUncheckedUpdateManyInput>;
    /**
     * Filter which UserAssets to update
     */
    where?: Prisma.UserAssetWhereInput;
    /**
     * Limit how many UserAssets to update.
     */
    limit?: number;
};
/**
 * UserAsset updateManyAndReturn
 */
export type UserAssetUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserAsset
     */
    select?: Prisma.UserAssetSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the UserAsset
     */
    omit?: Prisma.UserAssetOmit<ExtArgs> | null;
    /**
     * The data used to update UserAssets.
     */
    data: Prisma.XOR<Prisma.UserAssetUpdateManyMutationInput, Prisma.UserAssetUncheckedUpdateManyInput>;
    /**
     * Filter which UserAssets to update
     */
    where?: Prisma.UserAssetWhereInput;
    /**
     * Limit how many UserAssets to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.UserAssetIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * UserAsset upsert
 */
export type UserAssetUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * The filter to search for the UserAsset to update in case it exists.
     */
    where: Prisma.UserAssetWhereUniqueInput;
    /**
     * In case the UserAsset found by the `where` argument doesn't exist, create a new UserAsset with this data.
     */
    create: Prisma.XOR<Prisma.UserAssetCreateInput, Prisma.UserAssetUncheckedCreateInput>;
    /**
     * In case the UserAsset was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.UserAssetUpdateInput, Prisma.UserAssetUncheckedUpdateInput>;
};
/**
 * UserAsset delete
 */
export type UserAssetDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter which UserAsset to delete.
     */
    where: Prisma.UserAssetWhereUniqueInput;
};
/**
 * UserAsset deleteMany
 */
export type UserAssetDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which UserAssets to delete
     */
    where?: Prisma.UserAssetWhereInput;
    /**
     * Limit how many UserAssets to delete.
     */
    limit?: number;
};
/**
 * UserAsset without action
 */
export type UserAssetDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
};
export {};
//# sourceMappingURL=UserAsset.d.ts.map