import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model Investment
 *
 */
export type InvestmentModel = runtime.Types.Result.DefaultSelection<Prisma.$InvestmentPayload>;
export type AggregateInvestment = {
    _count: InvestmentCountAggregateOutputType | null;
    _avg: InvestmentAvgAggregateOutputType | null;
    _sum: InvestmentSumAggregateOutputType | null;
    _min: InvestmentMinAggregateOutputType | null;
    _max: InvestmentMaxAggregateOutputType | null;
};
export type InvestmentAvgAggregateOutputType = {
    sharesOwned: number | null;
    avgCostPerShare: runtime.Decimal | null;
    purchasePrice: number | null;
    currentValue: number | null;
    yieldEarned: number | null;
    claimableYield: number | null;
};
export type InvestmentSumAggregateOutputType = {
    sharesOwned: number | null;
    avgCostPerShare: runtime.Decimal | null;
    purchasePrice: bigint | null;
    currentValue: bigint | null;
    yieldEarned: bigint | null;
    claimableYield: bigint | null;
};
export type InvestmentMinAggregateOutputType = {
    id: string | null;
    userWallet: string | null;
    propertyId: string | null;
    sharesOwned: number | null;
    avgCostPerShare: runtime.Decimal | null;
    purchasePrice: bigint | null;
    currentValue: bigint | null;
    yieldEarned: bigint | null;
    claimableYield: bigint | null;
    lastYieldClaim: Date | null;
    tokenAccount: string | null;
    investedAt: Date | null;
};
export type InvestmentMaxAggregateOutputType = {
    id: string | null;
    userWallet: string | null;
    propertyId: string | null;
    sharesOwned: number | null;
    avgCostPerShare: runtime.Decimal | null;
    purchasePrice: bigint | null;
    currentValue: bigint | null;
    yieldEarned: bigint | null;
    claimableYield: bigint | null;
    lastYieldClaim: Date | null;
    tokenAccount: string | null;
    investedAt: Date | null;
};
export type InvestmentCountAggregateOutputType = {
    id: number;
    userWallet: number;
    propertyId: number;
    sharesOwned: number;
    avgCostPerShare: number;
    purchasePrice: number;
    currentValue: number;
    yieldEarned: number;
    claimableYield: number;
    lastYieldClaim: number;
    tokenAccount: number;
    investedAt: number;
    _all: number;
};
export type InvestmentAvgAggregateInputType = {
    sharesOwned?: true;
    avgCostPerShare?: true;
    purchasePrice?: true;
    currentValue?: true;
    yieldEarned?: true;
    claimableYield?: true;
};
export type InvestmentSumAggregateInputType = {
    sharesOwned?: true;
    avgCostPerShare?: true;
    purchasePrice?: true;
    currentValue?: true;
    yieldEarned?: true;
    claimableYield?: true;
};
export type InvestmentMinAggregateInputType = {
    id?: true;
    userWallet?: true;
    propertyId?: true;
    sharesOwned?: true;
    avgCostPerShare?: true;
    purchasePrice?: true;
    currentValue?: true;
    yieldEarned?: true;
    claimableYield?: true;
    lastYieldClaim?: true;
    tokenAccount?: true;
    investedAt?: true;
};
export type InvestmentMaxAggregateInputType = {
    id?: true;
    userWallet?: true;
    propertyId?: true;
    sharesOwned?: true;
    avgCostPerShare?: true;
    purchasePrice?: true;
    currentValue?: true;
    yieldEarned?: true;
    claimableYield?: true;
    lastYieldClaim?: true;
    tokenAccount?: true;
    investedAt?: true;
};
export type InvestmentCountAggregateInputType = {
    id?: true;
    userWallet?: true;
    propertyId?: true;
    sharesOwned?: true;
    avgCostPerShare?: true;
    purchasePrice?: true;
    currentValue?: true;
    yieldEarned?: true;
    claimableYield?: true;
    lastYieldClaim?: true;
    tokenAccount?: true;
    investedAt?: true;
    _all?: true;
};
export type InvestmentAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which Investment to aggregate.
     */
    where?: Prisma.InvestmentWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Investments to fetch.
     */
    orderBy?: Prisma.InvestmentOrderByWithRelationInput | Prisma.InvestmentOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.InvestmentWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Investments from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Investments.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Investments
    **/
    _count?: true | InvestmentCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: InvestmentAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: InvestmentSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: InvestmentMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: InvestmentMaxAggregateInputType;
};
export type GetInvestmentAggregateType<T extends InvestmentAggregateArgs> = {
    [P in keyof T & keyof AggregateInvestment]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateInvestment[P]> : Prisma.GetScalarType<T[P], AggregateInvestment[P]>;
};
export type InvestmentGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.InvestmentWhereInput;
    orderBy?: Prisma.InvestmentOrderByWithAggregationInput | Prisma.InvestmentOrderByWithAggregationInput[];
    by: Prisma.InvestmentScalarFieldEnum[] | Prisma.InvestmentScalarFieldEnum;
    having?: Prisma.InvestmentScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: InvestmentCountAggregateInputType | true;
    _avg?: InvestmentAvgAggregateInputType;
    _sum?: InvestmentSumAggregateInputType;
    _min?: InvestmentMinAggregateInputType;
    _max?: InvestmentMaxAggregateInputType;
};
export type InvestmentGroupByOutputType = {
    id: string;
    userWallet: string;
    propertyId: string;
    sharesOwned: number;
    avgCostPerShare: runtime.Decimal;
    purchasePrice: bigint;
    currentValue: bigint;
    yieldEarned: bigint;
    claimableYield: bigint;
    lastYieldClaim: Date | null;
    tokenAccount: string;
    investedAt: Date;
    _count: InvestmentCountAggregateOutputType | null;
    _avg: InvestmentAvgAggregateOutputType | null;
    _sum: InvestmentSumAggregateOutputType | null;
    _min: InvestmentMinAggregateOutputType | null;
    _max: InvestmentMaxAggregateOutputType | null;
};
type GetInvestmentGroupByPayload<T extends InvestmentGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<InvestmentGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof InvestmentGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], InvestmentGroupByOutputType[P]> : Prisma.GetScalarType<T[P], InvestmentGroupByOutputType[P]>;
}>>;
export type InvestmentWhereInput = {
    AND?: Prisma.InvestmentWhereInput | Prisma.InvestmentWhereInput[];
    OR?: Prisma.InvestmentWhereInput[];
    NOT?: Prisma.InvestmentWhereInput | Prisma.InvestmentWhereInput[];
    id?: Prisma.StringFilter<"Investment"> | string;
    userWallet?: Prisma.StringFilter<"Investment"> | string;
    propertyId?: Prisma.StringFilter<"Investment"> | string;
    sharesOwned?: Prisma.IntFilter<"Investment"> | number;
    avgCostPerShare?: Prisma.DecimalFilter<"Investment"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    purchasePrice?: Prisma.BigIntFilter<"Investment"> | bigint | number;
    currentValue?: Prisma.BigIntFilter<"Investment"> | bigint | number;
    yieldEarned?: Prisma.BigIntFilter<"Investment"> | bigint | number;
    claimableYield?: Prisma.BigIntFilter<"Investment"> | bigint | number;
    lastYieldClaim?: Prisma.DateTimeNullableFilter<"Investment"> | Date | string | null;
    tokenAccount?: Prisma.StringFilter<"Investment"> | string;
    investedAt?: Prisma.DateTimeFilter<"Investment"> | Date | string;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    property?: Prisma.XOR<Prisma.PropertyScalarRelationFilter, Prisma.PropertyWhereInput>;
};
export type InvestmentOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    userWallet?: Prisma.SortOrder;
    propertyId?: Prisma.SortOrder;
    sharesOwned?: Prisma.SortOrder;
    avgCostPerShare?: Prisma.SortOrder;
    purchasePrice?: Prisma.SortOrder;
    currentValue?: Prisma.SortOrder;
    yieldEarned?: Prisma.SortOrder;
    claimableYield?: Prisma.SortOrder;
    lastYieldClaim?: Prisma.SortOrderInput | Prisma.SortOrder;
    tokenAccount?: Prisma.SortOrder;
    investedAt?: Prisma.SortOrder;
    user?: Prisma.UserOrderByWithRelationInput;
    property?: Prisma.PropertyOrderByWithRelationInput;
};
export type InvestmentWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    userWallet_propertyId?: Prisma.InvestmentUserWalletPropertyIdCompoundUniqueInput;
    AND?: Prisma.InvestmentWhereInput | Prisma.InvestmentWhereInput[];
    OR?: Prisma.InvestmentWhereInput[];
    NOT?: Prisma.InvestmentWhereInput | Prisma.InvestmentWhereInput[];
    userWallet?: Prisma.StringFilter<"Investment"> | string;
    propertyId?: Prisma.StringFilter<"Investment"> | string;
    sharesOwned?: Prisma.IntFilter<"Investment"> | number;
    avgCostPerShare?: Prisma.DecimalFilter<"Investment"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    purchasePrice?: Prisma.BigIntFilter<"Investment"> | bigint | number;
    currentValue?: Prisma.BigIntFilter<"Investment"> | bigint | number;
    yieldEarned?: Prisma.BigIntFilter<"Investment"> | bigint | number;
    claimableYield?: Prisma.BigIntFilter<"Investment"> | bigint | number;
    lastYieldClaim?: Prisma.DateTimeNullableFilter<"Investment"> | Date | string | null;
    tokenAccount?: Prisma.StringFilter<"Investment"> | string;
    investedAt?: Prisma.DateTimeFilter<"Investment"> | Date | string;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    property?: Prisma.XOR<Prisma.PropertyScalarRelationFilter, Prisma.PropertyWhereInput>;
}, "id" | "userWallet_propertyId">;
export type InvestmentOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    userWallet?: Prisma.SortOrder;
    propertyId?: Prisma.SortOrder;
    sharesOwned?: Prisma.SortOrder;
    avgCostPerShare?: Prisma.SortOrder;
    purchasePrice?: Prisma.SortOrder;
    currentValue?: Prisma.SortOrder;
    yieldEarned?: Prisma.SortOrder;
    claimableYield?: Prisma.SortOrder;
    lastYieldClaim?: Prisma.SortOrderInput | Prisma.SortOrder;
    tokenAccount?: Prisma.SortOrder;
    investedAt?: Prisma.SortOrder;
    _count?: Prisma.InvestmentCountOrderByAggregateInput;
    _avg?: Prisma.InvestmentAvgOrderByAggregateInput;
    _max?: Prisma.InvestmentMaxOrderByAggregateInput;
    _min?: Prisma.InvestmentMinOrderByAggregateInput;
    _sum?: Prisma.InvestmentSumOrderByAggregateInput;
};
export type InvestmentScalarWhereWithAggregatesInput = {
    AND?: Prisma.InvestmentScalarWhereWithAggregatesInput | Prisma.InvestmentScalarWhereWithAggregatesInput[];
    OR?: Prisma.InvestmentScalarWhereWithAggregatesInput[];
    NOT?: Prisma.InvestmentScalarWhereWithAggregatesInput | Prisma.InvestmentScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"Investment"> | string;
    userWallet?: Prisma.StringWithAggregatesFilter<"Investment"> | string;
    propertyId?: Prisma.StringWithAggregatesFilter<"Investment"> | string;
    sharesOwned?: Prisma.IntWithAggregatesFilter<"Investment"> | number;
    avgCostPerShare?: Prisma.DecimalWithAggregatesFilter<"Investment"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    purchasePrice?: Prisma.BigIntWithAggregatesFilter<"Investment"> | bigint | number;
    currentValue?: Prisma.BigIntWithAggregatesFilter<"Investment"> | bigint | number;
    yieldEarned?: Prisma.BigIntWithAggregatesFilter<"Investment"> | bigint | number;
    claimableYield?: Prisma.BigIntWithAggregatesFilter<"Investment"> | bigint | number;
    lastYieldClaim?: Prisma.DateTimeNullableWithAggregatesFilter<"Investment"> | Date | string | null;
    tokenAccount?: Prisma.StringWithAggregatesFilter<"Investment"> | string;
    investedAt?: Prisma.DateTimeWithAggregatesFilter<"Investment"> | Date | string;
};
export type InvestmentCreateInput = {
    id?: string;
    sharesOwned: number;
    avgCostPerShare: runtime.Decimal | runtime.DecimalJsLike | number | string;
    purchasePrice: bigint | number;
    currentValue: bigint | number;
    yieldEarned: bigint | number;
    claimableYield: bigint | number;
    lastYieldClaim?: Date | string | null;
    tokenAccount: string;
    investedAt: Date | string;
    user: Prisma.UserCreateNestedOneWithoutInvestmentsInput;
    property: Prisma.PropertyCreateNestedOneWithoutInvestmentsInput;
};
export type InvestmentUncheckedCreateInput = {
    id?: string;
    userWallet: string;
    propertyId: string;
    sharesOwned: number;
    avgCostPerShare: runtime.Decimal | runtime.DecimalJsLike | number | string;
    purchasePrice: bigint | number;
    currentValue: bigint | number;
    yieldEarned: bigint | number;
    claimableYield: bigint | number;
    lastYieldClaim?: Date | string | null;
    tokenAccount: string;
    investedAt: Date | string;
};
export type InvestmentUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    sharesOwned?: Prisma.IntFieldUpdateOperationsInput | number;
    avgCostPerShare?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    purchasePrice?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    currentValue?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    yieldEarned?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    claimableYield?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    lastYieldClaim?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    tokenAccount?: Prisma.StringFieldUpdateOperationsInput | string;
    investedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneRequiredWithoutInvestmentsNestedInput;
    property?: Prisma.PropertyUpdateOneRequiredWithoutInvestmentsNestedInput;
};
export type InvestmentUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userWallet?: Prisma.StringFieldUpdateOperationsInput | string;
    propertyId?: Prisma.StringFieldUpdateOperationsInput | string;
    sharesOwned?: Prisma.IntFieldUpdateOperationsInput | number;
    avgCostPerShare?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    purchasePrice?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    currentValue?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    yieldEarned?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    claimableYield?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    lastYieldClaim?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    tokenAccount?: Prisma.StringFieldUpdateOperationsInput | string;
    investedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type InvestmentCreateManyInput = {
    id?: string;
    userWallet: string;
    propertyId: string;
    sharesOwned: number;
    avgCostPerShare: runtime.Decimal | runtime.DecimalJsLike | number | string;
    purchasePrice: bigint | number;
    currentValue: bigint | number;
    yieldEarned: bigint | number;
    claimableYield: bigint | number;
    lastYieldClaim?: Date | string | null;
    tokenAccount: string;
    investedAt: Date | string;
};
export type InvestmentUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    sharesOwned?: Prisma.IntFieldUpdateOperationsInput | number;
    avgCostPerShare?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    purchasePrice?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    currentValue?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    yieldEarned?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    claimableYield?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    lastYieldClaim?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    tokenAccount?: Prisma.StringFieldUpdateOperationsInput | string;
    investedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type InvestmentUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userWallet?: Prisma.StringFieldUpdateOperationsInput | string;
    propertyId?: Prisma.StringFieldUpdateOperationsInput | string;
    sharesOwned?: Prisma.IntFieldUpdateOperationsInput | number;
    avgCostPerShare?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    purchasePrice?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    currentValue?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    yieldEarned?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    claimableYield?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    lastYieldClaim?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    tokenAccount?: Prisma.StringFieldUpdateOperationsInput | string;
    investedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type InvestmentListRelationFilter = {
    every?: Prisma.InvestmentWhereInput;
    some?: Prisma.InvestmentWhereInput;
    none?: Prisma.InvestmentWhereInput;
};
export type InvestmentOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type InvestmentUserWalletPropertyIdCompoundUniqueInput = {
    userWallet: string;
    propertyId: string;
};
export type InvestmentCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userWallet?: Prisma.SortOrder;
    propertyId?: Prisma.SortOrder;
    sharesOwned?: Prisma.SortOrder;
    avgCostPerShare?: Prisma.SortOrder;
    purchasePrice?: Prisma.SortOrder;
    currentValue?: Prisma.SortOrder;
    yieldEarned?: Prisma.SortOrder;
    claimableYield?: Prisma.SortOrder;
    lastYieldClaim?: Prisma.SortOrder;
    tokenAccount?: Prisma.SortOrder;
    investedAt?: Prisma.SortOrder;
};
export type InvestmentAvgOrderByAggregateInput = {
    sharesOwned?: Prisma.SortOrder;
    avgCostPerShare?: Prisma.SortOrder;
    purchasePrice?: Prisma.SortOrder;
    currentValue?: Prisma.SortOrder;
    yieldEarned?: Prisma.SortOrder;
    claimableYield?: Prisma.SortOrder;
};
export type InvestmentMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userWallet?: Prisma.SortOrder;
    propertyId?: Prisma.SortOrder;
    sharesOwned?: Prisma.SortOrder;
    avgCostPerShare?: Prisma.SortOrder;
    purchasePrice?: Prisma.SortOrder;
    currentValue?: Prisma.SortOrder;
    yieldEarned?: Prisma.SortOrder;
    claimableYield?: Prisma.SortOrder;
    lastYieldClaim?: Prisma.SortOrder;
    tokenAccount?: Prisma.SortOrder;
    investedAt?: Prisma.SortOrder;
};
export type InvestmentMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userWallet?: Prisma.SortOrder;
    propertyId?: Prisma.SortOrder;
    sharesOwned?: Prisma.SortOrder;
    avgCostPerShare?: Prisma.SortOrder;
    purchasePrice?: Prisma.SortOrder;
    currentValue?: Prisma.SortOrder;
    yieldEarned?: Prisma.SortOrder;
    claimableYield?: Prisma.SortOrder;
    lastYieldClaim?: Prisma.SortOrder;
    tokenAccount?: Prisma.SortOrder;
    investedAt?: Prisma.SortOrder;
};
export type InvestmentSumOrderByAggregateInput = {
    sharesOwned?: Prisma.SortOrder;
    avgCostPerShare?: Prisma.SortOrder;
    purchasePrice?: Prisma.SortOrder;
    currentValue?: Prisma.SortOrder;
    yieldEarned?: Prisma.SortOrder;
    claimableYield?: Prisma.SortOrder;
};
export type InvestmentCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.InvestmentCreateWithoutUserInput, Prisma.InvestmentUncheckedCreateWithoutUserInput> | Prisma.InvestmentCreateWithoutUserInput[] | Prisma.InvestmentUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.InvestmentCreateOrConnectWithoutUserInput | Prisma.InvestmentCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.InvestmentCreateManyUserInputEnvelope;
    connect?: Prisma.InvestmentWhereUniqueInput | Prisma.InvestmentWhereUniqueInput[];
};
export type InvestmentUncheckedCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.InvestmentCreateWithoutUserInput, Prisma.InvestmentUncheckedCreateWithoutUserInput> | Prisma.InvestmentCreateWithoutUserInput[] | Prisma.InvestmentUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.InvestmentCreateOrConnectWithoutUserInput | Prisma.InvestmentCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.InvestmentCreateManyUserInputEnvelope;
    connect?: Prisma.InvestmentWhereUniqueInput | Prisma.InvestmentWhereUniqueInput[];
};
export type InvestmentUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.InvestmentCreateWithoutUserInput, Prisma.InvestmentUncheckedCreateWithoutUserInput> | Prisma.InvestmentCreateWithoutUserInput[] | Prisma.InvestmentUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.InvestmentCreateOrConnectWithoutUserInput | Prisma.InvestmentCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.InvestmentUpsertWithWhereUniqueWithoutUserInput | Prisma.InvestmentUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.InvestmentCreateManyUserInputEnvelope;
    set?: Prisma.InvestmentWhereUniqueInput | Prisma.InvestmentWhereUniqueInput[];
    disconnect?: Prisma.InvestmentWhereUniqueInput | Prisma.InvestmentWhereUniqueInput[];
    delete?: Prisma.InvestmentWhereUniqueInput | Prisma.InvestmentWhereUniqueInput[];
    connect?: Prisma.InvestmentWhereUniqueInput | Prisma.InvestmentWhereUniqueInput[];
    update?: Prisma.InvestmentUpdateWithWhereUniqueWithoutUserInput | Prisma.InvestmentUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.InvestmentUpdateManyWithWhereWithoutUserInput | Prisma.InvestmentUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.InvestmentScalarWhereInput | Prisma.InvestmentScalarWhereInput[];
};
export type InvestmentUncheckedUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.InvestmentCreateWithoutUserInput, Prisma.InvestmentUncheckedCreateWithoutUserInput> | Prisma.InvestmentCreateWithoutUserInput[] | Prisma.InvestmentUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.InvestmentCreateOrConnectWithoutUserInput | Prisma.InvestmentCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.InvestmentUpsertWithWhereUniqueWithoutUserInput | Prisma.InvestmentUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.InvestmentCreateManyUserInputEnvelope;
    set?: Prisma.InvestmentWhereUniqueInput | Prisma.InvestmentWhereUniqueInput[];
    disconnect?: Prisma.InvestmentWhereUniqueInput | Prisma.InvestmentWhereUniqueInput[];
    delete?: Prisma.InvestmentWhereUniqueInput | Prisma.InvestmentWhereUniqueInput[];
    connect?: Prisma.InvestmentWhereUniqueInput | Prisma.InvestmentWhereUniqueInput[];
    update?: Prisma.InvestmentUpdateWithWhereUniqueWithoutUserInput | Prisma.InvestmentUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.InvestmentUpdateManyWithWhereWithoutUserInput | Prisma.InvestmentUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.InvestmentScalarWhereInput | Prisma.InvestmentScalarWhereInput[];
};
export type InvestmentCreateNestedManyWithoutPropertyInput = {
    create?: Prisma.XOR<Prisma.InvestmentCreateWithoutPropertyInput, Prisma.InvestmentUncheckedCreateWithoutPropertyInput> | Prisma.InvestmentCreateWithoutPropertyInput[] | Prisma.InvestmentUncheckedCreateWithoutPropertyInput[];
    connectOrCreate?: Prisma.InvestmentCreateOrConnectWithoutPropertyInput | Prisma.InvestmentCreateOrConnectWithoutPropertyInput[];
    createMany?: Prisma.InvestmentCreateManyPropertyInputEnvelope;
    connect?: Prisma.InvestmentWhereUniqueInput | Prisma.InvestmentWhereUniqueInput[];
};
export type InvestmentUncheckedCreateNestedManyWithoutPropertyInput = {
    create?: Prisma.XOR<Prisma.InvestmentCreateWithoutPropertyInput, Prisma.InvestmentUncheckedCreateWithoutPropertyInput> | Prisma.InvestmentCreateWithoutPropertyInput[] | Prisma.InvestmentUncheckedCreateWithoutPropertyInput[];
    connectOrCreate?: Prisma.InvestmentCreateOrConnectWithoutPropertyInput | Prisma.InvestmentCreateOrConnectWithoutPropertyInput[];
    createMany?: Prisma.InvestmentCreateManyPropertyInputEnvelope;
    connect?: Prisma.InvestmentWhereUniqueInput | Prisma.InvestmentWhereUniqueInput[];
};
export type InvestmentUpdateManyWithoutPropertyNestedInput = {
    create?: Prisma.XOR<Prisma.InvestmentCreateWithoutPropertyInput, Prisma.InvestmentUncheckedCreateWithoutPropertyInput> | Prisma.InvestmentCreateWithoutPropertyInput[] | Prisma.InvestmentUncheckedCreateWithoutPropertyInput[];
    connectOrCreate?: Prisma.InvestmentCreateOrConnectWithoutPropertyInput | Prisma.InvestmentCreateOrConnectWithoutPropertyInput[];
    upsert?: Prisma.InvestmentUpsertWithWhereUniqueWithoutPropertyInput | Prisma.InvestmentUpsertWithWhereUniqueWithoutPropertyInput[];
    createMany?: Prisma.InvestmentCreateManyPropertyInputEnvelope;
    set?: Prisma.InvestmentWhereUniqueInput | Prisma.InvestmentWhereUniqueInput[];
    disconnect?: Prisma.InvestmentWhereUniqueInput | Prisma.InvestmentWhereUniqueInput[];
    delete?: Prisma.InvestmentWhereUniqueInput | Prisma.InvestmentWhereUniqueInput[];
    connect?: Prisma.InvestmentWhereUniqueInput | Prisma.InvestmentWhereUniqueInput[];
    update?: Prisma.InvestmentUpdateWithWhereUniqueWithoutPropertyInput | Prisma.InvestmentUpdateWithWhereUniqueWithoutPropertyInput[];
    updateMany?: Prisma.InvestmentUpdateManyWithWhereWithoutPropertyInput | Prisma.InvestmentUpdateManyWithWhereWithoutPropertyInput[];
    deleteMany?: Prisma.InvestmentScalarWhereInput | Prisma.InvestmentScalarWhereInput[];
};
export type InvestmentUncheckedUpdateManyWithoutPropertyNestedInput = {
    create?: Prisma.XOR<Prisma.InvestmentCreateWithoutPropertyInput, Prisma.InvestmentUncheckedCreateWithoutPropertyInput> | Prisma.InvestmentCreateWithoutPropertyInput[] | Prisma.InvestmentUncheckedCreateWithoutPropertyInput[];
    connectOrCreate?: Prisma.InvestmentCreateOrConnectWithoutPropertyInput | Prisma.InvestmentCreateOrConnectWithoutPropertyInput[];
    upsert?: Prisma.InvestmentUpsertWithWhereUniqueWithoutPropertyInput | Prisma.InvestmentUpsertWithWhereUniqueWithoutPropertyInput[];
    createMany?: Prisma.InvestmentCreateManyPropertyInputEnvelope;
    set?: Prisma.InvestmentWhereUniqueInput | Prisma.InvestmentWhereUniqueInput[];
    disconnect?: Prisma.InvestmentWhereUniqueInput | Prisma.InvestmentWhereUniqueInput[];
    delete?: Prisma.InvestmentWhereUniqueInput | Prisma.InvestmentWhereUniqueInput[];
    connect?: Prisma.InvestmentWhereUniqueInput | Prisma.InvestmentWhereUniqueInput[];
    update?: Prisma.InvestmentUpdateWithWhereUniqueWithoutPropertyInput | Prisma.InvestmentUpdateWithWhereUniqueWithoutPropertyInput[];
    updateMany?: Prisma.InvestmentUpdateManyWithWhereWithoutPropertyInput | Prisma.InvestmentUpdateManyWithWhereWithoutPropertyInput[];
    deleteMany?: Prisma.InvestmentScalarWhereInput | Prisma.InvestmentScalarWhereInput[];
};
export type IntFieldUpdateOperationsInput = {
    set?: number;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
};
export type DecimalFieldUpdateOperationsInput = {
    set?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    increment?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    decrement?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    multiply?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    divide?: runtime.Decimal | runtime.DecimalJsLike | number | string;
};
export type BigIntFieldUpdateOperationsInput = {
    set?: bigint | number;
    increment?: bigint | number;
    decrement?: bigint | number;
    multiply?: bigint | number;
    divide?: bigint | number;
};
export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null;
};
export type InvestmentCreateWithoutUserInput = {
    id?: string;
    sharesOwned: number;
    avgCostPerShare: runtime.Decimal | runtime.DecimalJsLike | number | string;
    purchasePrice: bigint | number;
    currentValue: bigint | number;
    yieldEarned: bigint | number;
    claimableYield: bigint | number;
    lastYieldClaim?: Date | string | null;
    tokenAccount: string;
    investedAt: Date | string;
    property: Prisma.PropertyCreateNestedOneWithoutInvestmentsInput;
};
export type InvestmentUncheckedCreateWithoutUserInput = {
    id?: string;
    propertyId: string;
    sharesOwned: number;
    avgCostPerShare: runtime.Decimal | runtime.DecimalJsLike | number | string;
    purchasePrice: bigint | number;
    currentValue: bigint | number;
    yieldEarned: bigint | number;
    claimableYield: bigint | number;
    lastYieldClaim?: Date | string | null;
    tokenAccount: string;
    investedAt: Date | string;
};
export type InvestmentCreateOrConnectWithoutUserInput = {
    where: Prisma.InvestmentWhereUniqueInput;
    create: Prisma.XOR<Prisma.InvestmentCreateWithoutUserInput, Prisma.InvestmentUncheckedCreateWithoutUserInput>;
};
export type InvestmentCreateManyUserInputEnvelope = {
    data: Prisma.InvestmentCreateManyUserInput | Prisma.InvestmentCreateManyUserInput[];
    skipDuplicates?: boolean;
};
export type InvestmentUpsertWithWhereUniqueWithoutUserInput = {
    where: Prisma.InvestmentWhereUniqueInput;
    update: Prisma.XOR<Prisma.InvestmentUpdateWithoutUserInput, Prisma.InvestmentUncheckedUpdateWithoutUserInput>;
    create: Prisma.XOR<Prisma.InvestmentCreateWithoutUserInput, Prisma.InvestmentUncheckedCreateWithoutUserInput>;
};
export type InvestmentUpdateWithWhereUniqueWithoutUserInput = {
    where: Prisma.InvestmentWhereUniqueInput;
    data: Prisma.XOR<Prisma.InvestmentUpdateWithoutUserInput, Prisma.InvestmentUncheckedUpdateWithoutUserInput>;
};
export type InvestmentUpdateManyWithWhereWithoutUserInput = {
    where: Prisma.InvestmentScalarWhereInput;
    data: Prisma.XOR<Prisma.InvestmentUpdateManyMutationInput, Prisma.InvestmentUncheckedUpdateManyWithoutUserInput>;
};
export type InvestmentScalarWhereInput = {
    AND?: Prisma.InvestmentScalarWhereInput | Prisma.InvestmentScalarWhereInput[];
    OR?: Prisma.InvestmentScalarWhereInput[];
    NOT?: Prisma.InvestmentScalarWhereInput | Prisma.InvestmentScalarWhereInput[];
    id?: Prisma.StringFilter<"Investment"> | string;
    userWallet?: Prisma.StringFilter<"Investment"> | string;
    propertyId?: Prisma.StringFilter<"Investment"> | string;
    sharesOwned?: Prisma.IntFilter<"Investment"> | number;
    avgCostPerShare?: Prisma.DecimalFilter<"Investment"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    purchasePrice?: Prisma.BigIntFilter<"Investment"> | bigint | number;
    currentValue?: Prisma.BigIntFilter<"Investment"> | bigint | number;
    yieldEarned?: Prisma.BigIntFilter<"Investment"> | bigint | number;
    claimableYield?: Prisma.BigIntFilter<"Investment"> | bigint | number;
    lastYieldClaim?: Prisma.DateTimeNullableFilter<"Investment"> | Date | string | null;
    tokenAccount?: Prisma.StringFilter<"Investment"> | string;
    investedAt?: Prisma.DateTimeFilter<"Investment"> | Date | string;
};
export type InvestmentCreateWithoutPropertyInput = {
    id?: string;
    sharesOwned: number;
    avgCostPerShare: runtime.Decimal | runtime.DecimalJsLike | number | string;
    purchasePrice: bigint | number;
    currentValue: bigint | number;
    yieldEarned: bigint | number;
    claimableYield: bigint | number;
    lastYieldClaim?: Date | string | null;
    tokenAccount: string;
    investedAt: Date | string;
    user: Prisma.UserCreateNestedOneWithoutInvestmentsInput;
};
export type InvestmentUncheckedCreateWithoutPropertyInput = {
    id?: string;
    userWallet: string;
    sharesOwned: number;
    avgCostPerShare: runtime.Decimal | runtime.DecimalJsLike | number | string;
    purchasePrice: bigint | number;
    currentValue: bigint | number;
    yieldEarned: bigint | number;
    claimableYield: bigint | number;
    lastYieldClaim?: Date | string | null;
    tokenAccount: string;
    investedAt: Date | string;
};
export type InvestmentCreateOrConnectWithoutPropertyInput = {
    where: Prisma.InvestmentWhereUniqueInput;
    create: Prisma.XOR<Prisma.InvestmentCreateWithoutPropertyInput, Prisma.InvestmentUncheckedCreateWithoutPropertyInput>;
};
export type InvestmentCreateManyPropertyInputEnvelope = {
    data: Prisma.InvestmentCreateManyPropertyInput | Prisma.InvestmentCreateManyPropertyInput[];
    skipDuplicates?: boolean;
};
export type InvestmentUpsertWithWhereUniqueWithoutPropertyInput = {
    where: Prisma.InvestmentWhereUniqueInput;
    update: Prisma.XOR<Prisma.InvestmentUpdateWithoutPropertyInput, Prisma.InvestmentUncheckedUpdateWithoutPropertyInput>;
    create: Prisma.XOR<Prisma.InvestmentCreateWithoutPropertyInput, Prisma.InvestmentUncheckedCreateWithoutPropertyInput>;
};
export type InvestmentUpdateWithWhereUniqueWithoutPropertyInput = {
    where: Prisma.InvestmentWhereUniqueInput;
    data: Prisma.XOR<Prisma.InvestmentUpdateWithoutPropertyInput, Prisma.InvestmentUncheckedUpdateWithoutPropertyInput>;
};
export type InvestmentUpdateManyWithWhereWithoutPropertyInput = {
    where: Prisma.InvestmentScalarWhereInput;
    data: Prisma.XOR<Prisma.InvestmentUpdateManyMutationInput, Prisma.InvestmentUncheckedUpdateManyWithoutPropertyInput>;
};
export type InvestmentCreateManyUserInput = {
    id?: string;
    propertyId: string;
    sharesOwned: number;
    avgCostPerShare: runtime.Decimal | runtime.DecimalJsLike | number | string;
    purchasePrice: bigint | number;
    currentValue: bigint | number;
    yieldEarned: bigint | number;
    claimableYield: bigint | number;
    lastYieldClaim?: Date | string | null;
    tokenAccount: string;
    investedAt: Date | string;
};
export type InvestmentUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    sharesOwned?: Prisma.IntFieldUpdateOperationsInput | number;
    avgCostPerShare?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    purchasePrice?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    currentValue?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    yieldEarned?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    claimableYield?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    lastYieldClaim?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    tokenAccount?: Prisma.StringFieldUpdateOperationsInput | string;
    investedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    property?: Prisma.PropertyUpdateOneRequiredWithoutInvestmentsNestedInput;
};
export type InvestmentUncheckedUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    propertyId?: Prisma.StringFieldUpdateOperationsInput | string;
    sharesOwned?: Prisma.IntFieldUpdateOperationsInput | number;
    avgCostPerShare?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    purchasePrice?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    currentValue?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    yieldEarned?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    claimableYield?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    lastYieldClaim?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    tokenAccount?: Prisma.StringFieldUpdateOperationsInput | string;
    investedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type InvestmentUncheckedUpdateManyWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    propertyId?: Prisma.StringFieldUpdateOperationsInput | string;
    sharesOwned?: Prisma.IntFieldUpdateOperationsInput | number;
    avgCostPerShare?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    purchasePrice?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    currentValue?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    yieldEarned?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    claimableYield?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    lastYieldClaim?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    tokenAccount?: Prisma.StringFieldUpdateOperationsInput | string;
    investedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type InvestmentCreateManyPropertyInput = {
    id?: string;
    userWallet: string;
    sharesOwned: number;
    avgCostPerShare: runtime.Decimal | runtime.DecimalJsLike | number | string;
    purchasePrice: bigint | number;
    currentValue: bigint | number;
    yieldEarned: bigint | number;
    claimableYield: bigint | number;
    lastYieldClaim?: Date | string | null;
    tokenAccount: string;
    investedAt: Date | string;
};
export type InvestmentUpdateWithoutPropertyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    sharesOwned?: Prisma.IntFieldUpdateOperationsInput | number;
    avgCostPerShare?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    purchasePrice?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    currentValue?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    yieldEarned?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    claimableYield?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    lastYieldClaim?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    tokenAccount?: Prisma.StringFieldUpdateOperationsInput | string;
    investedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneRequiredWithoutInvestmentsNestedInput;
};
export type InvestmentUncheckedUpdateWithoutPropertyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userWallet?: Prisma.StringFieldUpdateOperationsInput | string;
    sharesOwned?: Prisma.IntFieldUpdateOperationsInput | number;
    avgCostPerShare?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    purchasePrice?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    currentValue?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    yieldEarned?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    claimableYield?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    lastYieldClaim?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    tokenAccount?: Prisma.StringFieldUpdateOperationsInput | string;
    investedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type InvestmentUncheckedUpdateManyWithoutPropertyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userWallet?: Prisma.StringFieldUpdateOperationsInput | string;
    sharesOwned?: Prisma.IntFieldUpdateOperationsInput | number;
    avgCostPerShare?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    purchasePrice?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    currentValue?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    yieldEarned?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    claimableYield?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    lastYieldClaim?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    tokenAccount?: Prisma.StringFieldUpdateOperationsInput | string;
    investedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type InvestmentSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userWallet?: boolean;
    propertyId?: boolean;
    sharesOwned?: boolean;
    avgCostPerShare?: boolean;
    purchasePrice?: boolean;
    currentValue?: boolean;
    yieldEarned?: boolean;
    claimableYield?: boolean;
    lastYieldClaim?: boolean;
    tokenAccount?: boolean;
    investedAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    property?: boolean | Prisma.PropertyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["investment"]>;
export type InvestmentSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userWallet?: boolean;
    propertyId?: boolean;
    sharesOwned?: boolean;
    avgCostPerShare?: boolean;
    purchasePrice?: boolean;
    currentValue?: boolean;
    yieldEarned?: boolean;
    claimableYield?: boolean;
    lastYieldClaim?: boolean;
    tokenAccount?: boolean;
    investedAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    property?: boolean | Prisma.PropertyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["investment"]>;
export type InvestmentSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userWallet?: boolean;
    propertyId?: boolean;
    sharesOwned?: boolean;
    avgCostPerShare?: boolean;
    purchasePrice?: boolean;
    currentValue?: boolean;
    yieldEarned?: boolean;
    claimableYield?: boolean;
    lastYieldClaim?: boolean;
    tokenAccount?: boolean;
    investedAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    property?: boolean | Prisma.PropertyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["investment"]>;
export type InvestmentSelectScalar = {
    id?: boolean;
    userWallet?: boolean;
    propertyId?: boolean;
    sharesOwned?: boolean;
    avgCostPerShare?: boolean;
    purchasePrice?: boolean;
    currentValue?: boolean;
    yieldEarned?: boolean;
    claimableYield?: boolean;
    lastYieldClaim?: boolean;
    tokenAccount?: boolean;
    investedAt?: boolean;
};
export type InvestmentOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "userWallet" | "propertyId" | "sharesOwned" | "avgCostPerShare" | "purchasePrice" | "currentValue" | "yieldEarned" | "claimableYield" | "lastYieldClaim" | "tokenAccount" | "investedAt", ExtArgs["result"]["investment"]>;
export type InvestmentInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    property?: boolean | Prisma.PropertyDefaultArgs<ExtArgs>;
};
export type InvestmentIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    property?: boolean | Prisma.PropertyDefaultArgs<ExtArgs>;
};
export type InvestmentIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    property?: boolean | Prisma.PropertyDefaultArgs<ExtArgs>;
};
export type $InvestmentPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Investment";
    objects: {
        user: Prisma.$UserPayload<ExtArgs>;
        property: Prisma.$PropertyPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        userWallet: string;
        propertyId: string;
        sharesOwned: number;
        avgCostPerShare: runtime.Decimal;
        purchasePrice: bigint;
        currentValue: bigint;
        yieldEarned: bigint;
        claimableYield: bigint;
        lastYieldClaim: Date | null;
        tokenAccount: string;
        investedAt: Date;
    }, ExtArgs["result"]["investment"]>;
    composites: {};
};
export type InvestmentGetPayload<S extends boolean | null | undefined | InvestmentDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$InvestmentPayload, S>;
export type InvestmentCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<InvestmentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: InvestmentCountAggregateInputType | true;
};
export interface InvestmentDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Investment'];
        meta: {
            name: 'Investment';
        };
    };
    /**
     * Find zero or one Investment that matches the filter.
     * @param {InvestmentFindUniqueArgs} args - Arguments to find a Investment
     * @example
     * // Get one Investment
     * const investment = await prisma.investment.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends InvestmentFindUniqueArgs>(args: Prisma.SelectSubset<T, InvestmentFindUniqueArgs<ExtArgs>>): Prisma.Prisma__InvestmentClient<runtime.Types.Result.GetResult<Prisma.$InvestmentPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one Investment that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {InvestmentFindUniqueOrThrowArgs} args - Arguments to find a Investment
     * @example
     * // Get one Investment
     * const investment = await prisma.investment.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends InvestmentFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, InvestmentFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__InvestmentClient<runtime.Types.Result.GetResult<Prisma.$InvestmentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first Investment that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InvestmentFindFirstArgs} args - Arguments to find a Investment
     * @example
     * // Get one Investment
     * const investment = await prisma.investment.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends InvestmentFindFirstArgs>(args?: Prisma.SelectSubset<T, InvestmentFindFirstArgs<ExtArgs>>): Prisma.Prisma__InvestmentClient<runtime.Types.Result.GetResult<Prisma.$InvestmentPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first Investment that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InvestmentFindFirstOrThrowArgs} args - Arguments to find a Investment
     * @example
     * // Get one Investment
     * const investment = await prisma.investment.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends InvestmentFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, InvestmentFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__InvestmentClient<runtime.Types.Result.GetResult<Prisma.$InvestmentPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more Investments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InvestmentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Investments
     * const investments = await prisma.investment.findMany()
     *
     * // Get first 10 Investments
     * const investments = await prisma.investment.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const investmentWithIdOnly = await prisma.investment.findMany({ select: { id: true } })
     *
     */
    findMany<T extends InvestmentFindManyArgs>(args?: Prisma.SelectSubset<T, InvestmentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$InvestmentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a Investment.
     * @param {InvestmentCreateArgs} args - Arguments to create a Investment.
     * @example
     * // Create one Investment
     * const Investment = await prisma.investment.create({
     *   data: {
     *     // ... data to create a Investment
     *   }
     * })
     *
     */
    create<T extends InvestmentCreateArgs>(args: Prisma.SelectSubset<T, InvestmentCreateArgs<ExtArgs>>): Prisma.Prisma__InvestmentClient<runtime.Types.Result.GetResult<Prisma.$InvestmentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many Investments.
     * @param {InvestmentCreateManyArgs} args - Arguments to create many Investments.
     * @example
     * // Create many Investments
     * const investment = await prisma.investment.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends InvestmentCreateManyArgs>(args?: Prisma.SelectSubset<T, InvestmentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many Investments and returns the data saved in the database.
     * @param {InvestmentCreateManyAndReturnArgs} args - Arguments to create many Investments.
     * @example
     * // Create many Investments
     * const investment = await prisma.investment.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Investments and only return the `id`
     * const investmentWithIdOnly = await prisma.investment.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends InvestmentCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, InvestmentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$InvestmentPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a Investment.
     * @param {InvestmentDeleteArgs} args - Arguments to delete one Investment.
     * @example
     * // Delete one Investment
     * const Investment = await prisma.investment.delete({
     *   where: {
     *     // ... filter to delete one Investment
     *   }
     * })
     *
     */
    delete<T extends InvestmentDeleteArgs>(args: Prisma.SelectSubset<T, InvestmentDeleteArgs<ExtArgs>>): Prisma.Prisma__InvestmentClient<runtime.Types.Result.GetResult<Prisma.$InvestmentPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one Investment.
     * @param {InvestmentUpdateArgs} args - Arguments to update one Investment.
     * @example
     * // Update one Investment
     * const investment = await prisma.investment.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends InvestmentUpdateArgs>(args: Prisma.SelectSubset<T, InvestmentUpdateArgs<ExtArgs>>): Prisma.Prisma__InvestmentClient<runtime.Types.Result.GetResult<Prisma.$InvestmentPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more Investments.
     * @param {InvestmentDeleteManyArgs} args - Arguments to filter Investments to delete.
     * @example
     * // Delete a few Investments
     * const { count } = await prisma.investment.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends InvestmentDeleteManyArgs>(args?: Prisma.SelectSubset<T, InvestmentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more Investments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InvestmentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Investments
     * const investment = await prisma.investment.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends InvestmentUpdateManyArgs>(args: Prisma.SelectSubset<T, InvestmentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more Investments and returns the data updated in the database.
     * @param {InvestmentUpdateManyAndReturnArgs} args - Arguments to update many Investments.
     * @example
     * // Update many Investments
     * const investment = await prisma.investment.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more Investments and only return the `id`
     * const investmentWithIdOnly = await prisma.investment.updateManyAndReturn({
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
    updateManyAndReturn<T extends InvestmentUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, InvestmentUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$InvestmentPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one Investment.
     * @param {InvestmentUpsertArgs} args - Arguments to update or create a Investment.
     * @example
     * // Update or create a Investment
     * const investment = await prisma.investment.upsert({
     *   create: {
     *     // ... data to create a Investment
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Investment we want to update
     *   }
     * })
     */
    upsert<T extends InvestmentUpsertArgs>(args: Prisma.SelectSubset<T, InvestmentUpsertArgs<ExtArgs>>): Prisma.Prisma__InvestmentClient<runtime.Types.Result.GetResult<Prisma.$InvestmentPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of Investments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InvestmentCountArgs} args - Arguments to filter Investments to count.
     * @example
     * // Count the number of Investments
     * const count = await prisma.investment.count({
     *   where: {
     *     // ... the filter for the Investments we want to count
     *   }
     * })
    **/
    count<T extends InvestmentCountArgs>(args?: Prisma.Subset<T, InvestmentCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], InvestmentCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a Investment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InvestmentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends InvestmentAggregateArgs>(args: Prisma.Subset<T, InvestmentAggregateArgs>): Prisma.PrismaPromise<GetInvestmentAggregateType<T>>;
    /**
     * Group by Investment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InvestmentGroupByArgs} args - Group by arguments.
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
    groupBy<T extends InvestmentGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: InvestmentGroupByArgs['orderBy'];
    } : {
        orderBy?: InvestmentGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, InvestmentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetInvestmentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the Investment model
     */
    readonly fields: InvestmentFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for Investment.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__InvestmentClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    user<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    property<T extends Prisma.PropertyDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.PropertyDefaultArgs<ExtArgs>>): Prisma.Prisma__PropertyClient<runtime.Types.Result.GetResult<Prisma.$PropertyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
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
 * Fields of the Investment model
 */
export interface InvestmentFieldRefs {
    readonly id: Prisma.FieldRef<"Investment", 'String'>;
    readonly userWallet: Prisma.FieldRef<"Investment", 'String'>;
    readonly propertyId: Prisma.FieldRef<"Investment", 'String'>;
    readonly sharesOwned: Prisma.FieldRef<"Investment", 'Int'>;
    readonly avgCostPerShare: Prisma.FieldRef<"Investment", 'Decimal'>;
    readonly purchasePrice: Prisma.FieldRef<"Investment", 'BigInt'>;
    readonly currentValue: Prisma.FieldRef<"Investment", 'BigInt'>;
    readonly yieldEarned: Prisma.FieldRef<"Investment", 'BigInt'>;
    readonly claimableYield: Prisma.FieldRef<"Investment", 'BigInt'>;
    readonly lastYieldClaim: Prisma.FieldRef<"Investment", 'DateTime'>;
    readonly tokenAccount: Prisma.FieldRef<"Investment", 'String'>;
    readonly investedAt: Prisma.FieldRef<"Investment", 'DateTime'>;
}
/**
 * Investment findUnique
 */
export type InvestmentFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Investment
     */
    select?: Prisma.InvestmentSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Investment
     */
    omit?: Prisma.InvestmentOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.InvestmentInclude<ExtArgs> | null;
    /**
     * Filter, which Investment to fetch.
     */
    where: Prisma.InvestmentWhereUniqueInput;
};
/**
 * Investment findUniqueOrThrow
 */
export type InvestmentFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Investment
     */
    select?: Prisma.InvestmentSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Investment
     */
    omit?: Prisma.InvestmentOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.InvestmentInclude<ExtArgs> | null;
    /**
     * Filter, which Investment to fetch.
     */
    where: Prisma.InvestmentWhereUniqueInput;
};
/**
 * Investment findFirst
 */
export type InvestmentFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Investment
     */
    select?: Prisma.InvestmentSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Investment
     */
    omit?: Prisma.InvestmentOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.InvestmentInclude<ExtArgs> | null;
    /**
     * Filter, which Investment to fetch.
     */
    where?: Prisma.InvestmentWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Investments to fetch.
     */
    orderBy?: Prisma.InvestmentOrderByWithRelationInput | Prisma.InvestmentOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Investments.
     */
    cursor?: Prisma.InvestmentWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Investments from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Investments.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Investments.
     */
    distinct?: Prisma.InvestmentScalarFieldEnum | Prisma.InvestmentScalarFieldEnum[];
};
/**
 * Investment findFirstOrThrow
 */
export type InvestmentFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Investment
     */
    select?: Prisma.InvestmentSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Investment
     */
    omit?: Prisma.InvestmentOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.InvestmentInclude<ExtArgs> | null;
    /**
     * Filter, which Investment to fetch.
     */
    where?: Prisma.InvestmentWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Investments to fetch.
     */
    orderBy?: Prisma.InvestmentOrderByWithRelationInput | Prisma.InvestmentOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Investments.
     */
    cursor?: Prisma.InvestmentWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Investments from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Investments.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Investments.
     */
    distinct?: Prisma.InvestmentScalarFieldEnum | Prisma.InvestmentScalarFieldEnum[];
};
/**
 * Investment findMany
 */
export type InvestmentFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Investment
     */
    select?: Prisma.InvestmentSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Investment
     */
    omit?: Prisma.InvestmentOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.InvestmentInclude<ExtArgs> | null;
    /**
     * Filter, which Investments to fetch.
     */
    where?: Prisma.InvestmentWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Investments to fetch.
     */
    orderBy?: Prisma.InvestmentOrderByWithRelationInput | Prisma.InvestmentOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Investments.
     */
    cursor?: Prisma.InvestmentWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Investments from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Investments.
     */
    skip?: number;
    distinct?: Prisma.InvestmentScalarFieldEnum | Prisma.InvestmentScalarFieldEnum[];
};
/**
 * Investment create
 */
export type InvestmentCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Investment
     */
    select?: Prisma.InvestmentSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Investment
     */
    omit?: Prisma.InvestmentOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.InvestmentInclude<ExtArgs> | null;
    /**
     * The data needed to create a Investment.
     */
    data: Prisma.XOR<Prisma.InvestmentCreateInput, Prisma.InvestmentUncheckedCreateInput>;
};
/**
 * Investment createMany
 */
export type InvestmentCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many Investments.
     */
    data: Prisma.InvestmentCreateManyInput | Prisma.InvestmentCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * Investment createManyAndReturn
 */
export type InvestmentCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Investment
     */
    select?: Prisma.InvestmentSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Investment
     */
    omit?: Prisma.InvestmentOmit<ExtArgs> | null;
    /**
     * The data used to create many Investments.
     */
    data: Prisma.InvestmentCreateManyInput | Prisma.InvestmentCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.InvestmentIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * Investment update
 */
export type InvestmentUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Investment
     */
    select?: Prisma.InvestmentSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Investment
     */
    omit?: Prisma.InvestmentOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.InvestmentInclude<ExtArgs> | null;
    /**
     * The data needed to update a Investment.
     */
    data: Prisma.XOR<Prisma.InvestmentUpdateInput, Prisma.InvestmentUncheckedUpdateInput>;
    /**
     * Choose, which Investment to update.
     */
    where: Prisma.InvestmentWhereUniqueInput;
};
/**
 * Investment updateMany
 */
export type InvestmentUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update Investments.
     */
    data: Prisma.XOR<Prisma.InvestmentUpdateManyMutationInput, Prisma.InvestmentUncheckedUpdateManyInput>;
    /**
     * Filter which Investments to update
     */
    where?: Prisma.InvestmentWhereInput;
    /**
     * Limit how many Investments to update.
     */
    limit?: number;
};
/**
 * Investment updateManyAndReturn
 */
export type InvestmentUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Investment
     */
    select?: Prisma.InvestmentSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Investment
     */
    omit?: Prisma.InvestmentOmit<ExtArgs> | null;
    /**
     * The data used to update Investments.
     */
    data: Prisma.XOR<Prisma.InvestmentUpdateManyMutationInput, Prisma.InvestmentUncheckedUpdateManyInput>;
    /**
     * Filter which Investments to update
     */
    where?: Prisma.InvestmentWhereInput;
    /**
     * Limit how many Investments to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.InvestmentIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * Investment upsert
 */
export type InvestmentUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Investment
     */
    select?: Prisma.InvestmentSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Investment
     */
    omit?: Prisma.InvestmentOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.InvestmentInclude<ExtArgs> | null;
    /**
     * The filter to search for the Investment to update in case it exists.
     */
    where: Prisma.InvestmentWhereUniqueInput;
    /**
     * In case the Investment found by the `where` argument doesn't exist, create a new Investment with this data.
     */
    create: Prisma.XOR<Prisma.InvestmentCreateInput, Prisma.InvestmentUncheckedCreateInput>;
    /**
     * In case the Investment was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.InvestmentUpdateInput, Prisma.InvestmentUncheckedUpdateInput>;
};
/**
 * Investment delete
 */
export type InvestmentDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Investment
     */
    select?: Prisma.InvestmentSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Investment
     */
    omit?: Prisma.InvestmentOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.InvestmentInclude<ExtArgs> | null;
    /**
     * Filter which Investment to delete.
     */
    where: Prisma.InvestmentWhereUniqueInput;
};
/**
 * Investment deleteMany
 */
export type InvestmentDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which Investments to delete
     */
    where?: Prisma.InvestmentWhereInput;
    /**
     * Limit how many Investments to delete.
     */
    limit?: number;
};
/**
 * Investment without action
 */
export type InvestmentDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Investment
     */
    select?: Prisma.InvestmentSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Investment
     */
    omit?: Prisma.InvestmentOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.InvestmentInclude<ExtArgs> | null;
};
export {};
//# sourceMappingURL=Investment.d.ts.map