import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model YieldDistribution
 *
 */
export type YieldDistributionModel = runtime.Types.Result.DefaultSelection<Prisma.$YieldDistributionPayload>;
export type AggregateYieldDistribution = {
    _count: YieldDistributionCountAggregateOutputType | null;
    _avg: YieldDistributionAvgAggregateOutputType | null;
    _sum: YieldDistributionSumAggregateOutputType | null;
    _min: YieldDistributionMinAggregateOutputType | null;
    _max: YieldDistributionMaxAggregateOutputType | null;
};
export type YieldDistributionAvgAggregateOutputType = {
    totalRental: number | null;
};
export type YieldDistributionSumAggregateOutputType = {
    totalRental: bigint | null;
};
export type YieldDistributionMinAggregateOutputType = {
    id: string | null;
    propertyId: string | null;
    periodStart: Date | null;
    periodEnd: Date | null;
    totalRental: bigint | null;
    distributedAt: Date | null;
    txSignature: string | null;
};
export type YieldDistributionMaxAggregateOutputType = {
    id: string | null;
    propertyId: string | null;
    periodStart: Date | null;
    periodEnd: Date | null;
    totalRental: bigint | null;
    distributedAt: Date | null;
    txSignature: string | null;
};
export type YieldDistributionCountAggregateOutputType = {
    id: number;
    propertyId: number;
    periodStart: number;
    periodEnd: number;
    totalRental: number;
    distributedAt: number;
    txSignature: number;
    _all: number;
};
export type YieldDistributionAvgAggregateInputType = {
    totalRental?: true;
};
export type YieldDistributionSumAggregateInputType = {
    totalRental?: true;
};
export type YieldDistributionMinAggregateInputType = {
    id?: true;
    propertyId?: true;
    periodStart?: true;
    periodEnd?: true;
    totalRental?: true;
    distributedAt?: true;
    txSignature?: true;
};
export type YieldDistributionMaxAggregateInputType = {
    id?: true;
    propertyId?: true;
    periodStart?: true;
    periodEnd?: true;
    totalRental?: true;
    distributedAt?: true;
    txSignature?: true;
};
export type YieldDistributionCountAggregateInputType = {
    id?: true;
    propertyId?: true;
    periodStart?: true;
    periodEnd?: true;
    totalRental?: true;
    distributedAt?: true;
    txSignature?: true;
    _all?: true;
};
export type YieldDistributionAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which YieldDistribution to aggregate.
     */
    where?: Prisma.YieldDistributionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of YieldDistributions to fetch.
     */
    orderBy?: Prisma.YieldDistributionOrderByWithRelationInput | Prisma.YieldDistributionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.YieldDistributionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` YieldDistributions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` YieldDistributions.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned YieldDistributions
    **/
    _count?: true | YieldDistributionCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: YieldDistributionAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: YieldDistributionSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: YieldDistributionMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: YieldDistributionMaxAggregateInputType;
};
export type GetYieldDistributionAggregateType<T extends YieldDistributionAggregateArgs> = {
    [P in keyof T & keyof AggregateYieldDistribution]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateYieldDistribution[P]> : Prisma.GetScalarType<T[P], AggregateYieldDistribution[P]>;
};
export type YieldDistributionGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.YieldDistributionWhereInput;
    orderBy?: Prisma.YieldDistributionOrderByWithAggregationInput | Prisma.YieldDistributionOrderByWithAggregationInput[];
    by: Prisma.YieldDistributionScalarFieldEnum[] | Prisma.YieldDistributionScalarFieldEnum;
    having?: Prisma.YieldDistributionScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: YieldDistributionCountAggregateInputType | true;
    _avg?: YieldDistributionAvgAggregateInputType;
    _sum?: YieldDistributionSumAggregateInputType;
    _min?: YieldDistributionMinAggregateInputType;
    _max?: YieldDistributionMaxAggregateInputType;
};
export type YieldDistributionGroupByOutputType = {
    id: string;
    propertyId: string;
    periodStart: Date;
    periodEnd: Date;
    totalRental: bigint;
    distributedAt: Date;
    txSignature: string;
    _count: YieldDistributionCountAggregateOutputType | null;
    _avg: YieldDistributionAvgAggregateOutputType | null;
    _sum: YieldDistributionSumAggregateOutputType | null;
    _min: YieldDistributionMinAggregateOutputType | null;
    _max: YieldDistributionMaxAggregateOutputType | null;
};
type GetYieldDistributionGroupByPayload<T extends YieldDistributionGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<YieldDistributionGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof YieldDistributionGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], YieldDistributionGroupByOutputType[P]> : Prisma.GetScalarType<T[P], YieldDistributionGroupByOutputType[P]>;
}>>;
export type YieldDistributionWhereInput = {
    AND?: Prisma.YieldDistributionWhereInput | Prisma.YieldDistributionWhereInput[];
    OR?: Prisma.YieldDistributionWhereInput[];
    NOT?: Prisma.YieldDistributionWhereInput | Prisma.YieldDistributionWhereInput[];
    id?: Prisma.StringFilter<"YieldDistribution"> | string;
    propertyId?: Prisma.StringFilter<"YieldDistribution"> | string;
    periodStart?: Prisma.DateTimeFilter<"YieldDistribution"> | Date | string;
    periodEnd?: Prisma.DateTimeFilter<"YieldDistribution"> | Date | string;
    totalRental?: Prisma.BigIntFilter<"YieldDistribution"> | bigint | number;
    distributedAt?: Prisma.DateTimeFilter<"YieldDistribution"> | Date | string;
    txSignature?: Prisma.StringFilter<"YieldDistribution"> | string;
    property?: Prisma.XOR<Prisma.PropertyScalarRelationFilter, Prisma.PropertyWhereInput>;
    yieldClaims?: Prisma.YieldClaimListRelationFilter;
};
export type YieldDistributionOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    propertyId?: Prisma.SortOrder;
    periodStart?: Prisma.SortOrder;
    periodEnd?: Prisma.SortOrder;
    totalRental?: Prisma.SortOrder;
    distributedAt?: Prisma.SortOrder;
    txSignature?: Prisma.SortOrder;
    property?: Prisma.PropertyOrderByWithRelationInput;
    yieldClaims?: Prisma.YieldClaimOrderByRelationAggregateInput;
};
export type YieldDistributionWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.YieldDistributionWhereInput | Prisma.YieldDistributionWhereInput[];
    OR?: Prisma.YieldDistributionWhereInput[];
    NOT?: Prisma.YieldDistributionWhereInput | Prisma.YieldDistributionWhereInput[];
    propertyId?: Prisma.StringFilter<"YieldDistribution"> | string;
    periodStart?: Prisma.DateTimeFilter<"YieldDistribution"> | Date | string;
    periodEnd?: Prisma.DateTimeFilter<"YieldDistribution"> | Date | string;
    totalRental?: Prisma.BigIntFilter<"YieldDistribution"> | bigint | number;
    distributedAt?: Prisma.DateTimeFilter<"YieldDistribution"> | Date | string;
    txSignature?: Prisma.StringFilter<"YieldDistribution"> | string;
    property?: Prisma.XOR<Prisma.PropertyScalarRelationFilter, Prisma.PropertyWhereInput>;
    yieldClaims?: Prisma.YieldClaimListRelationFilter;
}, "id">;
export type YieldDistributionOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    propertyId?: Prisma.SortOrder;
    periodStart?: Prisma.SortOrder;
    periodEnd?: Prisma.SortOrder;
    totalRental?: Prisma.SortOrder;
    distributedAt?: Prisma.SortOrder;
    txSignature?: Prisma.SortOrder;
    _count?: Prisma.YieldDistributionCountOrderByAggregateInput;
    _avg?: Prisma.YieldDistributionAvgOrderByAggregateInput;
    _max?: Prisma.YieldDistributionMaxOrderByAggregateInput;
    _min?: Prisma.YieldDistributionMinOrderByAggregateInput;
    _sum?: Prisma.YieldDistributionSumOrderByAggregateInput;
};
export type YieldDistributionScalarWhereWithAggregatesInput = {
    AND?: Prisma.YieldDistributionScalarWhereWithAggregatesInput | Prisma.YieldDistributionScalarWhereWithAggregatesInput[];
    OR?: Prisma.YieldDistributionScalarWhereWithAggregatesInput[];
    NOT?: Prisma.YieldDistributionScalarWhereWithAggregatesInput | Prisma.YieldDistributionScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"YieldDistribution"> | string;
    propertyId?: Prisma.StringWithAggregatesFilter<"YieldDistribution"> | string;
    periodStart?: Prisma.DateTimeWithAggregatesFilter<"YieldDistribution"> | Date | string;
    periodEnd?: Prisma.DateTimeWithAggregatesFilter<"YieldDistribution"> | Date | string;
    totalRental?: Prisma.BigIntWithAggregatesFilter<"YieldDistribution"> | bigint | number;
    distributedAt?: Prisma.DateTimeWithAggregatesFilter<"YieldDistribution"> | Date | string;
    txSignature?: Prisma.StringWithAggregatesFilter<"YieldDistribution"> | string;
};
export type YieldDistributionCreateInput = {
    id?: string;
    periodStart: Date | string;
    periodEnd: Date | string;
    totalRental: bigint | number;
    distributedAt: Date | string;
    txSignature: string;
    property: Prisma.PropertyCreateNestedOneWithoutYieldDistributionsInput;
    yieldClaims?: Prisma.YieldClaimCreateNestedManyWithoutDistributionInput;
};
export type YieldDistributionUncheckedCreateInput = {
    id?: string;
    propertyId: string;
    periodStart: Date | string;
    periodEnd: Date | string;
    totalRental: bigint | number;
    distributedAt: Date | string;
    txSignature: string;
    yieldClaims?: Prisma.YieldClaimUncheckedCreateNestedManyWithoutDistributionInput;
};
export type YieldDistributionUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    periodStart?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    periodEnd?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    totalRental?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    distributedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    txSignature?: Prisma.StringFieldUpdateOperationsInput | string;
    property?: Prisma.PropertyUpdateOneRequiredWithoutYieldDistributionsNestedInput;
    yieldClaims?: Prisma.YieldClaimUpdateManyWithoutDistributionNestedInput;
};
export type YieldDistributionUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    propertyId?: Prisma.StringFieldUpdateOperationsInput | string;
    periodStart?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    periodEnd?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    totalRental?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    distributedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    txSignature?: Prisma.StringFieldUpdateOperationsInput | string;
    yieldClaims?: Prisma.YieldClaimUncheckedUpdateManyWithoutDistributionNestedInput;
};
export type YieldDistributionCreateManyInput = {
    id?: string;
    propertyId: string;
    periodStart: Date | string;
    periodEnd: Date | string;
    totalRental: bigint | number;
    distributedAt: Date | string;
    txSignature: string;
};
export type YieldDistributionUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    periodStart?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    periodEnd?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    totalRental?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    distributedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    txSignature?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type YieldDistributionUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    propertyId?: Prisma.StringFieldUpdateOperationsInput | string;
    periodStart?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    periodEnd?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    totalRental?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    distributedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    txSignature?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type YieldDistributionListRelationFilter = {
    every?: Prisma.YieldDistributionWhereInput;
    some?: Prisma.YieldDistributionWhereInput;
    none?: Prisma.YieldDistributionWhereInput;
};
export type YieldDistributionOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type YieldDistributionCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    propertyId?: Prisma.SortOrder;
    periodStart?: Prisma.SortOrder;
    periodEnd?: Prisma.SortOrder;
    totalRental?: Prisma.SortOrder;
    distributedAt?: Prisma.SortOrder;
    txSignature?: Prisma.SortOrder;
};
export type YieldDistributionAvgOrderByAggregateInput = {
    totalRental?: Prisma.SortOrder;
};
export type YieldDistributionMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    propertyId?: Prisma.SortOrder;
    periodStart?: Prisma.SortOrder;
    periodEnd?: Prisma.SortOrder;
    totalRental?: Prisma.SortOrder;
    distributedAt?: Prisma.SortOrder;
    txSignature?: Prisma.SortOrder;
};
export type YieldDistributionMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    propertyId?: Prisma.SortOrder;
    periodStart?: Prisma.SortOrder;
    periodEnd?: Prisma.SortOrder;
    totalRental?: Prisma.SortOrder;
    distributedAt?: Prisma.SortOrder;
    txSignature?: Prisma.SortOrder;
};
export type YieldDistributionSumOrderByAggregateInput = {
    totalRental?: Prisma.SortOrder;
};
export type YieldDistributionScalarRelationFilter = {
    is?: Prisma.YieldDistributionWhereInput;
    isNot?: Prisma.YieldDistributionWhereInput;
};
export type YieldDistributionCreateNestedManyWithoutPropertyInput = {
    create?: Prisma.XOR<Prisma.YieldDistributionCreateWithoutPropertyInput, Prisma.YieldDistributionUncheckedCreateWithoutPropertyInput> | Prisma.YieldDistributionCreateWithoutPropertyInput[] | Prisma.YieldDistributionUncheckedCreateWithoutPropertyInput[];
    connectOrCreate?: Prisma.YieldDistributionCreateOrConnectWithoutPropertyInput | Prisma.YieldDistributionCreateOrConnectWithoutPropertyInput[];
    createMany?: Prisma.YieldDistributionCreateManyPropertyInputEnvelope;
    connect?: Prisma.YieldDistributionWhereUniqueInput | Prisma.YieldDistributionWhereUniqueInput[];
};
export type YieldDistributionUncheckedCreateNestedManyWithoutPropertyInput = {
    create?: Prisma.XOR<Prisma.YieldDistributionCreateWithoutPropertyInput, Prisma.YieldDistributionUncheckedCreateWithoutPropertyInput> | Prisma.YieldDistributionCreateWithoutPropertyInput[] | Prisma.YieldDistributionUncheckedCreateWithoutPropertyInput[];
    connectOrCreate?: Prisma.YieldDistributionCreateOrConnectWithoutPropertyInput | Prisma.YieldDistributionCreateOrConnectWithoutPropertyInput[];
    createMany?: Prisma.YieldDistributionCreateManyPropertyInputEnvelope;
    connect?: Prisma.YieldDistributionWhereUniqueInput | Prisma.YieldDistributionWhereUniqueInput[];
};
export type YieldDistributionUpdateManyWithoutPropertyNestedInput = {
    create?: Prisma.XOR<Prisma.YieldDistributionCreateWithoutPropertyInput, Prisma.YieldDistributionUncheckedCreateWithoutPropertyInput> | Prisma.YieldDistributionCreateWithoutPropertyInput[] | Prisma.YieldDistributionUncheckedCreateWithoutPropertyInput[];
    connectOrCreate?: Prisma.YieldDistributionCreateOrConnectWithoutPropertyInput | Prisma.YieldDistributionCreateOrConnectWithoutPropertyInput[];
    upsert?: Prisma.YieldDistributionUpsertWithWhereUniqueWithoutPropertyInput | Prisma.YieldDistributionUpsertWithWhereUniqueWithoutPropertyInput[];
    createMany?: Prisma.YieldDistributionCreateManyPropertyInputEnvelope;
    set?: Prisma.YieldDistributionWhereUniqueInput | Prisma.YieldDistributionWhereUniqueInput[];
    disconnect?: Prisma.YieldDistributionWhereUniqueInput | Prisma.YieldDistributionWhereUniqueInput[];
    delete?: Prisma.YieldDistributionWhereUniqueInput | Prisma.YieldDistributionWhereUniqueInput[];
    connect?: Prisma.YieldDistributionWhereUniqueInput | Prisma.YieldDistributionWhereUniqueInput[];
    update?: Prisma.YieldDistributionUpdateWithWhereUniqueWithoutPropertyInput | Prisma.YieldDistributionUpdateWithWhereUniqueWithoutPropertyInput[];
    updateMany?: Prisma.YieldDistributionUpdateManyWithWhereWithoutPropertyInput | Prisma.YieldDistributionUpdateManyWithWhereWithoutPropertyInput[];
    deleteMany?: Prisma.YieldDistributionScalarWhereInput | Prisma.YieldDistributionScalarWhereInput[];
};
export type YieldDistributionUncheckedUpdateManyWithoutPropertyNestedInput = {
    create?: Prisma.XOR<Prisma.YieldDistributionCreateWithoutPropertyInput, Prisma.YieldDistributionUncheckedCreateWithoutPropertyInput> | Prisma.YieldDistributionCreateWithoutPropertyInput[] | Prisma.YieldDistributionUncheckedCreateWithoutPropertyInput[];
    connectOrCreate?: Prisma.YieldDistributionCreateOrConnectWithoutPropertyInput | Prisma.YieldDistributionCreateOrConnectWithoutPropertyInput[];
    upsert?: Prisma.YieldDistributionUpsertWithWhereUniqueWithoutPropertyInput | Prisma.YieldDistributionUpsertWithWhereUniqueWithoutPropertyInput[];
    createMany?: Prisma.YieldDistributionCreateManyPropertyInputEnvelope;
    set?: Prisma.YieldDistributionWhereUniqueInput | Prisma.YieldDistributionWhereUniqueInput[];
    disconnect?: Prisma.YieldDistributionWhereUniqueInput | Prisma.YieldDistributionWhereUniqueInput[];
    delete?: Prisma.YieldDistributionWhereUniqueInput | Prisma.YieldDistributionWhereUniqueInput[];
    connect?: Prisma.YieldDistributionWhereUniqueInput | Prisma.YieldDistributionWhereUniqueInput[];
    update?: Prisma.YieldDistributionUpdateWithWhereUniqueWithoutPropertyInput | Prisma.YieldDistributionUpdateWithWhereUniqueWithoutPropertyInput[];
    updateMany?: Prisma.YieldDistributionUpdateManyWithWhereWithoutPropertyInput | Prisma.YieldDistributionUpdateManyWithWhereWithoutPropertyInput[];
    deleteMany?: Prisma.YieldDistributionScalarWhereInput | Prisma.YieldDistributionScalarWhereInput[];
};
export type YieldDistributionCreateNestedOneWithoutYieldClaimsInput = {
    create?: Prisma.XOR<Prisma.YieldDistributionCreateWithoutYieldClaimsInput, Prisma.YieldDistributionUncheckedCreateWithoutYieldClaimsInput>;
    connectOrCreate?: Prisma.YieldDistributionCreateOrConnectWithoutYieldClaimsInput;
    connect?: Prisma.YieldDistributionWhereUniqueInput;
};
export type YieldDistributionUpdateOneRequiredWithoutYieldClaimsNestedInput = {
    create?: Prisma.XOR<Prisma.YieldDistributionCreateWithoutYieldClaimsInput, Prisma.YieldDistributionUncheckedCreateWithoutYieldClaimsInput>;
    connectOrCreate?: Prisma.YieldDistributionCreateOrConnectWithoutYieldClaimsInput;
    upsert?: Prisma.YieldDistributionUpsertWithoutYieldClaimsInput;
    connect?: Prisma.YieldDistributionWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.YieldDistributionUpdateToOneWithWhereWithoutYieldClaimsInput, Prisma.YieldDistributionUpdateWithoutYieldClaimsInput>, Prisma.YieldDistributionUncheckedUpdateWithoutYieldClaimsInput>;
};
export type YieldDistributionCreateWithoutPropertyInput = {
    id?: string;
    periodStart: Date | string;
    periodEnd: Date | string;
    totalRental: bigint | number;
    distributedAt: Date | string;
    txSignature: string;
    yieldClaims?: Prisma.YieldClaimCreateNestedManyWithoutDistributionInput;
};
export type YieldDistributionUncheckedCreateWithoutPropertyInput = {
    id?: string;
    periodStart: Date | string;
    periodEnd: Date | string;
    totalRental: bigint | number;
    distributedAt: Date | string;
    txSignature: string;
    yieldClaims?: Prisma.YieldClaimUncheckedCreateNestedManyWithoutDistributionInput;
};
export type YieldDistributionCreateOrConnectWithoutPropertyInput = {
    where: Prisma.YieldDistributionWhereUniqueInput;
    create: Prisma.XOR<Prisma.YieldDistributionCreateWithoutPropertyInput, Prisma.YieldDistributionUncheckedCreateWithoutPropertyInput>;
};
export type YieldDistributionCreateManyPropertyInputEnvelope = {
    data: Prisma.YieldDistributionCreateManyPropertyInput | Prisma.YieldDistributionCreateManyPropertyInput[];
    skipDuplicates?: boolean;
};
export type YieldDistributionUpsertWithWhereUniqueWithoutPropertyInput = {
    where: Prisma.YieldDistributionWhereUniqueInput;
    update: Prisma.XOR<Prisma.YieldDistributionUpdateWithoutPropertyInput, Prisma.YieldDistributionUncheckedUpdateWithoutPropertyInput>;
    create: Prisma.XOR<Prisma.YieldDistributionCreateWithoutPropertyInput, Prisma.YieldDistributionUncheckedCreateWithoutPropertyInput>;
};
export type YieldDistributionUpdateWithWhereUniqueWithoutPropertyInput = {
    where: Prisma.YieldDistributionWhereUniqueInput;
    data: Prisma.XOR<Prisma.YieldDistributionUpdateWithoutPropertyInput, Prisma.YieldDistributionUncheckedUpdateWithoutPropertyInput>;
};
export type YieldDistributionUpdateManyWithWhereWithoutPropertyInput = {
    where: Prisma.YieldDistributionScalarWhereInput;
    data: Prisma.XOR<Prisma.YieldDistributionUpdateManyMutationInput, Prisma.YieldDistributionUncheckedUpdateManyWithoutPropertyInput>;
};
export type YieldDistributionScalarWhereInput = {
    AND?: Prisma.YieldDistributionScalarWhereInput | Prisma.YieldDistributionScalarWhereInput[];
    OR?: Prisma.YieldDistributionScalarWhereInput[];
    NOT?: Prisma.YieldDistributionScalarWhereInput | Prisma.YieldDistributionScalarWhereInput[];
    id?: Prisma.StringFilter<"YieldDistribution"> | string;
    propertyId?: Prisma.StringFilter<"YieldDistribution"> | string;
    periodStart?: Prisma.DateTimeFilter<"YieldDistribution"> | Date | string;
    periodEnd?: Prisma.DateTimeFilter<"YieldDistribution"> | Date | string;
    totalRental?: Prisma.BigIntFilter<"YieldDistribution"> | bigint | number;
    distributedAt?: Prisma.DateTimeFilter<"YieldDistribution"> | Date | string;
    txSignature?: Prisma.StringFilter<"YieldDistribution"> | string;
};
export type YieldDistributionCreateWithoutYieldClaimsInput = {
    id?: string;
    periodStart: Date | string;
    periodEnd: Date | string;
    totalRental: bigint | number;
    distributedAt: Date | string;
    txSignature: string;
    property: Prisma.PropertyCreateNestedOneWithoutYieldDistributionsInput;
};
export type YieldDistributionUncheckedCreateWithoutYieldClaimsInput = {
    id?: string;
    propertyId: string;
    periodStart: Date | string;
    periodEnd: Date | string;
    totalRental: bigint | number;
    distributedAt: Date | string;
    txSignature: string;
};
export type YieldDistributionCreateOrConnectWithoutYieldClaimsInput = {
    where: Prisma.YieldDistributionWhereUniqueInput;
    create: Prisma.XOR<Prisma.YieldDistributionCreateWithoutYieldClaimsInput, Prisma.YieldDistributionUncheckedCreateWithoutYieldClaimsInput>;
};
export type YieldDistributionUpsertWithoutYieldClaimsInput = {
    update: Prisma.XOR<Prisma.YieldDistributionUpdateWithoutYieldClaimsInput, Prisma.YieldDistributionUncheckedUpdateWithoutYieldClaimsInput>;
    create: Prisma.XOR<Prisma.YieldDistributionCreateWithoutYieldClaimsInput, Prisma.YieldDistributionUncheckedCreateWithoutYieldClaimsInput>;
    where?: Prisma.YieldDistributionWhereInput;
};
export type YieldDistributionUpdateToOneWithWhereWithoutYieldClaimsInput = {
    where?: Prisma.YieldDistributionWhereInput;
    data: Prisma.XOR<Prisma.YieldDistributionUpdateWithoutYieldClaimsInput, Prisma.YieldDistributionUncheckedUpdateWithoutYieldClaimsInput>;
};
export type YieldDistributionUpdateWithoutYieldClaimsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    periodStart?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    periodEnd?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    totalRental?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    distributedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    txSignature?: Prisma.StringFieldUpdateOperationsInput | string;
    property?: Prisma.PropertyUpdateOneRequiredWithoutYieldDistributionsNestedInput;
};
export type YieldDistributionUncheckedUpdateWithoutYieldClaimsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    propertyId?: Prisma.StringFieldUpdateOperationsInput | string;
    periodStart?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    periodEnd?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    totalRental?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    distributedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    txSignature?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type YieldDistributionCreateManyPropertyInput = {
    id?: string;
    periodStart: Date | string;
    periodEnd: Date | string;
    totalRental: bigint | number;
    distributedAt: Date | string;
    txSignature: string;
};
export type YieldDistributionUpdateWithoutPropertyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    periodStart?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    periodEnd?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    totalRental?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    distributedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    txSignature?: Prisma.StringFieldUpdateOperationsInput | string;
    yieldClaims?: Prisma.YieldClaimUpdateManyWithoutDistributionNestedInput;
};
export type YieldDistributionUncheckedUpdateWithoutPropertyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    periodStart?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    periodEnd?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    totalRental?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    distributedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    txSignature?: Prisma.StringFieldUpdateOperationsInput | string;
    yieldClaims?: Prisma.YieldClaimUncheckedUpdateManyWithoutDistributionNestedInput;
};
export type YieldDistributionUncheckedUpdateManyWithoutPropertyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    periodStart?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    periodEnd?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    totalRental?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    distributedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    txSignature?: Prisma.StringFieldUpdateOperationsInput | string;
};
/**
 * Count Type YieldDistributionCountOutputType
 */
export type YieldDistributionCountOutputType = {
    yieldClaims: number;
};
export type YieldDistributionCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    yieldClaims?: boolean | YieldDistributionCountOutputTypeCountYieldClaimsArgs;
};
/**
 * YieldDistributionCountOutputType without action
 */
export type YieldDistributionCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YieldDistributionCountOutputType
     */
    select?: Prisma.YieldDistributionCountOutputTypeSelect<ExtArgs> | null;
};
/**
 * YieldDistributionCountOutputType without action
 */
export type YieldDistributionCountOutputTypeCountYieldClaimsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.YieldClaimWhereInput;
};
export type YieldDistributionSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    propertyId?: boolean;
    periodStart?: boolean;
    periodEnd?: boolean;
    totalRental?: boolean;
    distributedAt?: boolean;
    txSignature?: boolean;
    property?: boolean | Prisma.PropertyDefaultArgs<ExtArgs>;
    yieldClaims?: boolean | Prisma.YieldDistribution$yieldClaimsArgs<ExtArgs>;
    _count?: boolean | Prisma.YieldDistributionCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["yieldDistribution"]>;
export type YieldDistributionSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    propertyId?: boolean;
    periodStart?: boolean;
    periodEnd?: boolean;
    totalRental?: boolean;
    distributedAt?: boolean;
    txSignature?: boolean;
    property?: boolean | Prisma.PropertyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["yieldDistribution"]>;
export type YieldDistributionSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    propertyId?: boolean;
    periodStart?: boolean;
    periodEnd?: boolean;
    totalRental?: boolean;
    distributedAt?: boolean;
    txSignature?: boolean;
    property?: boolean | Prisma.PropertyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["yieldDistribution"]>;
export type YieldDistributionSelectScalar = {
    id?: boolean;
    propertyId?: boolean;
    periodStart?: boolean;
    periodEnd?: boolean;
    totalRental?: boolean;
    distributedAt?: boolean;
    txSignature?: boolean;
};
export type YieldDistributionOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "propertyId" | "periodStart" | "periodEnd" | "totalRental" | "distributedAt" | "txSignature", ExtArgs["result"]["yieldDistribution"]>;
export type YieldDistributionInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    property?: boolean | Prisma.PropertyDefaultArgs<ExtArgs>;
    yieldClaims?: boolean | Prisma.YieldDistribution$yieldClaimsArgs<ExtArgs>;
    _count?: boolean | Prisma.YieldDistributionCountOutputTypeDefaultArgs<ExtArgs>;
};
export type YieldDistributionIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    property?: boolean | Prisma.PropertyDefaultArgs<ExtArgs>;
};
export type YieldDistributionIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    property?: boolean | Prisma.PropertyDefaultArgs<ExtArgs>;
};
export type $YieldDistributionPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "YieldDistribution";
    objects: {
        property: Prisma.$PropertyPayload<ExtArgs>;
        yieldClaims: Prisma.$YieldClaimPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        propertyId: string;
        periodStart: Date;
        periodEnd: Date;
        totalRental: bigint;
        distributedAt: Date;
        txSignature: string;
    }, ExtArgs["result"]["yieldDistribution"]>;
    composites: {};
};
export type YieldDistributionGetPayload<S extends boolean | null | undefined | YieldDistributionDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$YieldDistributionPayload, S>;
export type YieldDistributionCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<YieldDistributionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: YieldDistributionCountAggregateInputType | true;
};
export interface YieldDistributionDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['YieldDistribution'];
        meta: {
            name: 'YieldDistribution';
        };
    };
    /**
     * Find zero or one YieldDistribution that matches the filter.
     * @param {YieldDistributionFindUniqueArgs} args - Arguments to find a YieldDistribution
     * @example
     * // Get one YieldDistribution
     * const yieldDistribution = await prisma.yieldDistribution.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends YieldDistributionFindUniqueArgs>(args: Prisma.SelectSubset<T, YieldDistributionFindUniqueArgs<ExtArgs>>): Prisma.Prisma__YieldDistributionClient<runtime.Types.Result.GetResult<Prisma.$YieldDistributionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one YieldDistribution that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {YieldDistributionFindUniqueOrThrowArgs} args - Arguments to find a YieldDistribution
     * @example
     * // Get one YieldDistribution
     * const yieldDistribution = await prisma.yieldDistribution.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends YieldDistributionFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, YieldDistributionFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__YieldDistributionClient<runtime.Types.Result.GetResult<Prisma.$YieldDistributionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first YieldDistribution that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YieldDistributionFindFirstArgs} args - Arguments to find a YieldDistribution
     * @example
     * // Get one YieldDistribution
     * const yieldDistribution = await prisma.yieldDistribution.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends YieldDistributionFindFirstArgs>(args?: Prisma.SelectSubset<T, YieldDistributionFindFirstArgs<ExtArgs>>): Prisma.Prisma__YieldDistributionClient<runtime.Types.Result.GetResult<Prisma.$YieldDistributionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first YieldDistribution that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YieldDistributionFindFirstOrThrowArgs} args - Arguments to find a YieldDistribution
     * @example
     * // Get one YieldDistribution
     * const yieldDistribution = await prisma.yieldDistribution.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends YieldDistributionFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, YieldDistributionFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__YieldDistributionClient<runtime.Types.Result.GetResult<Prisma.$YieldDistributionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more YieldDistributions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YieldDistributionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all YieldDistributions
     * const yieldDistributions = await prisma.yieldDistribution.findMany()
     *
     * // Get first 10 YieldDistributions
     * const yieldDistributions = await prisma.yieldDistribution.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const yieldDistributionWithIdOnly = await prisma.yieldDistribution.findMany({ select: { id: true } })
     *
     */
    findMany<T extends YieldDistributionFindManyArgs>(args?: Prisma.SelectSubset<T, YieldDistributionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$YieldDistributionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a YieldDistribution.
     * @param {YieldDistributionCreateArgs} args - Arguments to create a YieldDistribution.
     * @example
     * // Create one YieldDistribution
     * const YieldDistribution = await prisma.yieldDistribution.create({
     *   data: {
     *     // ... data to create a YieldDistribution
     *   }
     * })
     *
     */
    create<T extends YieldDistributionCreateArgs>(args: Prisma.SelectSubset<T, YieldDistributionCreateArgs<ExtArgs>>): Prisma.Prisma__YieldDistributionClient<runtime.Types.Result.GetResult<Prisma.$YieldDistributionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many YieldDistributions.
     * @param {YieldDistributionCreateManyArgs} args - Arguments to create many YieldDistributions.
     * @example
     * // Create many YieldDistributions
     * const yieldDistribution = await prisma.yieldDistribution.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends YieldDistributionCreateManyArgs>(args?: Prisma.SelectSubset<T, YieldDistributionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many YieldDistributions and returns the data saved in the database.
     * @param {YieldDistributionCreateManyAndReturnArgs} args - Arguments to create many YieldDistributions.
     * @example
     * // Create many YieldDistributions
     * const yieldDistribution = await prisma.yieldDistribution.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many YieldDistributions and only return the `id`
     * const yieldDistributionWithIdOnly = await prisma.yieldDistribution.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends YieldDistributionCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, YieldDistributionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$YieldDistributionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a YieldDistribution.
     * @param {YieldDistributionDeleteArgs} args - Arguments to delete one YieldDistribution.
     * @example
     * // Delete one YieldDistribution
     * const YieldDistribution = await prisma.yieldDistribution.delete({
     *   where: {
     *     // ... filter to delete one YieldDistribution
     *   }
     * })
     *
     */
    delete<T extends YieldDistributionDeleteArgs>(args: Prisma.SelectSubset<T, YieldDistributionDeleteArgs<ExtArgs>>): Prisma.Prisma__YieldDistributionClient<runtime.Types.Result.GetResult<Prisma.$YieldDistributionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one YieldDistribution.
     * @param {YieldDistributionUpdateArgs} args - Arguments to update one YieldDistribution.
     * @example
     * // Update one YieldDistribution
     * const yieldDistribution = await prisma.yieldDistribution.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends YieldDistributionUpdateArgs>(args: Prisma.SelectSubset<T, YieldDistributionUpdateArgs<ExtArgs>>): Prisma.Prisma__YieldDistributionClient<runtime.Types.Result.GetResult<Prisma.$YieldDistributionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more YieldDistributions.
     * @param {YieldDistributionDeleteManyArgs} args - Arguments to filter YieldDistributions to delete.
     * @example
     * // Delete a few YieldDistributions
     * const { count } = await prisma.yieldDistribution.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends YieldDistributionDeleteManyArgs>(args?: Prisma.SelectSubset<T, YieldDistributionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more YieldDistributions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YieldDistributionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many YieldDistributions
     * const yieldDistribution = await prisma.yieldDistribution.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends YieldDistributionUpdateManyArgs>(args: Prisma.SelectSubset<T, YieldDistributionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more YieldDistributions and returns the data updated in the database.
     * @param {YieldDistributionUpdateManyAndReturnArgs} args - Arguments to update many YieldDistributions.
     * @example
     * // Update many YieldDistributions
     * const yieldDistribution = await prisma.yieldDistribution.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more YieldDistributions and only return the `id`
     * const yieldDistributionWithIdOnly = await prisma.yieldDistribution.updateManyAndReturn({
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
    updateManyAndReturn<T extends YieldDistributionUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, YieldDistributionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$YieldDistributionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one YieldDistribution.
     * @param {YieldDistributionUpsertArgs} args - Arguments to update or create a YieldDistribution.
     * @example
     * // Update or create a YieldDistribution
     * const yieldDistribution = await prisma.yieldDistribution.upsert({
     *   create: {
     *     // ... data to create a YieldDistribution
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the YieldDistribution we want to update
     *   }
     * })
     */
    upsert<T extends YieldDistributionUpsertArgs>(args: Prisma.SelectSubset<T, YieldDistributionUpsertArgs<ExtArgs>>): Prisma.Prisma__YieldDistributionClient<runtime.Types.Result.GetResult<Prisma.$YieldDistributionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of YieldDistributions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YieldDistributionCountArgs} args - Arguments to filter YieldDistributions to count.
     * @example
     * // Count the number of YieldDistributions
     * const count = await prisma.yieldDistribution.count({
     *   where: {
     *     // ... the filter for the YieldDistributions we want to count
     *   }
     * })
    **/
    count<T extends YieldDistributionCountArgs>(args?: Prisma.Subset<T, YieldDistributionCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], YieldDistributionCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a YieldDistribution.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YieldDistributionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends YieldDistributionAggregateArgs>(args: Prisma.Subset<T, YieldDistributionAggregateArgs>): Prisma.PrismaPromise<GetYieldDistributionAggregateType<T>>;
    /**
     * Group by YieldDistribution.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {YieldDistributionGroupByArgs} args - Group by arguments.
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
    groupBy<T extends YieldDistributionGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: YieldDistributionGroupByArgs['orderBy'];
    } : {
        orderBy?: YieldDistributionGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, YieldDistributionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetYieldDistributionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the YieldDistribution model
     */
    readonly fields: YieldDistributionFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for YieldDistribution.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__YieldDistributionClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    property<T extends Prisma.PropertyDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.PropertyDefaultArgs<ExtArgs>>): Prisma.Prisma__PropertyClient<runtime.Types.Result.GetResult<Prisma.$PropertyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    yieldClaims<T extends Prisma.YieldDistribution$yieldClaimsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.YieldDistribution$yieldClaimsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$YieldClaimPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
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
 * Fields of the YieldDistribution model
 */
export interface YieldDistributionFieldRefs {
    readonly id: Prisma.FieldRef<"YieldDistribution", 'String'>;
    readonly propertyId: Prisma.FieldRef<"YieldDistribution", 'String'>;
    readonly periodStart: Prisma.FieldRef<"YieldDistribution", 'DateTime'>;
    readonly periodEnd: Prisma.FieldRef<"YieldDistribution", 'DateTime'>;
    readonly totalRental: Prisma.FieldRef<"YieldDistribution", 'BigInt'>;
    readonly distributedAt: Prisma.FieldRef<"YieldDistribution", 'DateTime'>;
    readonly txSignature: Prisma.FieldRef<"YieldDistribution", 'String'>;
}
/**
 * YieldDistribution findUnique
 */
export type YieldDistributionFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YieldDistribution
     */
    select?: Prisma.YieldDistributionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the YieldDistribution
     */
    omit?: Prisma.YieldDistributionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.YieldDistributionInclude<ExtArgs> | null;
    /**
     * Filter, which YieldDistribution to fetch.
     */
    where: Prisma.YieldDistributionWhereUniqueInput;
};
/**
 * YieldDistribution findUniqueOrThrow
 */
export type YieldDistributionFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YieldDistribution
     */
    select?: Prisma.YieldDistributionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the YieldDistribution
     */
    omit?: Prisma.YieldDistributionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.YieldDistributionInclude<ExtArgs> | null;
    /**
     * Filter, which YieldDistribution to fetch.
     */
    where: Prisma.YieldDistributionWhereUniqueInput;
};
/**
 * YieldDistribution findFirst
 */
export type YieldDistributionFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YieldDistribution
     */
    select?: Prisma.YieldDistributionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the YieldDistribution
     */
    omit?: Prisma.YieldDistributionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.YieldDistributionInclude<ExtArgs> | null;
    /**
     * Filter, which YieldDistribution to fetch.
     */
    where?: Prisma.YieldDistributionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of YieldDistributions to fetch.
     */
    orderBy?: Prisma.YieldDistributionOrderByWithRelationInput | Prisma.YieldDistributionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for YieldDistributions.
     */
    cursor?: Prisma.YieldDistributionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` YieldDistributions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` YieldDistributions.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of YieldDistributions.
     */
    distinct?: Prisma.YieldDistributionScalarFieldEnum | Prisma.YieldDistributionScalarFieldEnum[];
};
/**
 * YieldDistribution findFirstOrThrow
 */
export type YieldDistributionFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YieldDistribution
     */
    select?: Prisma.YieldDistributionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the YieldDistribution
     */
    omit?: Prisma.YieldDistributionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.YieldDistributionInclude<ExtArgs> | null;
    /**
     * Filter, which YieldDistribution to fetch.
     */
    where?: Prisma.YieldDistributionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of YieldDistributions to fetch.
     */
    orderBy?: Prisma.YieldDistributionOrderByWithRelationInput | Prisma.YieldDistributionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for YieldDistributions.
     */
    cursor?: Prisma.YieldDistributionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` YieldDistributions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` YieldDistributions.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of YieldDistributions.
     */
    distinct?: Prisma.YieldDistributionScalarFieldEnum | Prisma.YieldDistributionScalarFieldEnum[];
};
/**
 * YieldDistribution findMany
 */
export type YieldDistributionFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YieldDistribution
     */
    select?: Prisma.YieldDistributionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the YieldDistribution
     */
    omit?: Prisma.YieldDistributionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.YieldDistributionInclude<ExtArgs> | null;
    /**
     * Filter, which YieldDistributions to fetch.
     */
    where?: Prisma.YieldDistributionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of YieldDistributions to fetch.
     */
    orderBy?: Prisma.YieldDistributionOrderByWithRelationInput | Prisma.YieldDistributionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing YieldDistributions.
     */
    cursor?: Prisma.YieldDistributionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` YieldDistributions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` YieldDistributions.
     */
    skip?: number;
    distinct?: Prisma.YieldDistributionScalarFieldEnum | Prisma.YieldDistributionScalarFieldEnum[];
};
/**
 * YieldDistribution create
 */
export type YieldDistributionCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YieldDistribution
     */
    select?: Prisma.YieldDistributionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the YieldDistribution
     */
    omit?: Prisma.YieldDistributionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.YieldDistributionInclude<ExtArgs> | null;
    /**
     * The data needed to create a YieldDistribution.
     */
    data: Prisma.XOR<Prisma.YieldDistributionCreateInput, Prisma.YieldDistributionUncheckedCreateInput>;
};
/**
 * YieldDistribution createMany
 */
export type YieldDistributionCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many YieldDistributions.
     */
    data: Prisma.YieldDistributionCreateManyInput | Prisma.YieldDistributionCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * YieldDistribution createManyAndReturn
 */
export type YieldDistributionCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YieldDistribution
     */
    select?: Prisma.YieldDistributionSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the YieldDistribution
     */
    omit?: Prisma.YieldDistributionOmit<ExtArgs> | null;
    /**
     * The data used to create many YieldDistributions.
     */
    data: Prisma.YieldDistributionCreateManyInput | Prisma.YieldDistributionCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.YieldDistributionIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * YieldDistribution update
 */
export type YieldDistributionUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YieldDistribution
     */
    select?: Prisma.YieldDistributionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the YieldDistribution
     */
    omit?: Prisma.YieldDistributionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.YieldDistributionInclude<ExtArgs> | null;
    /**
     * The data needed to update a YieldDistribution.
     */
    data: Prisma.XOR<Prisma.YieldDistributionUpdateInput, Prisma.YieldDistributionUncheckedUpdateInput>;
    /**
     * Choose, which YieldDistribution to update.
     */
    where: Prisma.YieldDistributionWhereUniqueInput;
};
/**
 * YieldDistribution updateMany
 */
export type YieldDistributionUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update YieldDistributions.
     */
    data: Prisma.XOR<Prisma.YieldDistributionUpdateManyMutationInput, Prisma.YieldDistributionUncheckedUpdateManyInput>;
    /**
     * Filter which YieldDistributions to update
     */
    where?: Prisma.YieldDistributionWhereInput;
    /**
     * Limit how many YieldDistributions to update.
     */
    limit?: number;
};
/**
 * YieldDistribution updateManyAndReturn
 */
export type YieldDistributionUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YieldDistribution
     */
    select?: Prisma.YieldDistributionSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the YieldDistribution
     */
    omit?: Prisma.YieldDistributionOmit<ExtArgs> | null;
    /**
     * The data used to update YieldDistributions.
     */
    data: Prisma.XOR<Prisma.YieldDistributionUpdateManyMutationInput, Prisma.YieldDistributionUncheckedUpdateManyInput>;
    /**
     * Filter which YieldDistributions to update
     */
    where?: Prisma.YieldDistributionWhereInput;
    /**
     * Limit how many YieldDistributions to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.YieldDistributionIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * YieldDistribution upsert
 */
export type YieldDistributionUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YieldDistribution
     */
    select?: Prisma.YieldDistributionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the YieldDistribution
     */
    omit?: Prisma.YieldDistributionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.YieldDistributionInclude<ExtArgs> | null;
    /**
     * The filter to search for the YieldDistribution to update in case it exists.
     */
    where: Prisma.YieldDistributionWhereUniqueInput;
    /**
     * In case the YieldDistribution found by the `where` argument doesn't exist, create a new YieldDistribution with this data.
     */
    create: Prisma.XOR<Prisma.YieldDistributionCreateInput, Prisma.YieldDistributionUncheckedCreateInput>;
    /**
     * In case the YieldDistribution was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.YieldDistributionUpdateInput, Prisma.YieldDistributionUncheckedUpdateInput>;
};
/**
 * YieldDistribution delete
 */
export type YieldDistributionDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YieldDistribution
     */
    select?: Prisma.YieldDistributionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the YieldDistribution
     */
    omit?: Prisma.YieldDistributionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.YieldDistributionInclude<ExtArgs> | null;
    /**
     * Filter which YieldDistribution to delete.
     */
    where: Prisma.YieldDistributionWhereUniqueInput;
};
/**
 * YieldDistribution deleteMany
 */
export type YieldDistributionDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which YieldDistributions to delete
     */
    where?: Prisma.YieldDistributionWhereInput;
    /**
     * Limit how many YieldDistributions to delete.
     */
    limit?: number;
};
/**
 * YieldDistribution.yieldClaims
 */
export type YieldDistribution$yieldClaimsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    where?: Prisma.YieldClaimWhereInput;
    orderBy?: Prisma.YieldClaimOrderByWithRelationInput | Prisma.YieldClaimOrderByWithRelationInput[];
    cursor?: Prisma.YieldClaimWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.YieldClaimScalarFieldEnum | Prisma.YieldClaimScalarFieldEnum[];
};
/**
 * YieldDistribution without action
 */
export type YieldDistributionDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the YieldDistribution
     */
    select?: Prisma.YieldDistributionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the YieldDistribution
     */
    omit?: Prisma.YieldDistributionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.YieldDistributionInclude<ExtArgs> | null;
};
export {};
//# sourceMappingURL=YieldDistribution.d.ts.map