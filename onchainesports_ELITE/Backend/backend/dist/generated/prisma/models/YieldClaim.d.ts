import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model YieldClaim
 *
 */
export type YieldClaimModel = runtime.Types.Result.DefaultSelection<Prisma.$YieldClaimPayload>;
export type AggregateYieldClaim = {
    _count: YieldClaimCountAggregateOutputType | null;
    _avg: YieldClaimAvgAggregateOutputType | null;
    _sum: YieldClaimSumAggregateOutputType | null;
    _min: YieldClaimMinAggregateOutputType | null;
    _max: YieldClaimMaxAggregateOutputType | null;
};
export type YieldClaimAvgAggregateOutputType = {
    amountUsdc: number | null;
};
export type YieldClaimSumAggregateOutputType = {
    amountUsdc: bigint | null;
};
export type YieldClaimMinAggregateOutputType = {
    id: string | null;
    userWallet: string | null;
    propertyId: string | null;
    amountUsdc: bigint | null;
    distributionId: string | null;
    txSignature: string | null;
    claimedAt: Date | null;
};
export type YieldClaimMaxAggregateOutputType = {
    id: string | null;
    userWallet: string | null;
    propertyId: string | null;
    amountUsdc: bigint | null;
    distributionId: string | null;
    txSignature: string | null;
    claimedAt: Date | null;
};
export type YieldClaimCountAggregateOutputType = {
    id: number;
    userWallet: number;
    propertyId: number;
    amountUsdc: number;
    distributionId: number;
    txSignature: number;
    claimedAt: number;
    _all: number;
};
export type YieldClaimAvgAggregateInputType = {
    amountUsdc?: true;
};
export type YieldClaimSumAggregateInputType = {
    amountUsdc?: true;
};
export type YieldClaimMinAggregateInputType = {
    id?: true;
    userWallet?: true;
    propertyId?: true;
    amountUsdc?: true;
    distributionId?: true;
    txSignature?: true;
    claimedAt?: true;
};
export type YieldClaimMaxAggregateInputType = {
    id?: true;
    userWallet?: true;
    propertyId?: true;
    amountUsdc?: true;
    distributionId?: true;
    txSignature?: true;
    claimedAt?: true;
};
export type YieldClaimCountAggregateInputType = {
    id?: true;
    userWallet?: true;
    propertyId?: true;
    amountUsdc?: true;
    distributionId?: true;
    txSignature?: true;
    claimedAt?: true;
    _all?: true;
};
export type YieldClaimAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which YieldClaim to aggregate.
     */
    where?: Prisma.YieldClaimWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of YieldClaims to fetch.
     */
    orderBy?: Prisma.YieldClaimOrderByWithRelationInput | Prisma.YieldClaimOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.YieldClaimWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` YieldClaims from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` YieldClaims.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned YieldClaims
    **/
    _count?: true | YieldClaimCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: YieldClaimAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: YieldClaimSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: YieldClaimMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: YieldClaimMaxAggregateInputType;
};
export type GetYieldClaimAggregateType<T extends YieldClaimAggregateArgs> = {
    [P in keyof T & keyof AggregateYieldClaim]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateYieldClaim[P]> : Prisma.GetScalarType<T[P], AggregateYieldClaim[P]>;
};
export type YieldClaimGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.YieldClaimWhereInput;
    orderBy?: Prisma.YieldClaimOrderByWithAggregationInput | Prisma.YieldClaimOrderByWithAggregationInput[];
    by: Prisma.YieldClaimScalarFieldEnum[] | Prisma.YieldClaimScalarFieldEnum;
    having?: Prisma.YieldClaimScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: YieldClaimCountAggregateInputType | true;
    _avg?: YieldClaimAvgAggregateInputType;
    _sum?: YieldClaimSumAggregateInputType;
    _min?: YieldClaimMinAggregateInputType;
    _max?: YieldClaimMaxAggregateInputType;
};
export type YieldClaimGroupByOutputType = {
    id: string;
    userWallet: string;
    propertyId: string;
    amountUsdc: bigint;
    distributionId: string;
    txSignature: string;
    claimedAt: Date;
    _count: YieldClaimCountAggregateOutputType | null;
    _avg: YieldClaimAvgAggregateOutputType | null;
    _sum: YieldClaimSumAggregateOutputType | null;
    _min: YieldClaimMinAggregateOutputType | null;
    _max: YieldClaimMaxAggregateOutputType | null;
};
type GetYieldClaimGroupByPayload<T extends YieldClaimGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<YieldClaimGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof YieldClaimGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], YieldClaimGroupByOutputType[P]> : Prisma.GetScalarType<T[P], YieldClaimGroupByOutputType[P]>;
}>>;
export type YieldClaimWhereInput = {
    AND?: Prisma.YieldClaimWhereInput | Prisma.YieldClaimWhereInput[];
    OR?: Prisma.YieldClaimWhereInput[];
    NOT?: Prisma.YieldClaimWhereInput | Prisma.YieldClaimWhereInput[];
    id?: Prisma.StringFilter<"YieldClaim"> | string;
    userWallet?: Prisma.StringFilter<"YieldClaim"> | string;
    propertyId?: Prisma.StringFilter<"YieldClaim"> | string;
    amountUsdc?: Prisma.BigIntFilter<"YieldClaim"> | bigint | number;
    distributionId?: Prisma.StringFilter<"YieldClaim"> | string;
    txSignature?: Prisma.StringFilter<"YieldClaim"> | string;
    claimedAt?: Prisma.DateTimeFilter<"YieldClaim"> | Date | string;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    property?: Prisma.XOR<Prisma.PropertyScalarRelationFilter, Prisma.PropertyWhereInput>;
    distribution?: Prisma.XOR<Prisma.YieldDistributionScalarRelationFilter, Prisma.YieldDistributionWhereInput>;
};
export type YieldClaimOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    userWallet?: Prisma.SortOrder;
    propertyId?: Prisma.SortOrder;
    amountUsdc?: Prisma.SortOrder;
    distributionId?: Prisma.SortOrder;
    txSignature?: Prisma.SortOrder;
    claimedAt?: Prisma.SortOrder;
    user?: Prisma.UserOrderByWithRelationInput;
    property?: Prisma.PropertyOrderByWithRelationInput;
    distribution?: Prisma.YieldDistributionOrderByWithRelationInput;
};
export type YieldClaimWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    userWallet_propertyId_distributionId?: Prisma.YieldClaimUserWalletPropertyIdDistributionIdCompoundUniqueInput;
    AND?: Prisma.YieldClaimWhereInput | Prisma.YieldClaimWhereInput[];
    OR?: Prisma.YieldClaimWhereInput[];
    NOT?: Prisma.YieldClaimWhereInput | Prisma.YieldClaimWhereInput[];
    userWallet?: Prisma.StringFilter<"YieldClaim"> | string;
    propertyId?: Prisma.StringFilter<"YieldClaim"> | string;
    amountUsdc?: Prisma.BigIntFilter<"YieldClaim"> | bigint | number;
    distributionId?: Prisma.StringFilter<"YieldClaim"> | string;
    txSignature?: Prisma.StringFilter<"YieldClaim"> | string;
    claimedAt?: Prisma.DateTimeFilter<"YieldClaim"> | Date | string;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    property?: Prisma.XOR<Prisma.PropertyScalarRelationFilter, Prisma.PropertyWhereInput>;
    distribution?: Prisma.XOR<Prisma.YieldDistributionScalarRelationFilter, Prisma.YieldDistributionWhereInput>;
}, "id" | "userWallet_propertyId_distributionId">;
export type YieldClaimOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    userWallet?: Prisma.SortOrder;
    propertyId?: Prisma.SortOrder;
    amountUsdc?: Prisma.SortOrder;
    distributionId?: Prisma.SortOrder;
    txSignature?: Prisma.SortOrder;
    claimedAt?: Prisma.SortOrder;
    _count?: Prisma.YieldClaimCountOrderByAggregateInput;
    _avg?: Prisma.YieldClaimAvgOrderByAggregateInput;
    _max?: Prisma.YieldClaimMaxOrderByAggregateInput;
    _min?: Prisma.YieldClaimMinOrderByAggregateInput;
    _sum?: Prisma.YieldClaimSumOrderByAggregateInput;
};
export type YieldClaimScalarWhereWithAggregatesInput = {
    AND?: Prisma.YieldClaimScalarWhereWithAggregatesInput | Prisma.YieldClaimScalarWhereWithAggregatesInput[];
    OR?: Prisma.YieldClaimScalarWhereWithAggregatesInput[];
    NOT?: Prisma.YieldClaimScalarWhereWithAggregatesInput | Prisma.YieldClaimScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"YieldClaim"> | string;
    userWallet?: Prisma.StringWithAggregatesFilter<"YieldClaim"> | string;
    propertyId?: Prisma.StringWithAggregatesFilter<"YieldClaim"> | string;
    amountUsdc?: Prisma.BigIntWithAggregatesFilter<"YieldClaim"> | bigint | number;
    distributionId?: Prisma.StringWithAggregatesFilter<"YieldClaim"> | string;
    txSignature?: Prisma.StringWithAggregatesFilter<"YieldClaim"> | string;
    claimedAt?: Prisma.DateTimeWithAggregatesFilter<"YieldClaim"> | Date | string;
};
export type YieldClaimCreateInput = {
    id?: string;
    amountUsdc: bigint | number;
    txSignature: string;
    claimedAt: Date | string;
    user: Prisma.UserCreateNestedOneWithoutYieldClaimsInput;
    property: Prisma.PropertyCreateNestedOneWithoutYieldClaimsInput;
    distribution: Prisma.YieldDistributionCreateNestedOneWithoutYieldClaimsInput;
};
export type YieldClaimUncheckedCreateInput = {
    id?: string;
    userWallet: string;
    propertyId: string;
    amountUsdc: bigint | number;
    distributionId: string;
    txSignature: string;
    claimedAt: Date | string;
};
export type YieldClaimUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    amountUsdc?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    txSignature?: Prisma.StringFieldUpdateOperationsInput | string;
    claimedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneRequiredWithoutYieldClaimsNestedInput;
    property?: Prisma.PropertyUpdateOneRequiredWithoutYieldClaimsNestedInput;
    distribution?: Prisma.YieldDistributionUpdateOneRequiredWithoutYieldClaimsNestedInput;
};
export type YieldClaimUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userWallet?: Prisma.StringFieldUpdateOperationsInput | string;
    propertyId?: Prisma.StringFieldUpdateOperationsInput | string;
    amountUsdc?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    distributionId?: Prisma.StringFieldUpdateOperationsInput | string;
    txSignature?: Prisma.StringFieldUpdateOperationsInput | string;
    claimedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type YieldClaimCreateManyInput = {
    id?: string;
    userWallet: string;
    propertyId: string;
    amountUsdc: bigint | number;
    distributionId: string;
    txSignature: string;
    claimedAt: Date | string;
};
export type YieldClaimUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    amountUsdc?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    txSignature?: Prisma.StringFieldUpdateOperationsInput | string;
    claimedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type YieldClaimUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userWallet?: Prisma.StringFieldUpdateOperationsInput | string;
    propertyId?: Prisma.StringFieldUpdateOperationsInput | string;
    amountUsdc?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    distributionId?: Prisma.StringFieldUpdateOperationsInput | string;
    txSignature?: Prisma.StringFieldUpdateOperationsInput | string;
    claimedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type YieldClaimListRelationFilter = {
    every?: Prisma.YieldClaimWhereInput;
    some?: Prisma.YieldClaimWhereInput;
    none?: Prisma.YieldClaimWhereInput;
};
export type YieldClaimOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type YieldClaimUserWalletPropertyIdDistributionIdCompoundUniqueInput = {
    userWallet: string;
    propertyId: string;
    distributionId: string;
};
export type YieldClaimCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userWallet?: Prisma.SortOrder;
    propertyId?: Prisma.SortOrder;
    amountUsdc?: Prisma.SortOrder;
    distributionId?: Prisma.SortOrder;
    txSignature?: Prisma.SortOrder;
    claimedAt?: Prisma.SortOrder;
};
export type YieldClaimAvgOrderByAggregateInput = {
    amountUsdc?: Prisma.SortOrder;
};
export type YieldClaimMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userWallet?: Prisma.SortOrder;
    propertyId?: Prisma.SortOrder;
    amountUsdc?: Prisma.SortOrder;
    distributionId?: Prisma.SortOrder;
    txSignature?: Prisma.SortOrder;
    claimedAt?: Prisma.SortOrder;
};
export type YieldClaimMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userWallet?: Prisma.SortOrder;
    propertyId?: Prisma.SortOrder;
    amountUsdc?: Prisma.SortOrder;
    distributionId?: Prisma.SortOrder;
    txSignature?: Prisma.SortOrder;
    claimedAt?: Prisma.SortOrder;
};
export type YieldClaimSumOrderByAggregateInput = {
    amountUsdc?: Prisma.SortOrder;
};
export type YieldClaimCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.YieldClaimCreateWithoutUserInput, Prisma.YieldClaimUncheckedCreateWithoutUserInput> | Prisma.YieldClaimCreateWithoutUserInput[] | Prisma.YieldClaimUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.YieldClaimCreateOrConnectWithoutUserInput | Prisma.YieldClaimCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.YieldClaimCreateManyUserInputEnvelope;
    connect?: Prisma.YieldClaimWhereUniqueInput | Prisma.YieldClaimWhereUniqueInput[];
};
export type YieldClaimUncheckedCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.YieldClaimCreateWithoutUserInput, Prisma.YieldClaimUncheckedCreateWithoutUserInput> | Prisma.YieldClaimCreateWithoutUserInput[] | Prisma.YieldClaimUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.YieldClaimCreateOrConnectWithoutUserInput | Prisma.YieldClaimCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.YieldClaimCreateManyUserInputEnvelope;
    connect?: Prisma.YieldClaimWhereUniqueInput | Prisma.YieldClaimWhereUniqueInput[];
};
export type YieldClaimUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.YieldClaimCreateWithoutUserInput, Prisma.YieldClaimUncheckedCreateWithoutUserInput> | Prisma.YieldClaimCreateWithoutUserInput[] | Prisma.YieldClaimUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.YieldClaimCreateOrConnectWithoutUserInput | Prisma.YieldClaimCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.YieldClaimUpsertWithWhereUniqueWithoutUserInput | Prisma.YieldClaimUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.YieldClaimCreateManyUserInputEnvelope;
    set?: Prisma.YieldClaimWhereUniqueInput | Prisma.YieldClaimWhereUniqueInput[];
    disconnect?: Prisma.YieldClaimWhereUniqueInput | Prisma.YieldClaimWhereUniqueInput[];
    delete?: Prisma.YieldClaimWhereUniqueInput | Prisma.YieldClaimWhereUniqueInput[];
    connect?: Prisma.YieldClaimWhereUniqueInput | Prisma.YieldClaimWhereUniqueInput[];
    update?: Prisma.YieldClaimUpdateWithWhereUniqueWithoutUserInput | Prisma.YieldClaimUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.YieldClaimUpdateManyWithWhereWithoutUserInput | Prisma.YieldClaimUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.YieldClaimScalarWhereInput | Prisma.YieldClaimScalarWhereInput[];
};
export type YieldClaimUncheckedUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.YieldClaimCreateWithoutUserInput, Prisma.YieldClaimUncheckedCreateWithoutUserInput> | Prisma.YieldClaimCreateWithoutUserInput[] | Prisma.YieldClaimUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.YieldClaimCreateOrConnectWithoutUserInput | Prisma.YieldClaimCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.YieldClaimUpsertWithWhereUniqueWithoutUserInput | Prisma.YieldClaimUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.YieldClaimCreateManyUserInputEnvelope;
    set?: Prisma.YieldClaimWhereUniqueInput | Prisma.YieldClaimWhereUniqueInput[];
    disconnect?: Prisma.YieldClaimWhereUniqueInput | Prisma.YieldClaimWhereUniqueInput[];
    delete?: Prisma.YieldClaimWhereUniqueInput | Prisma.YieldClaimWhereUniqueInput[];
    connect?: Prisma.YieldClaimWhereUniqueInput | Prisma.YieldClaimWhereUniqueInput[];
    update?: Prisma.YieldClaimUpdateWithWhereUniqueWithoutUserInput | Prisma.YieldClaimUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.YieldClaimUpdateManyWithWhereWithoutUserInput | Prisma.YieldClaimUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.YieldClaimScalarWhereInput | Prisma.YieldClaimScalarWhereInput[];
};
export type YieldClaimCreateNestedManyWithoutPropertyInput = {
    create?: Prisma.XOR<Prisma.YieldClaimCreateWithoutPropertyInput, Prisma.YieldClaimUncheckedCreateWithoutPropertyInput> | Prisma.YieldClaimCreateWithoutPropertyInput[] | Prisma.YieldClaimUncheckedCreateWithoutPropertyInput[];
    connectOrCreate?: Prisma.YieldClaimCreateOrConnectWithoutPropertyInput | Prisma.YieldClaimCreateOrConnectWithoutPropertyInput[];
    createMany?: Prisma.YieldClaimCreateManyPropertyInputEnvelope;
    connect?: Prisma.YieldClaimWhereUniqueInput | Prisma.YieldClaimWhereUniqueInput[];
};
export type YieldClaimUncheckedCreateNestedManyWithoutPropertyInput = {
    create?: Prisma.XOR<Prisma.YieldClaimCreateWithoutPropertyInput, Prisma.YieldClaimUncheckedCreateWithoutPropertyInput> | Prisma.YieldClaimCreateWithoutPropertyInput[] | Prisma.YieldClaimUncheckedCreateWithoutPropertyInput[];
    connectOrCreate?: Prisma.YieldClaimCreateOrConnectWithoutPropertyInput | Prisma.YieldClaimCreateOrConnectWithoutPropertyInput[];
    createMany?: Prisma.YieldClaimCreateManyPropertyInputEnvelope;
    connect?: Prisma.YieldClaimWhereUniqueInput | Prisma.YieldClaimWhereUniqueInput[];
};
export type YieldClaimUpdateManyWithoutPropertyNestedInput = {
    create?: Prisma.XOR<Prisma.YieldClaimCreateWithoutPropertyInput, Prisma.YieldClaimUncheckedCreateWithoutPropertyInput> | Prisma.YieldClaimCreateWithoutPropertyInput[] | Prisma.YieldClaimUncheckedCreateWithoutPropertyInput[];
    connectOrCreate?: Prisma.YieldClaimCreateOrConnectWithoutPropertyInput | Prisma.YieldClaimCreateOrConnectWithoutPropertyInput[];
    upsert?: Prisma.YieldClaimUpsertWithWhereUniqueWithoutPropertyInput | Prisma.YieldClaimUpsertWithWhereUniqueWithoutPropertyInput[];
    createMany?: Prisma.YieldClaimCreateManyPropertyInputEnvelope;
    set?: Prisma.YieldClaimWhereUniqueInput | Prisma.YieldClaimWhereUniqueInput[];
    disconnect?: Prisma.YieldClaimWhereUniqueInput | Prisma.YieldClaimWhereUniqueInput[];
    delete?: Prisma.YieldClaimWhereUniqueInput | Prisma.YieldClaimWhereUniqueInput[];
    connect?: Prisma.YieldClaimWhereUniqueInput | Prisma.YieldClaimWhereUniqueInput[];
    update?: Prisma.YieldClaimUpdateWithWhereUniqueWithoutPropertyInput | Prisma.YieldClaimUpdateWithWhereUniqueWithoutPropertyInput[];
    updateMany?: Prisma.YieldClaimUpdateManyWithWhereWithoutPropertyInput | Prisma.YieldClaimUpdateManyWithWhereWithoutPropertyInput[];
    deleteMany?: Prisma.YieldClaimScalarWhereInput | Prisma.YieldClaimScalarWhereInput[];
};
export type YieldClaimUncheckedUpdateManyWithoutPropertyNestedInput = {
    create?: Prisma.XOR<Prisma.YieldClaimCreateWithoutPropertyInput, Prisma.YieldClaimUncheckedCreateWithoutPropertyInput> | Prisma.YieldClaimCreateWithoutPropertyInput[] | Prisma.YieldClaimUncheckedCreateWithoutPropertyInput[];
    connectOrCreate?: Prisma.YieldClaimCreateOrConnectWithoutPropertyInput | Prisma.YieldClaimCreateOrConnectWithoutPropertyInput[];
    upsert?: Prisma.YieldClaimUpsertWithWhereUniqueWithoutPropertyInput | Prisma.YieldClaimUpsertWithWhereUniqueWithoutPropertyInput[];
    createMany?: Prisma.YieldClaimCreateManyPropertyInputEnvelope;
    set?: Prisma.YieldClaimWhereUniqueInput | Prisma.YieldClaimWhereUniqueInput[];
    disconnect?: Prisma.YieldClaimWhereUniqueInput | Prisma.YieldClaimWhereUniqueInput[];
    delete?: Prisma.YieldClaimWhereUniqueInput | Prisma.YieldClaimWhereUniqueInput[];
    connect?: Prisma.YieldClaimWhereUniqueInput | Prisma.YieldClaimWhereUniqueInput[];
    update?: Prisma.YieldClaimUpdateWithWhereUniqueWithoutPropertyInput | Prisma.YieldClaimUpdateWithWhereUniqueWithoutPropertyInput[];
    updateMany?: Prisma.YieldClaimUpdateManyWithWhereWithoutPropertyInput | Prisma.YieldClaimUpdateManyWithWhereWithoutPropertyInput[];
    deleteMany?: Prisma.YieldClaimScalarWhereInput | Prisma.YieldClaimScalarWhereInput[];
};
export type YieldClaimCreateNestedManyWithoutDistributionInput = {
    create?: Prisma.XOR<Prisma.YieldClaimCreateWithoutDistributionInput, Prisma.YieldClaimUncheckedCreateWithoutDistributionInput> | Prisma.YieldClaimCreateWithoutDistributionInput[] | Prisma.YieldClaimUncheckedCreateWithoutDistributionInput[];
    connectOrCreate?: Prisma.YieldClaimCreateOrConnectWithoutDistributionInput | Prisma.YieldClaimCreateOrConnectWithoutDistributionInput[];
    createMany?: Prisma.YieldClaimCreateManyDistributionInputEnvelope;
    connect?: Prisma.YieldClaimWhereUniqueInput | Prisma.YieldClaimWhereUniqueInput[];
};
export type YieldClaimUncheckedCreateNestedManyWithoutDistributionInput = {
    create?: Prisma.XOR<Prisma.YieldClaimCreateWithoutDistributionInput, Prisma.YieldClaimUncheckedCreateWithoutDistributionInput> | Prisma.YieldClaimCreateWithoutDistributionInput[] | Prisma.YieldClaimUncheckedCreateWithoutDistributionInput[];
    connectOrCreate?: Prisma.YieldClaimCreateOrConnectWithoutDistributionInput | Prisma.YieldClaimCreateOrConnectWithoutDistributionInput[];
    createMany?: Prisma.YieldClaimCreateManyDistributionInputEnvelope;
    connect?: Prisma.YieldClaimWhereUniqueInput | Prisma.YieldClaimWhereUniqueInput[];
};
export type YieldClaimUpdateManyWithoutDistributionNestedInput = {
    create?: Prisma.XOR<Prisma.YieldClaimCreateWithoutDistributionInput, Prisma.YieldClaimUncheckedCreateWithoutDistributionInput> | Prisma.YieldClaimCreateWithoutDistributionInput[] | Prisma.YieldClaimUncheckedCreateWithoutDistributionInput[];
    connectOrCreate?: Prisma.YieldClaimCreateOrConnectWithoutDistributionInput | Prisma.YieldClaimCreateOrConnectWithoutDistributionInput[];
    upsert?: Prisma.YieldClaimUpsertWithWhereUniqueWithoutDistributionInput | Prisma.YieldClaimUpsertWithWhereUniqueWithoutDistributionInput[];
    createMany?: Prisma.YieldClaimCreateManyDistributionInputEnvelope;
    set?: Prisma.YieldClaimWhereUniqueInput | Prisma.YieldClaimWhereUniqueInput[];
    disconnect?: Prisma.YieldClaimWhereUniqueInput | Prisma.YieldClaimWhereUniqueInput[];
    delete?: Prisma.YieldClaimWhereUniqueInput | Prisma.YieldClaimWhereUniqueInput[];
    connect?: Prisma.YieldClaimWhereUniqueInput | Prisma.YieldClaimWhereUniqueInput[];
    update?: Prisma.YieldClaimUpdateWithWhereUniqueWithoutDistributionInput | Prisma.YieldClaimUpdateWithWhereUniqueWithoutDistributionInput[];
    updateMany?: Prisma.YieldClaimUpdateManyWithWhereWithoutDistributionInput | Prisma.YieldClaimUpdateManyWithWhereWithoutDistributionInput[];
    deleteMany?: Prisma.YieldClaimScalarWhereInput | Prisma.YieldClaimScalarWhereInput[];
};
export type YieldClaimUncheckedUpdateManyWithoutDistributionNestedInput = {
    create?: Prisma.XOR<Prisma.YieldClaimCreateWithoutDistributionInput, Prisma.YieldClaimUncheckedCreateWithoutDistributionInput> | Prisma.YieldClaimCreateWithoutDistributionInput[] | Prisma.YieldClaimUncheckedCreateWithoutDistributionInput[];
    connectOrCreate?: Prisma.YieldClaimCreateOrConnectWithoutDistributionInput | Prisma.YieldClaimCreateOrConnectWithoutDistributionInput[];
    upsert?: Prisma.YieldClaimUpsertWithWhereUniqueWithoutDistributionInput | Prisma.YieldClaimUpsertWithWhereUniqueWithoutDistributionInput[];
    createMany?: Prisma.YieldClaimCreateManyDistributionInputEnvelope;
    set?: Prisma.YieldClaimWhereUniqueInput | Prisma.YieldClaimWhereUniqueInput[];
    disconnect?: Prisma.YieldClaimWhereUniqueInput | Prisma.YieldClaimWhereUniqueInput[];
    delete?: Prisma.YieldClaimWhereUniqueInput | Prisma.YieldClaimWhereUniqueInput[];
    connect?: Prisma.YieldClaimWhereUniqueInput | Prisma.YieldClaimWhereUniqueInput[];
    update?: Prisma.YieldClaimUpdateWithWhereUniqueWithoutDistributionInput | Prisma.YieldClaimUpdateWithWhereUniqueWithoutDistributionInput[];
    updateMany?: Prisma.YieldClaimUpdateManyWithWhereWithoutDistributionInput | Prisma.YieldClaimUpdateManyWithWhereWithoutDistributionInput[];
    deleteMany?: Prisma.YieldClaimScalarWhereInput | Prisma.YieldClaimScalarWhereInput[];
};
export type YieldClaimCreateWithoutUserInput = {
    id?: string;
    amountUsdc: bigint | number;
    txSignature: string;
    claimedAt: Date | string;
    property: Prisma.PropertyCreateNestedOneWithoutYieldClaimsInput;
    distribution: Prisma.YieldDistributionCreateNestedOneWithoutYieldClaimsInput;
};
export type YieldClaimUncheckedCreateWithoutUserInput = {
    id?: string;
    propertyId: string;
    amountUsdc: bigint | number;
    distributionId: string;
    txSignature: string;
    claimedAt: Date | string;
};
export type YieldClaimCreateOrConnectWithoutUserInput = {
    where: Prisma.YieldClaimWhereUniqueInput;
    create: Prisma.XOR<Prisma.YieldClaimCreateWithoutUserInput, Prisma.YieldClaimUncheckedCreateWithoutUserInput>;
};
export type YieldClaimCreateManyUserInputEnvelope = {
    data: Prisma.YieldClaimCreateManyUserInput | Prisma.YieldClaimCreateManyUserInput[];
    skipDuplicates?: boolean;
};
export type YieldClaimUpsertWithWhereUniqueWithoutUserInput = {
    where: Prisma.YieldClaimWhereUniqueInput;
    update: Prisma.XOR<Prisma.YieldClaimUpdateWithoutUserInput, Prisma.YieldClaimUncheckedUpdateWithoutUserInput>;
    create: Prisma.XOR<Prisma.YieldClaimCreateWithoutUserInput, Prisma.YieldClaimUncheckedCreateWithoutUserInput>;
};
export type YieldClaimUpdateWithWhereUniqueWithoutUserInput = {
    where: Prisma.YieldClaimWhereUniqueInput;
    data: Prisma.XOR<Prisma.YieldClaimUpdateWithoutUserInput, Prisma.YieldClaimUncheckedUpdateWithoutUserInput>;
};
export type YieldClaimUpdateManyWithWhereWithoutUserInput = {
    where: Prisma.YieldClaimScalarWhereInput;
    data: Prisma.XOR<Prisma.YieldClaimUpdateManyMutationInput, Prisma.YieldClaimUncheckedUpdateManyWithoutUserInput>;
};
export type YieldClaimScalarWhereInput = {
    AND?: Prisma.YieldClaimScalarWhereInput | Prisma.YieldClaimScalarWhereInput[];
    OR?: Prisma.YieldClaimScalarWhereInput[];
    NOT?: Prisma.YieldClaimScalarWhereInput | Prisma.YieldClaimScalarWhereInput[];
    id?: Prisma.StringFilter<"YieldClaim"> | string;
    userWallet?: Prisma.StringFilter<"YieldClaim"> | string;
    propertyId?: Prisma.StringFilter<"YieldClaim"> | string;
    amountUsdc?: Prisma.BigIntFilter<"YieldClaim"> | bigint | number;
    distributionId?: Prisma.StringFilter<"YieldClaim"> | string;
    txSignature?: Prisma.StringFilter<"YieldClaim"> | string;
    claimedAt?: Prisma.DateTimeFilter<"YieldClaim"> | Date | string;
};
export type YieldClaimCreateWithoutPropertyInput = {
    id?: string;
    amountUsdc: bigint | number;
    txSignature: string;
    claimedAt: Date | string;
    user: Prisma.UserCreateNestedOneWithoutYieldClaimsInput;
    distribution: Prisma.YieldDistributionCreateNestedOneWithoutYieldClaimsInput;
};
export type YieldClaimUncheckedCreateWithoutPropertyInput = {
    id?: string;
    userWallet: string;
    amountUsdc: bigint | number;
    distributionId: string;
    txSignature: string;
    claimedAt: Date | string;
};
export type YieldClaimCreateOrConnectWithoutPropertyInput = {
    where: Prisma.YieldClaimWhereUniqueInput;
    create: Prisma.XOR<Prisma.YieldClaimCreateWithoutPropertyInput, Prisma.YieldClaimUncheckedCreateWithoutPropertyInput>;
};
export type YieldClaimCreateManyPropertyInputEnvelope = {
    data: Prisma.YieldClaimCreateManyPropertyInput | Prisma.YieldClaimCreateManyPropertyInput[];
    skipDuplicates?: boolean;
};
export type YieldClaimUpsertWithWhereUniqueWithoutPropertyInput = {
    where: Prisma.YieldClaimWhereUniqueInput;
    update: Prisma.XOR<Prisma.YieldClaimUpdateWithoutPropertyInput, Prisma.YieldClaimUncheckedUpdateWithoutPropertyInput>;
    create: Prisma.XOR<Prisma.YieldClaimCreateWithoutPropertyInput, Prisma.YieldClaimUncheckedCreateWithoutPropertyInput>;
};
export type YieldClaimUpdateWithWhereUniqueWithoutPropertyInput = {
    where: Prisma.YieldClaimWhereUniqueInput;
    data: Prisma.XOR<Prisma.YieldClaimUpdateWithoutPropertyInput, Prisma.YieldClaimUncheckedUpdateWithoutPropertyInput>;
};
export type YieldClaimUpdateManyWithWhereWithoutPropertyInput = {
    where: Prisma.YieldClaimScalarWhereInput;
    data: Prisma.XOR<Prisma.YieldClaimUpdateManyMutationInput, Prisma.YieldClaimUncheckedUpdateManyWithoutPropertyInput>;
};
export type YieldClaimCreateWithoutDistributionInput = {
    id?: string;
    amountUsdc: bigint | number;
    txSignature: string;
    claimedAt: Date | string;
    user: Prisma.UserCreateNestedOneWithoutYieldClaimsInput;
    property: Prisma.PropertyCreateNestedOneWithoutYieldClaimsInput;
};
export type YieldClaimUncheckedCreateWithoutDistributionInput = {
    id?: string;
    userWallet: string;
    propertyId: string;
    amountUsdc: bigint | number;
    txSignature: string;
    claimedAt: Date | string;
};
export type YieldClaimCreateOrConnectWithoutDistributionInput = {
    where: Prisma.YieldClaimWhereUniqueInput;
    create: Prisma.XOR<Prisma.YieldClaimCreateWithoutDistributionInput, Prisma.YieldClaimUncheckedCreateWithoutDistributionInput>;
};
export type YieldClaimCreateManyDistributionInputEnvelope = {
    data: Prisma.YieldClaimCreateManyDistributionInput | Prisma.YieldClaimCreateManyDistributionInput[];
    skipDuplicates?: boolean;
};
export type YieldClaimUpsertWithWhereUniqueWithoutDistributionInput = {
    where: Prisma.YieldClaimWhereUniqueInput;
    update: Prisma.XOR<Prisma.YieldClaimUpdateWithoutDistributionInput, Prisma.YieldClaimUncheckedUpdateWithoutDistributionInput>;
    create: Prisma.XOR<Prisma.YieldClaimCreateWithoutDistributionInput, Prisma.YieldClaimUncheckedCreateWithoutDistributionInput>;
};
export type YieldClaimUpdateWithWhereUniqueWithoutDistributionInput = {
    where: Prisma.YieldClaimWhereUniqueInput;
    data: Prisma.XOR<Prisma.YieldClaimUpdateWithoutDistributionInput, Prisma.YieldClaimUncheckedUpdateWithoutDistributionInput>;
};
export type YieldClaimUpdateManyWithWhereWithoutDistributionInput = {
    where: Prisma.YieldClaimScalarWhereInput;
    data: Prisma.XOR<Prisma.YieldClaimUpdateManyMutationInput, Prisma.YieldClaimUncheckedUpdateManyWithoutDistributionInput>;
};
export type YieldClaimCreateManyUserInput = {
    id?: string;
    propertyId: string;
    amountUsdc: bigint | number;
    distributionId: string;
    txSignature: string;
    claimedAt: Date | string;
};
export type YieldClaimUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    amountUsdc?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    txSignature?: Prisma.StringFieldUpdateOperationsInput | string;
    claimedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    property?: Prisma.PropertyUpdateOneRequiredWithoutYieldClaimsNestedInput;
    distribution?: Prisma.YieldDistributionUpdateOneRequiredWithoutYieldClaimsNestedInput;
};
export type YieldClaimUncheckedUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    propertyId?: Prisma.StringFieldUpdateOperationsInput | string;
    amountUsdc?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    distributionId?: Prisma.StringFieldUpdateOperationsInput | string;
    txSignature?: Prisma.StringFieldUpdateOperationsInput | string;
    claimedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type YieldClaimUncheckedUpdateManyWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    propertyId?: Prisma.StringFieldUpdateOperationsInput | string;
    amountUsdc?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    distributionId?: Prisma.StringFieldUpdateOperationsInput | string;
    txSignature?: Prisma.StringFieldUpdateOperationsInput | string;
    claimedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type YieldClaimCreateManyPropertyInput = {
    id?: string;
    userWallet: string;
    amountUsdc: bigint | number;
    distributionId: string;
    txSignature: string;
    claimedAt: Date | string;
};
export type YieldClaimUpdateWithoutPropertyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    amountUsdc?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    txSignature?: Prisma.StringFieldUpdateOperationsInput | string;
    claimedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneRequiredWithoutYieldClaimsNestedInput;
    distribution?: Prisma.YieldDistributionUpdateOneRequiredWithoutYieldClaimsNestedInput;
};
export type YieldClaimUncheckedUpdateWithoutPropertyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userWallet?: Prisma.StringFieldUpdateOperationsInput | string;
    amountUsdc?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    distributionId?: Prisma.StringFieldUpdateOperationsInput | string;
    txSignature?: Prisma.StringFieldUpdateOperationsInput | string;
    claimedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type YieldClaimUncheckedUpdateManyWithoutPropertyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userWallet?: Prisma.StringFieldUpdateOperationsInput | string;
    amountUsdc?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    distributionId?: Prisma.StringFieldUpdateOperationsInput | string;
    txSignature?: Prisma.StringFieldUpdateOperationsInput | string;
    claimedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type YieldClaimCreateManyDistributionInput = {
    id?: string;
    userWallet: string;
    propertyId: string;
    amountUsdc: bigint | number;
    txSignature: string;
    claimedAt: Date | string;
};
export type YieldClaimUpdateWithoutDistributionInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    amountUsdc?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    txSignature?: Prisma.StringFieldUpdateOperationsInput | string;
    claimedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneRequiredWithoutYieldClaimsNestedInput;
    property?: Prisma.PropertyUpdateOneRequiredWithoutYieldClaimsNestedInput;
};
export type YieldClaimUncheckedUpdateWithoutDistributionInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userWallet?: Prisma.StringFieldUpdateOperationsInput | string;
    propertyId?: Prisma.StringFieldUpdateOperationsInput | string;
    amountUsdc?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    txSignature?: Prisma.StringFieldUpdateOperationsInput | string;
    claimedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type YieldClaimUncheckedUpdateManyWithoutDistributionInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userWallet?: Prisma.StringFieldUpdateOperationsInput | string;
    propertyId?: Prisma.StringFieldUpdateOperationsInput | string;
    amountUsdc?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    txSignature?: Prisma.StringFieldUpdateOperationsInput | string;
    claimedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type YieldClaimSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userWallet?: boolean;
    propertyId?: boolean;
    amountUsdc?: boolean;
    distributionId?: boolean;
    txSignature?: boolean;
    claimedAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    property?: boolean | Prisma.PropertyDefaultArgs<ExtArgs>;
    distribution?: boolean | Prisma.YieldDistributionDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["yieldClaim"]>;
export type YieldClaimSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userWallet?: boolean;
    propertyId?: boolean;
    amountUsdc?: boolean;
    distributionId?: boolean;
    txSignature?: boolean;
    claimedAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    property?: boolean | Prisma.PropertyDefaultArgs<ExtArgs>;
    distribution?: boolean | Prisma.YieldDistributionDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["yieldClaim"]>;
export type YieldClaimSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userWallet?: boolean;
    propertyId?: boolean;
    amountUsdc?: boolean;
    distributionId?: boolean;
    txSignature?: boolean;
    claimedAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    property?: boolean | Prisma.PropertyDefaultArgs<ExtArgs>;
    distribution?: boolean | Prisma.YieldDistributionDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["yieldClaim"]>;
export type YieldClaimSelectScalar = {
    id?: boolean;
    userWallet?: boolean;
    propertyId?: boolean;
    amountUsdc?: boolean;
    distributionId?: boolean;
    txSignature?: boolean;
    claimedAt?: boolean;
};
export type YieldClaimOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "userWallet" | "propertyId" | "amountUsdc" | "distributionId" | "txSignature" | "claimedAt", ExtArgs["result"]["yieldClaim"]>;
export type YieldClaimInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    property?: boolean | Prisma.PropertyDefaultArgs<ExtArgs>;
    distribution?: boolean | Prisma.YieldDistributionDefaultArgs<ExtArgs>;
};
export type YieldClaimIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    property?: boolean | Prisma.PropertyDefaultArgs<ExtArgs>;
    distribution?: boolean | Prisma.YieldDistributionDefaultArgs<ExtArgs>;
};
export type YieldClaimIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    property?: boolean | Prisma.PropertyDefaultArgs<ExtArgs>;
    distribution?: boolean | Prisma.YieldDistributionDefaultArgs<ExtArgs>;
};
export type $YieldClaimPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "YieldClaim";
    objects: {
        user: Prisma.$UserPayload<ExtArgs>;
        property: Prisma.$PropertyPayload<ExtArgs>;
        distribution: Prisma.$YieldDistributionPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        userWallet: string;
        propertyId: string;
        amountUsdc: bigint;
        distributionId: string;
        txSignature: string;
        claimedAt: Date;
    }, ExtArgs["result"]["yieldClaim"]>;
    composites: {};
};
export type YieldClaimGetPayload<S extends boolean | null | undefined | YieldClaimDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$YieldClaimPayload, S>;
export type YieldClaimCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<YieldClaimFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: YieldClaimCountAggregateInputType | true;
};
export interface YieldClaimDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['YieldClaim'];
        meta: {
            name: 'YieldClaim';
        };
    };
    /**
     * Find zero or one YieldClaim that matches the filter.
     * @param {YieldClaimFindUniqueArgs} args - Arguments to find a YieldClaim
     * @example
     * // Get one YieldClaim
     * const yieldClaim = await prisma.yieldClaim.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends YieldClaimFindUniqueArgs>(args: Prisma.SelectSubset<T, YieldClaimFindUniqueArgs<ExtArgs>>): Prisma.Prisma__YieldClaimClient<runtime.Types.Result.GetResult<Prisma.$YieldClaimPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one YieldClaim that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {YieldClaimFindUniqueOrThrowArgs} args - Arguments to find a YieldClaim
     * @example
     * // Get one YieldClaim
     * const yieldClaim = await prisma.yieldClaim.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends YieldClaimFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, YieldClaimFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__YieldClaimClient<runtime.Types.Result.GetResult<Prisma.$YieldClaimPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first YieldClaim that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YieldClaimFindFirstArgs} args - Arguments to find a YieldClaim
     * @example
     * // Get one YieldClaim
     * const yieldClaim = await prisma.yieldClaim.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends YieldClaimFindFirstArgs>(args?: Prisma.SelectSubset<T, YieldClaimFindFirstArgs<ExtArgs>>): Prisma.Prisma__YieldClaimClient<runtime.Types.Result.GetResult<Prisma.$YieldClaimPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first YieldClaim that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YieldClaimFindFirstOrThrowArgs} args - Arguments to find a YieldClaim
     * @example
     * // Get one YieldClaim
     * const yieldClaim = await prisma.yieldClaim.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends YieldClaimFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, YieldClaimFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__YieldClaimClient<runtime.Types.Result.GetResult<Prisma.$YieldClaimPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more YieldClaims that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YieldClaimFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all YieldClaims
     * const yieldClaims = await prisma.yieldClaim.findMany()
     *
     * // Get first 10 YieldClaims
     * const yieldClaims = await prisma.yieldClaim.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const yieldClaimWithIdOnly = await prisma.yieldClaim.findMany({ select: { id: true } })
     *
     */
    findMany<T extends YieldClaimFindManyArgs>(args?: Prisma.SelectSubset<T, YieldClaimFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$YieldClaimPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a YieldClaim.
     * @param {YieldClaimCreateArgs} args - Arguments to create a YieldClaim.
     * @example
     * // Create one YieldClaim
     * const YieldClaim = await prisma.yieldClaim.create({
     *   data: {
     *     // ... data to create a YieldClaim
     *   }
     * })
     *
     */
    create<T extends YieldClaimCreateArgs>(args: Prisma.SelectSubset<T, YieldClaimCreateArgs<ExtArgs>>): Prisma.Prisma__YieldClaimClient<runtime.Types.Result.GetResult<Prisma.$YieldClaimPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many YieldClaims.
     * @param {YieldClaimCreateManyArgs} args - Arguments to create many YieldClaims.
     * @example
     * // Create many YieldClaims
     * const yieldClaim = await prisma.yieldClaim.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends YieldClaimCreateManyArgs>(args?: Prisma.SelectSubset<T, YieldClaimCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many YieldClaims and returns the data saved in the database.
     * @param {YieldClaimCreateManyAndReturnArgs} args - Arguments to create many YieldClaims.
     * @example
     * // Create many YieldClaims
     * const yieldClaim = await prisma.yieldClaim.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many YieldClaims and only return the `id`
     * const yieldClaimWithIdOnly = await prisma.yieldClaim.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends YieldClaimCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, YieldClaimCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$YieldClaimPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a YieldClaim.
     * @param {YieldClaimDeleteArgs} args - Arguments to delete one YieldClaim.
     * @example
     * // Delete one YieldClaim
     * const YieldClaim = await prisma.yieldClaim.delete({
     *   where: {
     *     // ... filter to delete one YieldClaim
     *   }
     * })
     *
     */
    delete<T extends YieldClaimDeleteArgs>(args: Prisma.SelectSubset<T, YieldClaimDeleteArgs<ExtArgs>>): Prisma.Prisma__YieldClaimClient<runtime.Types.Result.GetResult<Prisma.$YieldClaimPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one YieldClaim.
     * @param {YieldClaimUpdateArgs} args - Arguments to update one YieldClaim.
     * @example
     * // Update one YieldClaim
     * const yieldClaim = await prisma.yieldClaim.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends YieldClaimUpdateArgs>(args: Prisma.SelectSubset<T, YieldClaimUpdateArgs<ExtArgs>>): Prisma.Prisma__YieldClaimClient<runtime.Types.Result.GetResult<Prisma.$YieldClaimPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more YieldClaims.
     * @param {YieldClaimDeleteManyArgs} args - Arguments to filter YieldClaims to delete.
     * @example
     * // Delete a few YieldClaims
     * const { count } = await prisma.yieldClaim.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends YieldClaimDeleteManyArgs>(args?: Prisma.SelectSubset<T, YieldClaimDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more YieldClaims.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YieldClaimUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many YieldClaims
     * const yieldClaim = await prisma.yieldClaim.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends YieldClaimUpdateManyArgs>(args: Prisma.SelectSubset<T, YieldClaimUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more YieldClaims and returns the data updated in the database.
     * @param {YieldClaimUpdateManyAndReturnArgs} args - Arguments to update many YieldClaims.
     * @example
     * // Update many YieldClaims
     * const yieldClaim = await prisma.yieldClaim.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more YieldClaims and only return the `id`
     * const yieldClaimWithIdOnly = await prisma.yieldClaim.updateManyAndReturn({
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
    updateManyAndReturn<T extends YieldClaimUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, YieldClaimUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$YieldClaimPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one YieldClaim.
     * @param {YieldClaimUpsertArgs} args - Arguments to update or create a YieldClaim.
     * @example
     * // Update or create a YieldClaim
     * const yieldClaim = await prisma.yieldClaim.upsert({
     *   create: {
     *     // ... data to create a YieldClaim
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the YieldClaim we want to update
     *   }
     * })
     */
    upsert<T extends YieldClaimUpsertArgs>(args: Prisma.SelectSubset<T, YieldClaimUpsertArgs<ExtArgs>>): Prisma.Prisma__YieldClaimClient<runtime.Types.Result.GetResult<Prisma.$YieldClaimPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of YieldClaims.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YieldClaimCountArgs} args - Arguments to filter YieldClaims to count.
     * @example
     * // Count the number of YieldClaims
     * const count = await prisma.yieldClaim.count({
     *   where: {
     *     // ... the filter for the YieldClaims we want to count
     *   }
     * })
    **/
    count<T extends YieldClaimCountArgs>(args?: Prisma.Subset<T, YieldClaimCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], YieldClaimCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a YieldClaim.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YieldClaimAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends YieldClaimAggregateArgs>(args: Prisma.Subset<T, YieldClaimAggregateArgs>): Prisma.PrismaPromise<GetYieldClaimAggregateType<T>>;
    /**
     * Group by YieldClaim.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YieldClaimGroupByArgs} args - Group by arguments.
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
    groupBy<T extends YieldClaimGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: YieldClaimGroupByArgs['orderBy'];
    } : {
        orderBy?: YieldClaimGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, YieldClaimGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetYieldClaimGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the YieldClaim model
     */
    readonly fields: YieldClaimFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for YieldClaim.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__YieldClaimClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    user<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    property<T extends Prisma.PropertyDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.PropertyDefaultArgs<ExtArgs>>): Prisma.Prisma__PropertyClient<runtime.Types.Result.GetResult<Prisma.$PropertyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    distribution<T extends Prisma.YieldDistributionDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.YieldDistributionDefaultArgs<ExtArgs>>): Prisma.Prisma__YieldDistributionClient<runtime.Types.Result.GetResult<Prisma.$YieldDistributionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
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
 * Fields of the YieldClaim model
 */
export interface YieldClaimFieldRefs {
    readonly id: Prisma.FieldRef<"YieldClaim", 'String'>;
    readonly userWallet: Prisma.FieldRef<"YieldClaim", 'String'>;
    readonly propertyId: Prisma.FieldRef<"YieldClaim", 'String'>;
    readonly amountUsdc: Prisma.FieldRef<"YieldClaim", 'BigInt'>;
    readonly distributionId: Prisma.FieldRef<"YieldClaim", 'String'>;
    readonly txSignature: Prisma.FieldRef<"YieldClaim", 'String'>;
    readonly claimedAt: Prisma.FieldRef<"YieldClaim", 'DateTime'>;
}
/**
 * YieldClaim findUnique
 */
export type YieldClaimFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YieldClaim
     */
    select?: Prisma.YieldClaimSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the YieldClaim
     */
    omit?: Prisma.YieldClaimOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.YieldClaimInclude<ExtArgs> | null;
    /**
     * Filter, which YieldClaim to fetch.
     */
    where: Prisma.YieldClaimWhereUniqueInput;
};
/**
 * YieldClaim findUniqueOrThrow
 */
export type YieldClaimFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YieldClaim
     */
    select?: Prisma.YieldClaimSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the YieldClaim
     */
    omit?: Prisma.YieldClaimOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.YieldClaimInclude<ExtArgs> | null;
    /**
     * Filter, which YieldClaim to fetch.
     */
    where: Prisma.YieldClaimWhereUniqueInput;
};
/**
 * YieldClaim findFirst
 */
export type YieldClaimFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YieldClaim
     */
    select?: Prisma.YieldClaimSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the YieldClaim
     */
    omit?: Prisma.YieldClaimOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.YieldClaimInclude<ExtArgs> | null;
    /**
     * Filter, which YieldClaim to fetch.
     */
    where?: Prisma.YieldClaimWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of YieldClaims to fetch.
     */
    orderBy?: Prisma.YieldClaimOrderByWithRelationInput | Prisma.YieldClaimOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for YieldClaims.
     */
    cursor?: Prisma.YieldClaimWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` YieldClaims from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` YieldClaims.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of YieldClaims.
     */
    distinct?: Prisma.YieldClaimScalarFieldEnum | Prisma.YieldClaimScalarFieldEnum[];
};
/**
 * YieldClaim findFirstOrThrow
 */
export type YieldClaimFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YieldClaim
     */
    select?: Prisma.YieldClaimSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the YieldClaim
     */
    omit?: Prisma.YieldClaimOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.YieldClaimInclude<ExtArgs> | null;
    /**
     * Filter, which YieldClaim to fetch.
     */
    where?: Prisma.YieldClaimWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of YieldClaims to fetch.
     */
    orderBy?: Prisma.YieldClaimOrderByWithRelationInput | Prisma.YieldClaimOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for YieldClaims.
     */
    cursor?: Prisma.YieldClaimWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` YieldClaims from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` YieldClaims.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of YieldClaims.
     */
    distinct?: Prisma.YieldClaimScalarFieldEnum | Prisma.YieldClaimScalarFieldEnum[];
};
/**
 * YieldClaim findMany
 */
export type YieldClaimFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YieldClaim
     */
    select?: Prisma.YieldClaimSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the YieldClaim
     */
    omit?: Prisma.YieldClaimOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.YieldClaimInclude<ExtArgs> | null;
    /**
     * Filter, which YieldClaims to fetch.
     */
    where?: Prisma.YieldClaimWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of YieldClaims to fetch.
     */
    orderBy?: Prisma.YieldClaimOrderByWithRelationInput | Prisma.YieldClaimOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing YieldClaims.
     */
    cursor?: Prisma.YieldClaimWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` YieldClaims from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` YieldClaims.
     */
    skip?: number;
    distinct?: Prisma.YieldClaimScalarFieldEnum | Prisma.YieldClaimScalarFieldEnum[];
};
/**
 * YieldClaim create
 */
export type YieldClaimCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YieldClaim
     */
    select?: Prisma.YieldClaimSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the YieldClaim
     */
    omit?: Prisma.YieldClaimOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.YieldClaimInclude<ExtArgs> | null;
    /**
     * The data needed to create a YieldClaim.
     */
    data: Prisma.XOR<Prisma.YieldClaimCreateInput, Prisma.YieldClaimUncheckedCreateInput>;
};
/**
 * YieldClaim createMany
 */
export type YieldClaimCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many YieldClaims.
     */
    data: Prisma.YieldClaimCreateManyInput | Prisma.YieldClaimCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * YieldClaim createManyAndReturn
 */
export type YieldClaimCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YieldClaim
     */
    select?: Prisma.YieldClaimSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the YieldClaim
     */
    omit?: Prisma.YieldClaimOmit<ExtArgs> | null;
    /**
     * The data used to create many YieldClaims.
     */
    data: Prisma.YieldClaimCreateManyInput | Prisma.YieldClaimCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.YieldClaimIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * YieldClaim update
 */
export type YieldClaimUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YieldClaim
     */
    select?: Prisma.YieldClaimSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the YieldClaim
     */
    omit?: Prisma.YieldClaimOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.YieldClaimInclude<ExtArgs> | null;
    /**
     * The data needed to update a YieldClaim.
     */
    data: Prisma.XOR<Prisma.YieldClaimUpdateInput, Prisma.YieldClaimUncheckedUpdateInput>;
    /**
     * Choose, which YieldClaim to update.
     */
    where: Prisma.YieldClaimWhereUniqueInput;
};
/**
 * YieldClaim updateMany
 */
export type YieldClaimUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update YieldClaims.
     */
    data: Prisma.XOR<Prisma.YieldClaimUpdateManyMutationInput, Prisma.YieldClaimUncheckedUpdateManyInput>;
    /**
     * Filter which YieldClaims to update
     */
    where?: Prisma.YieldClaimWhereInput;
    /**
     * Limit how many YieldClaims to update.
     */
    limit?: number;
};
/**
 * YieldClaim updateManyAndReturn
 */
export type YieldClaimUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YieldClaim
     */
    select?: Prisma.YieldClaimSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the YieldClaim
     */
    omit?: Prisma.YieldClaimOmit<ExtArgs> | null;
    /**
     * The data used to update YieldClaims.
     */
    data: Prisma.XOR<Prisma.YieldClaimUpdateManyMutationInput, Prisma.YieldClaimUncheckedUpdateManyInput>;
    /**
     * Filter which YieldClaims to update
     */
    where?: Prisma.YieldClaimWhereInput;
    /**
     * Limit how many YieldClaims to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.YieldClaimIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * YieldClaim upsert
 */
export type YieldClaimUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YieldClaim
     */
    select?: Prisma.YieldClaimSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the YieldClaim
     */
    omit?: Prisma.YieldClaimOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.YieldClaimInclude<ExtArgs> | null;
    /**
     * The filter to search for the YieldClaim to update in case it exists.
     */
    where: Prisma.YieldClaimWhereUniqueInput;
    /**
     * In case the YieldClaim found by the `where` argument doesn't exist, create a new YieldClaim with this data.
     */
    create: Prisma.XOR<Prisma.YieldClaimCreateInput, Prisma.YieldClaimUncheckedCreateInput>;
    /**
     * In case the YieldClaim was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.YieldClaimUpdateInput, Prisma.YieldClaimUncheckedUpdateInput>;
};
/**
 * YieldClaim delete
 */
export type YieldClaimDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YieldClaim
     */
    select?: Prisma.YieldClaimSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the YieldClaim
     */
    omit?: Prisma.YieldClaimOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.YieldClaimInclude<ExtArgs> | null;
    /**
     * Filter which YieldClaim to delete.
     */
    where: Prisma.YieldClaimWhereUniqueInput;
};
/**
 * YieldClaim deleteMany
 */
export type YieldClaimDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which YieldClaims to delete
     */
    where?: Prisma.YieldClaimWhereInput;
    /**
     * Limit how many YieldClaims to delete.
     */
    limit?: number;
};
/**
 * YieldClaim without action
 */
export type YieldClaimDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YieldClaim
     */
    select?: Prisma.YieldClaimSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the YieldClaim
     */
    omit?: Prisma.YieldClaimOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.YieldClaimInclude<ExtArgs> | null;
};
export {};
//# sourceMappingURL=YieldClaim.d.ts.map