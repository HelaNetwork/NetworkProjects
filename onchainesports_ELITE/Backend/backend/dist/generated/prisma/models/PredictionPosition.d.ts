import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model PredictionPosition
 *
 */
export type PredictionPositionModel = runtime.Types.Result.DefaultSelection<Prisma.$PredictionPositionPayload>;
export type AggregatePredictionPosition = {
    _count: PredictionPositionCountAggregateOutputType | null;
    _avg: PredictionPositionAvgAggregateOutputType | null;
    _sum: PredictionPositionSumAggregateOutputType | null;
    _min: PredictionPositionMinAggregateOutputType | null;
    _max: PredictionPositionMaxAggregateOutputType | null;
};
export type PredictionPositionAvgAggregateOutputType = {
    amount: number | null;
    avgPrice: number | null;
};
export type PredictionPositionSumAggregateOutputType = {
    amount: number | null;
    avgPrice: number | null;
};
export type PredictionPositionMinAggregateOutputType = {
    id: string | null;
    userId: string | null;
    marketId: string | null;
    team: $Enums.PredictionSide | null;
    amount: number | null;
    avgPrice: number | null;
    createdAt: Date | null;
};
export type PredictionPositionMaxAggregateOutputType = {
    id: string | null;
    userId: string | null;
    marketId: string | null;
    team: $Enums.PredictionSide | null;
    amount: number | null;
    avgPrice: number | null;
    createdAt: Date | null;
};
export type PredictionPositionCountAggregateOutputType = {
    id: number;
    userId: number;
    marketId: number;
    team: number;
    amount: number;
    avgPrice: number;
    createdAt: number;
    _all: number;
};
export type PredictionPositionAvgAggregateInputType = {
    amount?: true;
    avgPrice?: true;
};
export type PredictionPositionSumAggregateInputType = {
    amount?: true;
    avgPrice?: true;
};
export type PredictionPositionMinAggregateInputType = {
    id?: true;
    userId?: true;
    marketId?: true;
    team?: true;
    amount?: true;
    avgPrice?: true;
    createdAt?: true;
};
export type PredictionPositionMaxAggregateInputType = {
    id?: true;
    userId?: true;
    marketId?: true;
    team?: true;
    amount?: true;
    avgPrice?: true;
    createdAt?: true;
};
export type PredictionPositionCountAggregateInputType = {
    id?: true;
    userId?: true;
    marketId?: true;
    team?: true;
    amount?: true;
    avgPrice?: true;
    createdAt?: true;
    _all?: true;
};
export type PredictionPositionAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which PredictionPosition to aggregate.
     */
    where?: Prisma.PredictionPositionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of PredictionPositions to fetch.
     */
    orderBy?: Prisma.PredictionPositionOrderByWithRelationInput | Prisma.PredictionPositionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.PredictionPositionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` PredictionPositions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` PredictionPositions.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned PredictionPositions
    **/
    _count?: true | PredictionPositionCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: PredictionPositionAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: PredictionPositionSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: PredictionPositionMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: PredictionPositionMaxAggregateInputType;
};
export type GetPredictionPositionAggregateType<T extends PredictionPositionAggregateArgs> = {
    [P in keyof T & keyof AggregatePredictionPosition]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregatePredictionPosition[P]> : Prisma.GetScalarType<T[P], AggregatePredictionPosition[P]>;
};
export type PredictionPositionGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PredictionPositionWhereInput;
    orderBy?: Prisma.PredictionPositionOrderByWithAggregationInput | Prisma.PredictionPositionOrderByWithAggregationInput[];
    by: Prisma.PredictionPositionScalarFieldEnum[] | Prisma.PredictionPositionScalarFieldEnum;
    having?: Prisma.PredictionPositionScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: PredictionPositionCountAggregateInputType | true;
    _avg?: PredictionPositionAvgAggregateInputType;
    _sum?: PredictionPositionSumAggregateInputType;
    _min?: PredictionPositionMinAggregateInputType;
    _max?: PredictionPositionMaxAggregateInputType;
};
export type PredictionPositionGroupByOutputType = {
    id: string;
    userId: string;
    marketId: string;
    team: $Enums.PredictionSide;
    amount: number;
    avgPrice: number;
    createdAt: Date;
    _count: PredictionPositionCountAggregateOutputType | null;
    _avg: PredictionPositionAvgAggregateOutputType | null;
    _sum: PredictionPositionSumAggregateOutputType | null;
    _min: PredictionPositionMinAggregateOutputType | null;
    _max: PredictionPositionMaxAggregateOutputType | null;
};
type GetPredictionPositionGroupByPayload<T extends PredictionPositionGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<PredictionPositionGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof PredictionPositionGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], PredictionPositionGroupByOutputType[P]> : Prisma.GetScalarType<T[P], PredictionPositionGroupByOutputType[P]>;
}>>;
export type PredictionPositionWhereInput = {
    AND?: Prisma.PredictionPositionWhereInput | Prisma.PredictionPositionWhereInput[];
    OR?: Prisma.PredictionPositionWhereInput[];
    NOT?: Prisma.PredictionPositionWhereInput | Prisma.PredictionPositionWhereInput[];
    id?: Prisma.StringFilter<"PredictionPosition"> | string;
    userId?: Prisma.StringFilter<"PredictionPosition"> | string;
    marketId?: Prisma.StringFilter<"PredictionPosition"> | string;
    team?: Prisma.EnumPredictionSideFilter<"PredictionPosition"> | $Enums.PredictionSide;
    amount?: Prisma.IntFilter<"PredictionPosition"> | number;
    avgPrice?: Prisma.FloatFilter<"PredictionPosition"> | number;
    createdAt?: Prisma.DateTimeFilter<"PredictionPosition"> | Date | string;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    market?: Prisma.XOR<Prisma.PredictionMarketScalarRelationFilter, Prisma.PredictionMarketWhereInput>;
};
export type PredictionPositionOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    marketId?: Prisma.SortOrder;
    team?: Prisma.SortOrder;
    amount?: Prisma.SortOrder;
    avgPrice?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    user?: Prisma.UserOrderByWithRelationInput;
    market?: Prisma.PredictionMarketOrderByWithRelationInput;
};
export type PredictionPositionWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.PredictionPositionWhereInput | Prisma.PredictionPositionWhereInput[];
    OR?: Prisma.PredictionPositionWhereInput[];
    NOT?: Prisma.PredictionPositionWhereInput | Prisma.PredictionPositionWhereInput[];
    userId?: Prisma.StringFilter<"PredictionPosition"> | string;
    marketId?: Prisma.StringFilter<"PredictionPosition"> | string;
    team?: Prisma.EnumPredictionSideFilter<"PredictionPosition"> | $Enums.PredictionSide;
    amount?: Prisma.IntFilter<"PredictionPosition"> | number;
    avgPrice?: Prisma.FloatFilter<"PredictionPosition"> | number;
    createdAt?: Prisma.DateTimeFilter<"PredictionPosition"> | Date | string;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    market?: Prisma.XOR<Prisma.PredictionMarketScalarRelationFilter, Prisma.PredictionMarketWhereInput>;
}, "id">;
export type PredictionPositionOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    marketId?: Prisma.SortOrder;
    team?: Prisma.SortOrder;
    amount?: Prisma.SortOrder;
    avgPrice?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    _count?: Prisma.PredictionPositionCountOrderByAggregateInput;
    _avg?: Prisma.PredictionPositionAvgOrderByAggregateInput;
    _max?: Prisma.PredictionPositionMaxOrderByAggregateInput;
    _min?: Prisma.PredictionPositionMinOrderByAggregateInput;
    _sum?: Prisma.PredictionPositionSumOrderByAggregateInput;
};
export type PredictionPositionScalarWhereWithAggregatesInput = {
    AND?: Prisma.PredictionPositionScalarWhereWithAggregatesInput | Prisma.PredictionPositionScalarWhereWithAggregatesInput[];
    OR?: Prisma.PredictionPositionScalarWhereWithAggregatesInput[];
    NOT?: Prisma.PredictionPositionScalarWhereWithAggregatesInput | Prisma.PredictionPositionScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"PredictionPosition"> | string;
    userId?: Prisma.StringWithAggregatesFilter<"PredictionPosition"> | string;
    marketId?: Prisma.StringWithAggregatesFilter<"PredictionPosition"> | string;
    team?: Prisma.EnumPredictionSideWithAggregatesFilter<"PredictionPosition"> | $Enums.PredictionSide;
    amount?: Prisma.IntWithAggregatesFilter<"PredictionPosition"> | number;
    avgPrice?: Prisma.FloatWithAggregatesFilter<"PredictionPosition"> | number;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"PredictionPosition"> | Date | string;
};
export type PredictionPositionCreateInput = {
    id?: string;
    team: $Enums.PredictionSide;
    amount: number;
    avgPrice: number;
    createdAt?: Date | string;
    user: Prisma.UserCreateNestedOneWithoutPredictionsInput;
    market: Prisma.PredictionMarketCreateNestedOneWithoutPositionsInput;
};
export type PredictionPositionUncheckedCreateInput = {
    id?: string;
    userId: string;
    marketId: string;
    team: $Enums.PredictionSide;
    amount: number;
    avgPrice: number;
    createdAt?: Date | string;
};
export type PredictionPositionUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    team?: Prisma.EnumPredictionSideFieldUpdateOperationsInput | $Enums.PredictionSide;
    amount?: Prisma.IntFieldUpdateOperationsInput | number;
    avgPrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneRequiredWithoutPredictionsNestedInput;
    market?: Prisma.PredictionMarketUpdateOneRequiredWithoutPositionsNestedInput;
};
export type PredictionPositionUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    marketId?: Prisma.StringFieldUpdateOperationsInput | string;
    team?: Prisma.EnumPredictionSideFieldUpdateOperationsInput | $Enums.PredictionSide;
    amount?: Prisma.IntFieldUpdateOperationsInput | number;
    avgPrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PredictionPositionCreateManyInput = {
    id?: string;
    userId: string;
    marketId: string;
    team: $Enums.PredictionSide;
    amount: number;
    avgPrice: number;
    createdAt?: Date | string;
};
export type PredictionPositionUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    team?: Prisma.EnumPredictionSideFieldUpdateOperationsInput | $Enums.PredictionSide;
    amount?: Prisma.IntFieldUpdateOperationsInput | number;
    avgPrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PredictionPositionUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    marketId?: Prisma.StringFieldUpdateOperationsInput | string;
    team?: Prisma.EnumPredictionSideFieldUpdateOperationsInput | $Enums.PredictionSide;
    amount?: Prisma.IntFieldUpdateOperationsInput | number;
    avgPrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PredictionPositionListRelationFilter = {
    every?: Prisma.PredictionPositionWhereInput;
    some?: Prisma.PredictionPositionWhereInput;
    none?: Prisma.PredictionPositionWhereInput;
};
export type PredictionPositionOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type PredictionPositionCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    marketId?: Prisma.SortOrder;
    team?: Prisma.SortOrder;
    amount?: Prisma.SortOrder;
    avgPrice?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type PredictionPositionAvgOrderByAggregateInput = {
    amount?: Prisma.SortOrder;
    avgPrice?: Prisma.SortOrder;
};
export type PredictionPositionMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    marketId?: Prisma.SortOrder;
    team?: Prisma.SortOrder;
    amount?: Prisma.SortOrder;
    avgPrice?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type PredictionPositionMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    marketId?: Prisma.SortOrder;
    team?: Prisma.SortOrder;
    amount?: Prisma.SortOrder;
    avgPrice?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type PredictionPositionSumOrderByAggregateInput = {
    amount?: Prisma.SortOrder;
    avgPrice?: Prisma.SortOrder;
};
export type PredictionPositionCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.PredictionPositionCreateWithoutUserInput, Prisma.PredictionPositionUncheckedCreateWithoutUserInput> | Prisma.PredictionPositionCreateWithoutUserInput[] | Prisma.PredictionPositionUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.PredictionPositionCreateOrConnectWithoutUserInput | Prisma.PredictionPositionCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.PredictionPositionCreateManyUserInputEnvelope;
    connect?: Prisma.PredictionPositionWhereUniqueInput | Prisma.PredictionPositionWhereUniqueInput[];
};
export type PredictionPositionUncheckedCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.PredictionPositionCreateWithoutUserInput, Prisma.PredictionPositionUncheckedCreateWithoutUserInput> | Prisma.PredictionPositionCreateWithoutUserInput[] | Prisma.PredictionPositionUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.PredictionPositionCreateOrConnectWithoutUserInput | Prisma.PredictionPositionCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.PredictionPositionCreateManyUserInputEnvelope;
    connect?: Prisma.PredictionPositionWhereUniqueInput | Prisma.PredictionPositionWhereUniqueInput[];
};
export type PredictionPositionUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.PredictionPositionCreateWithoutUserInput, Prisma.PredictionPositionUncheckedCreateWithoutUserInput> | Prisma.PredictionPositionCreateWithoutUserInput[] | Prisma.PredictionPositionUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.PredictionPositionCreateOrConnectWithoutUserInput | Prisma.PredictionPositionCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.PredictionPositionUpsertWithWhereUniqueWithoutUserInput | Prisma.PredictionPositionUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.PredictionPositionCreateManyUserInputEnvelope;
    set?: Prisma.PredictionPositionWhereUniqueInput | Prisma.PredictionPositionWhereUniqueInput[];
    disconnect?: Prisma.PredictionPositionWhereUniqueInput | Prisma.PredictionPositionWhereUniqueInput[];
    delete?: Prisma.PredictionPositionWhereUniqueInput | Prisma.PredictionPositionWhereUniqueInput[];
    connect?: Prisma.PredictionPositionWhereUniqueInput | Prisma.PredictionPositionWhereUniqueInput[];
    update?: Prisma.PredictionPositionUpdateWithWhereUniqueWithoutUserInput | Prisma.PredictionPositionUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.PredictionPositionUpdateManyWithWhereWithoutUserInput | Prisma.PredictionPositionUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.PredictionPositionScalarWhereInput | Prisma.PredictionPositionScalarWhereInput[];
};
export type PredictionPositionUncheckedUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.PredictionPositionCreateWithoutUserInput, Prisma.PredictionPositionUncheckedCreateWithoutUserInput> | Prisma.PredictionPositionCreateWithoutUserInput[] | Prisma.PredictionPositionUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.PredictionPositionCreateOrConnectWithoutUserInput | Prisma.PredictionPositionCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.PredictionPositionUpsertWithWhereUniqueWithoutUserInput | Prisma.PredictionPositionUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.PredictionPositionCreateManyUserInputEnvelope;
    set?: Prisma.PredictionPositionWhereUniqueInput | Prisma.PredictionPositionWhereUniqueInput[];
    disconnect?: Prisma.PredictionPositionWhereUniqueInput | Prisma.PredictionPositionWhereUniqueInput[];
    delete?: Prisma.PredictionPositionWhereUniqueInput | Prisma.PredictionPositionWhereUniqueInput[];
    connect?: Prisma.PredictionPositionWhereUniqueInput | Prisma.PredictionPositionWhereUniqueInput[];
    update?: Prisma.PredictionPositionUpdateWithWhereUniqueWithoutUserInput | Prisma.PredictionPositionUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.PredictionPositionUpdateManyWithWhereWithoutUserInput | Prisma.PredictionPositionUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.PredictionPositionScalarWhereInput | Prisma.PredictionPositionScalarWhereInput[];
};
export type PredictionPositionCreateNestedManyWithoutMarketInput = {
    create?: Prisma.XOR<Prisma.PredictionPositionCreateWithoutMarketInput, Prisma.PredictionPositionUncheckedCreateWithoutMarketInput> | Prisma.PredictionPositionCreateWithoutMarketInput[] | Prisma.PredictionPositionUncheckedCreateWithoutMarketInput[];
    connectOrCreate?: Prisma.PredictionPositionCreateOrConnectWithoutMarketInput | Prisma.PredictionPositionCreateOrConnectWithoutMarketInput[];
    createMany?: Prisma.PredictionPositionCreateManyMarketInputEnvelope;
    connect?: Prisma.PredictionPositionWhereUniqueInput | Prisma.PredictionPositionWhereUniqueInput[];
};
export type PredictionPositionUncheckedCreateNestedManyWithoutMarketInput = {
    create?: Prisma.XOR<Prisma.PredictionPositionCreateWithoutMarketInput, Prisma.PredictionPositionUncheckedCreateWithoutMarketInput> | Prisma.PredictionPositionCreateWithoutMarketInput[] | Prisma.PredictionPositionUncheckedCreateWithoutMarketInput[];
    connectOrCreate?: Prisma.PredictionPositionCreateOrConnectWithoutMarketInput | Prisma.PredictionPositionCreateOrConnectWithoutMarketInput[];
    createMany?: Prisma.PredictionPositionCreateManyMarketInputEnvelope;
    connect?: Prisma.PredictionPositionWhereUniqueInput | Prisma.PredictionPositionWhereUniqueInput[];
};
export type PredictionPositionUpdateManyWithoutMarketNestedInput = {
    create?: Prisma.XOR<Prisma.PredictionPositionCreateWithoutMarketInput, Prisma.PredictionPositionUncheckedCreateWithoutMarketInput> | Prisma.PredictionPositionCreateWithoutMarketInput[] | Prisma.PredictionPositionUncheckedCreateWithoutMarketInput[];
    connectOrCreate?: Prisma.PredictionPositionCreateOrConnectWithoutMarketInput | Prisma.PredictionPositionCreateOrConnectWithoutMarketInput[];
    upsert?: Prisma.PredictionPositionUpsertWithWhereUniqueWithoutMarketInput | Prisma.PredictionPositionUpsertWithWhereUniqueWithoutMarketInput[];
    createMany?: Prisma.PredictionPositionCreateManyMarketInputEnvelope;
    set?: Prisma.PredictionPositionWhereUniqueInput | Prisma.PredictionPositionWhereUniqueInput[];
    disconnect?: Prisma.PredictionPositionWhereUniqueInput | Prisma.PredictionPositionWhereUniqueInput[];
    delete?: Prisma.PredictionPositionWhereUniqueInput | Prisma.PredictionPositionWhereUniqueInput[];
    connect?: Prisma.PredictionPositionWhereUniqueInput | Prisma.PredictionPositionWhereUniqueInput[];
    update?: Prisma.PredictionPositionUpdateWithWhereUniqueWithoutMarketInput | Prisma.PredictionPositionUpdateWithWhereUniqueWithoutMarketInput[];
    updateMany?: Prisma.PredictionPositionUpdateManyWithWhereWithoutMarketInput | Prisma.PredictionPositionUpdateManyWithWhereWithoutMarketInput[];
    deleteMany?: Prisma.PredictionPositionScalarWhereInput | Prisma.PredictionPositionScalarWhereInput[];
};
export type PredictionPositionUncheckedUpdateManyWithoutMarketNestedInput = {
    create?: Prisma.XOR<Prisma.PredictionPositionCreateWithoutMarketInput, Prisma.PredictionPositionUncheckedCreateWithoutMarketInput> | Prisma.PredictionPositionCreateWithoutMarketInput[] | Prisma.PredictionPositionUncheckedCreateWithoutMarketInput[];
    connectOrCreate?: Prisma.PredictionPositionCreateOrConnectWithoutMarketInput | Prisma.PredictionPositionCreateOrConnectWithoutMarketInput[];
    upsert?: Prisma.PredictionPositionUpsertWithWhereUniqueWithoutMarketInput | Prisma.PredictionPositionUpsertWithWhereUniqueWithoutMarketInput[];
    createMany?: Prisma.PredictionPositionCreateManyMarketInputEnvelope;
    set?: Prisma.PredictionPositionWhereUniqueInput | Prisma.PredictionPositionWhereUniqueInput[];
    disconnect?: Prisma.PredictionPositionWhereUniqueInput | Prisma.PredictionPositionWhereUniqueInput[];
    delete?: Prisma.PredictionPositionWhereUniqueInput | Prisma.PredictionPositionWhereUniqueInput[];
    connect?: Prisma.PredictionPositionWhereUniqueInput | Prisma.PredictionPositionWhereUniqueInput[];
    update?: Prisma.PredictionPositionUpdateWithWhereUniqueWithoutMarketInput | Prisma.PredictionPositionUpdateWithWhereUniqueWithoutMarketInput[];
    updateMany?: Prisma.PredictionPositionUpdateManyWithWhereWithoutMarketInput | Prisma.PredictionPositionUpdateManyWithWhereWithoutMarketInput[];
    deleteMany?: Prisma.PredictionPositionScalarWhereInput | Prisma.PredictionPositionScalarWhereInput[];
};
export type EnumPredictionSideFieldUpdateOperationsInput = {
    set?: $Enums.PredictionSide;
};
export type PredictionPositionCreateWithoutUserInput = {
    id?: string;
    team: $Enums.PredictionSide;
    amount: number;
    avgPrice: number;
    createdAt?: Date | string;
    market: Prisma.PredictionMarketCreateNestedOneWithoutPositionsInput;
};
export type PredictionPositionUncheckedCreateWithoutUserInput = {
    id?: string;
    marketId: string;
    team: $Enums.PredictionSide;
    amount: number;
    avgPrice: number;
    createdAt?: Date | string;
};
export type PredictionPositionCreateOrConnectWithoutUserInput = {
    where: Prisma.PredictionPositionWhereUniqueInput;
    create: Prisma.XOR<Prisma.PredictionPositionCreateWithoutUserInput, Prisma.PredictionPositionUncheckedCreateWithoutUserInput>;
};
export type PredictionPositionCreateManyUserInputEnvelope = {
    data: Prisma.PredictionPositionCreateManyUserInput | Prisma.PredictionPositionCreateManyUserInput[];
    skipDuplicates?: boolean;
};
export type PredictionPositionUpsertWithWhereUniqueWithoutUserInput = {
    where: Prisma.PredictionPositionWhereUniqueInput;
    update: Prisma.XOR<Prisma.PredictionPositionUpdateWithoutUserInput, Prisma.PredictionPositionUncheckedUpdateWithoutUserInput>;
    create: Prisma.XOR<Prisma.PredictionPositionCreateWithoutUserInput, Prisma.PredictionPositionUncheckedCreateWithoutUserInput>;
};
export type PredictionPositionUpdateWithWhereUniqueWithoutUserInput = {
    where: Prisma.PredictionPositionWhereUniqueInput;
    data: Prisma.XOR<Prisma.PredictionPositionUpdateWithoutUserInput, Prisma.PredictionPositionUncheckedUpdateWithoutUserInput>;
};
export type PredictionPositionUpdateManyWithWhereWithoutUserInput = {
    where: Prisma.PredictionPositionScalarWhereInput;
    data: Prisma.XOR<Prisma.PredictionPositionUpdateManyMutationInput, Prisma.PredictionPositionUncheckedUpdateManyWithoutUserInput>;
};
export type PredictionPositionScalarWhereInput = {
    AND?: Prisma.PredictionPositionScalarWhereInput | Prisma.PredictionPositionScalarWhereInput[];
    OR?: Prisma.PredictionPositionScalarWhereInput[];
    NOT?: Prisma.PredictionPositionScalarWhereInput | Prisma.PredictionPositionScalarWhereInput[];
    id?: Prisma.StringFilter<"PredictionPosition"> | string;
    userId?: Prisma.StringFilter<"PredictionPosition"> | string;
    marketId?: Prisma.StringFilter<"PredictionPosition"> | string;
    team?: Prisma.EnumPredictionSideFilter<"PredictionPosition"> | $Enums.PredictionSide;
    amount?: Prisma.IntFilter<"PredictionPosition"> | number;
    avgPrice?: Prisma.FloatFilter<"PredictionPosition"> | number;
    createdAt?: Prisma.DateTimeFilter<"PredictionPosition"> | Date | string;
};
export type PredictionPositionCreateWithoutMarketInput = {
    id?: string;
    team: $Enums.PredictionSide;
    amount: number;
    avgPrice: number;
    createdAt?: Date | string;
    user: Prisma.UserCreateNestedOneWithoutPredictionsInput;
};
export type PredictionPositionUncheckedCreateWithoutMarketInput = {
    id?: string;
    userId: string;
    team: $Enums.PredictionSide;
    amount: number;
    avgPrice: number;
    createdAt?: Date | string;
};
export type PredictionPositionCreateOrConnectWithoutMarketInput = {
    where: Prisma.PredictionPositionWhereUniqueInput;
    create: Prisma.XOR<Prisma.PredictionPositionCreateWithoutMarketInput, Prisma.PredictionPositionUncheckedCreateWithoutMarketInput>;
};
export type PredictionPositionCreateManyMarketInputEnvelope = {
    data: Prisma.PredictionPositionCreateManyMarketInput | Prisma.PredictionPositionCreateManyMarketInput[];
    skipDuplicates?: boolean;
};
export type PredictionPositionUpsertWithWhereUniqueWithoutMarketInput = {
    where: Prisma.PredictionPositionWhereUniqueInput;
    update: Prisma.XOR<Prisma.PredictionPositionUpdateWithoutMarketInput, Prisma.PredictionPositionUncheckedUpdateWithoutMarketInput>;
    create: Prisma.XOR<Prisma.PredictionPositionCreateWithoutMarketInput, Prisma.PredictionPositionUncheckedCreateWithoutMarketInput>;
};
export type PredictionPositionUpdateWithWhereUniqueWithoutMarketInput = {
    where: Prisma.PredictionPositionWhereUniqueInput;
    data: Prisma.XOR<Prisma.PredictionPositionUpdateWithoutMarketInput, Prisma.PredictionPositionUncheckedUpdateWithoutMarketInput>;
};
export type PredictionPositionUpdateManyWithWhereWithoutMarketInput = {
    where: Prisma.PredictionPositionScalarWhereInput;
    data: Prisma.XOR<Prisma.PredictionPositionUpdateManyMutationInput, Prisma.PredictionPositionUncheckedUpdateManyWithoutMarketInput>;
};
export type PredictionPositionCreateManyUserInput = {
    id?: string;
    marketId: string;
    team: $Enums.PredictionSide;
    amount: number;
    avgPrice: number;
    createdAt?: Date | string;
};
export type PredictionPositionUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    team?: Prisma.EnumPredictionSideFieldUpdateOperationsInput | $Enums.PredictionSide;
    amount?: Prisma.IntFieldUpdateOperationsInput | number;
    avgPrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    market?: Prisma.PredictionMarketUpdateOneRequiredWithoutPositionsNestedInput;
};
export type PredictionPositionUncheckedUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    marketId?: Prisma.StringFieldUpdateOperationsInput | string;
    team?: Prisma.EnumPredictionSideFieldUpdateOperationsInput | $Enums.PredictionSide;
    amount?: Prisma.IntFieldUpdateOperationsInput | number;
    avgPrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PredictionPositionUncheckedUpdateManyWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    marketId?: Prisma.StringFieldUpdateOperationsInput | string;
    team?: Prisma.EnumPredictionSideFieldUpdateOperationsInput | $Enums.PredictionSide;
    amount?: Prisma.IntFieldUpdateOperationsInput | number;
    avgPrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PredictionPositionCreateManyMarketInput = {
    id?: string;
    userId: string;
    team: $Enums.PredictionSide;
    amount: number;
    avgPrice: number;
    createdAt?: Date | string;
};
export type PredictionPositionUpdateWithoutMarketInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    team?: Prisma.EnumPredictionSideFieldUpdateOperationsInput | $Enums.PredictionSide;
    amount?: Prisma.IntFieldUpdateOperationsInput | number;
    avgPrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneRequiredWithoutPredictionsNestedInput;
};
export type PredictionPositionUncheckedUpdateWithoutMarketInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    team?: Prisma.EnumPredictionSideFieldUpdateOperationsInput | $Enums.PredictionSide;
    amount?: Prisma.IntFieldUpdateOperationsInput | number;
    avgPrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PredictionPositionUncheckedUpdateManyWithoutMarketInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    team?: Prisma.EnumPredictionSideFieldUpdateOperationsInput | $Enums.PredictionSide;
    amount?: Prisma.IntFieldUpdateOperationsInput | number;
    avgPrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PredictionPositionSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    marketId?: boolean;
    team?: boolean;
    amount?: boolean;
    avgPrice?: boolean;
    createdAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    market?: boolean | Prisma.PredictionMarketDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["predictionPosition"]>;
export type PredictionPositionSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    marketId?: boolean;
    team?: boolean;
    amount?: boolean;
    avgPrice?: boolean;
    createdAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    market?: boolean | Prisma.PredictionMarketDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["predictionPosition"]>;
export type PredictionPositionSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    marketId?: boolean;
    team?: boolean;
    amount?: boolean;
    avgPrice?: boolean;
    createdAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    market?: boolean | Prisma.PredictionMarketDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["predictionPosition"]>;
export type PredictionPositionSelectScalar = {
    id?: boolean;
    userId?: boolean;
    marketId?: boolean;
    team?: boolean;
    amount?: boolean;
    avgPrice?: boolean;
    createdAt?: boolean;
};
export type PredictionPositionOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "userId" | "marketId" | "team" | "amount" | "avgPrice" | "createdAt", ExtArgs["result"]["predictionPosition"]>;
export type PredictionPositionInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    market?: boolean | Prisma.PredictionMarketDefaultArgs<ExtArgs>;
};
export type PredictionPositionIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    market?: boolean | Prisma.PredictionMarketDefaultArgs<ExtArgs>;
};
export type PredictionPositionIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    market?: boolean | Prisma.PredictionMarketDefaultArgs<ExtArgs>;
};
export type $PredictionPositionPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "PredictionPosition";
    objects: {
        user: Prisma.$UserPayload<ExtArgs>;
        market: Prisma.$PredictionMarketPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        userId: string;
        marketId: string;
        team: $Enums.PredictionSide;
        amount: number;
        avgPrice: number;
        createdAt: Date;
    }, ExtArgs["result"]["predictionPosition"]>;
    composites: {};
};
export type PredictionPositionGetPayload<S extends boolean | null | undefined | PredictionPositionDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$PredictionPositionPayload, S>;
export type PredictionPositionCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<PredictionPositionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: PredictionPositionCountAggregateInputType | true;
};
export interface PredictionPositionDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['PredictionPosition'];
        meta: {
            name: 'PredictionPosition';
        };
    };
    /**
     * Find zero or one PredictionPosition that matches the filter.
     * @param {PredictionPositionFindUniqueArgs} args - Arguments to find a PredictionPosition
     * @example
     * // Get one PredictionPosition
     * const predictionPosition = await prisma.predictionPosition.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PredictionPositionFindUniqueArgs>(args: Prisma.SelectSubset<T, PredictionPositionFindUniqueArgs<ExtArgs>>): Prisma.Prisma__PredictionPositionClient<runtime.Types.Result.GetResult<Prisma.$PredictionPositionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one PredictionPosition that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PredictionPositionFindUniqueOrThrowArgs} args - Arguments to find a PredictionPosition
     * @example
     * // Get one PredictionPosition
     * const predictionPosition = await prisma.predictionPosition.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PredictionPositionFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, PredictionPositionFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__PredictionPositionClient<runtime.Types.Result.GetResult<Prisma.$PredictionPositionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first PredictionPosition that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PredictionPositionFindFirstArgs} args - Arguments to find a PredictionPosition
     * @example
     * // Get one PredictionPosition
     * const predictionPosition = await prisma.predictionPosition.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PredictionPositionFindFirstArgs>(args?: Prisma.SelectSubset<T, PredictionPositionFindFirstArgs<ExtArgs>>): Prisma.Prisma__PredictionPositionClient<runtime.Types.Result.GetResult<Prisma.$PredictionPositionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first PredictionPosition that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PredictionPositionFindFirstOrThrowArgs} args - Arguments to find a PredictionPosition
     * @example
     * // Get one PredictionPosition
     * const predictionPosition = await prisma.predictionPosition.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PredictionPositionFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, PredictionPositionFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__PredictionPositionClient<runtime.Types.Result.GetResult<Prisma.$PredictionPositionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more PredictionPositions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PredictionPositionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PredictionPositions
     * const predictionPositions = await prisma.predictionPosition.findMany()
     *
     * // Get first 10 PredictionPositions
     * const predictionPositions = await prisma.predictionPosition.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const predictionPositionWithIdOnly = await prisma.predictionPosition.findMany({ select: { id: true } })
     *
     */
    findMany<T extends PredictionPositionFindManyArgs>(args?: Prisma.SelectSubset<T, PredictionPositionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PredictionPositionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a PredictionPosition.
     * @param {PredictionPositionCreateArgs} args - Arguments to create a PredictionPosition.
     * @example
     * // Create one PredictionPosition
     * const PredictionPosition = await prisma.predictionPosition.create({
     *   data: {
     *     // ... data to create a PredictionPosition
     *   }
     * })
     *
     */
    create<T extends PredictionPositionCreateArgs>(args: Prisma.SelectSubset<T, PredictionPositionCreateArgs<ExtArgs>>): Prisma.Prisma__PredictionPositionClient<runtime.Types.Result.GetResult<Prisma.$PredictionPositionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many PredictionPositions.
     * @param {PredictionPositionCreateManyArgs} args - Arguments to create many PredictionPositions.
     * @example
     * // Create many PredictionPositions
     * const predictionPosition = await prisma.predictionPosition.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends PredictionPositionCreateManyArgs>(args?: Prisma.SelectSubset<T, PredictionPositionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many PredictionPositions and returns the data saved in the database.
     * @param {PredictionPositionCreateManyAndReturnArgs} args - Arguments to create many PredictionPositions.
     * @example
     * // Create many PredictionPositions
     * const predictionPosition = await prisma.predictionPosition.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many PredictionPositions and only return the `id`
     * const predictionPositionWithIdOnly = await prisma.predictionPosition.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends PredictionPositionCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, PredictionPositionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PredictionPositionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a PredictionPosition.
     * @param {PredictionPositionDeleteArgs} args - Arguments to delete one PredictionPosition.
     * @example
     * // Delete one PredictionPosition
     * const PredictionPosition = await prisma.predictionPosition.delete({
     *   where: {
     *     // ... filter to delete one PredictionPosition
     *   }
     * })
     *
     */
    delete<T extends PredictionPositionDeleteArgs>(args: Prisma.SelectSubset<T, PredictionPositionDeleteArgs<ExtArgs>>): Prisma.Prisma__PredictionPositionClient<runtime.Types.Result.GetResult<Prisma.$PredictionPositionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one PredictionPosition.
     * @param {PredictionPositionUpdateArgs} args - Arguments to update one PredictionPosition.
     * @example
     * // Update one PredictionPosition
     * const predictionPosition = await prisma.predictionPosition.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends PredictionPositionUpdateArgs>(args: Prisma.SelectSubset<T, PredictionPositionUpdateArgs<ExtArgs>>): Prisma.Prisma__PredictionPositionClient<runtime.Types.Result.GetResult<Prisma.$PredictionPositionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more PredictionPositions.
     * @param {PredictionPositionDeleteManyArgs} args - Arguments to filter PredictionPositions to delete.
     * @example
     * // Delete a few PredictionPositions
     * const { count } = await prisma.predictionPosition.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends PredictionPositionDeleteManyArgs>(args?: Prisma.SelectSubset<T, PredictionPositionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more PredictionPositions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PredictionPositionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PredictionPositions
     * const predictionPosition = await prisma.predictionPosition.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends PredictionPositionUpdateManyArgs>(args: Prisma.SelectSubset<T, PredictionPositionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more PredictionPositions and returns the data updated in the database.
     * @param {PredictionPositionUpdateManyAndReturnArgs} args - Arguments to update many PredictionPositions.
     * @example
     * // Update many PredictionPositions
     * const predictionPosition = await prisma.predictionPosition.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more PredictionPositions and only return the `id`
     * const predictionPositionWithIdOnly = await prisma.predictionPosition.updateManyAndReturn({
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
    updateManyAndReturn<T extends PredictionPositionUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, PredictionPositionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PredictionPositionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one PredictionPosition.
     * @param {PredictionPositionUpsertArgs} args - Arguments to update or create a PredictionPosition.
     * @example
     * // Update or create a PredictionPosition
     * const predictionPosition = await prisma.predictionPosition.upsert({
     *   create: {
     *     // ... data to create a PredictionPosition
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PredictionPosition we want to update
     *   }
     * })
     */
    upsert<T extends PredictionPositionUpsertArgs>(args: Prisma.SelectSubset<T, PredictionPositionUpsertArgs<ExtArgs>>): Prisma.Prisma__PredictionPositionClient<runtime.Types.Result.GetResult<Prisma.$PredictionPositionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of PredictionPositions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PredictionPositionCountArgs} args - Arguments to filter PredictionPositions to count.
     * @example
     * // Count the number of PredictionPositions
     * const count = await prisma.predictionPosition.count({
     *   where: {
     *     // ... the filter for the PredictionPositions we want to count
     *   }
     * })
    **/
    count<T extends PredictionPositionCountArgs>(args?: Prisma.Subset<T, PredictionPositionCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], PredictionPositionCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a PredictionPosition.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PredictionPositionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends PredictionPositionAggregateArgs>(args: Prisma.Subset<T, PredictionPositionAggregateArgs>): Prisma.PrismaPromise<GetPredictionPositionAggregateType<T>>;
    /**
     * Group by PredictionPosition.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PredictionPositionGroupByArgs} args - Group by arguments.
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
    groupBy<T extends PredictionPositionGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: PredictionPositionGroupByArgs['orderBy'];
    } : {
        orderBy?: PredictionPositionGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, PredictionPositionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPredictionPositionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the PredictionPosition model
     */
    readonly fields: PredictionPositionFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for PredictionPosition.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__PredictionPositionClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    user<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    market<T extends Prisma.PredictionMarketDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.PredictionMarketDefaultArgs<ExtArgs>>): Prisma.Prisma__PredictionMarketClient<runtime.Types.Result.GetResult<Prisma.$PredictionMarketPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
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
 * Fields of the PredictionPosition model
 */
export interface PredictionPositionFieldRefs {
    readonly id: Prisma.FieldRef<"PredictionPosition", 'String'>;
    readonly userId: Prisma.FieldRef<"PredictionPosition", 'String'>;
    readonly marketId: Prisma.FieldRef<"PredictionPosition", 'String'>;
    readonly team: Prisma.FieldRef<"PredictionPosition", 'PredictionSide'>;
    readonly amount: Prisma.FieldRef<"PredictionPosition", 'Int'>;
    readonly avgPrice: Prisma.FieldRef<"PredictionPosition", 'Float'>;
    readonly createdAt: Prisma.FieldRef<"PredictionPosition", 'DateTime'>;
}
/**
 * PredictionPosition findUnique
 */
export type PredictionPositionFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PredictionPosition
     */
    select?: Prisma.PredictionPositionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the PredictionPosition
     */
    omit?: Prisma.PredictionPositionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PredictionPositionInclude<ExtArgs> | null;
    /**
     * Filter, which PredictionPosition to fetch.
     */
    where: Prisma.PredictionPositionWhereUniqueInput;
};
/**
 * PredictionPosition findUniqueOrThrow
 */
export type PredictionPositionFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PredictionPosition
     */
    select?: Prisma.PredictionPositionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the PredictionPosition
     */
    omit?: Prisma.PredictionPositionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PredictionPositionInclude<ExtArgs> | null;
    /**
     * Filter, which PredictionPosition to fetch.
     */
    where: Prisma.PredictionPositionWhereUniqueInput;
};
/**
 * PredictionPosition findFirst
 */
export type PredictionPositionFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PredictionPosition
     */
    select?: Prisma.PredictionPositionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the PredictionPosition
     */
    omit?: Prisma.PredictionPositionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PredictionPositionInclude<ExtArgs> | null;
    /**
     * Filter, which PredictionPosition to fetch.
     */
    where?: Prisma.PredictionPositionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of PredictionPositions to fetch.
     */
    orderBy?: Prisma.PredictionPositionOrderByWithRelationInput | Prisma.PredictionPositionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for PredictionPositions.
     */
    cursor?: Prisma.PredictionPositionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` PredictionPositions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` PredictionPositions.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of PredictionPositions.
     */
    distinct?: Prisma.PredictionPositionScalarFieldEnum | Prisma.PredictionPositionScalarFieldEnum[];
};
/**
 * PredictionPosition findFirstOrThrow
 */
export type PredictionPositionFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PredictionPosition
     */
    select?: Prisma.PredictionPositionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the PredictionPosition
     */
    omit?: Prisma.PredictionPositionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PredictionPositionInclude<ExtArgs> | null;
    /**
     * Filter, which PredictionPosition to fetch.
     */
    where?: Prisma.PredictionPositionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of PredictionPositions to fetch.
     */
    orderBy?: Prisma.PredictionPositionOrderByWithRelationInput | Prisma.PredictionPositionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for PredictionPositions.
     */
    cursor?: Prisma.PredictionPositionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` PredictionPositions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` PredictionPositions.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of PredictionPositions.
     */
    distinct?: Prisma.PredictionPositionScalarFieldEnum | Prisma.PredictionPositionScalarFieldEnum[];
};
/**
 * PredictionPosition findMany
 */
export type PredictionPositionFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PredictionPosition
     */
    select?: Prisma.PredictionPositionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the PredictionPosition
     */
    omit?: Prisma.PredictionPositionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PredictionPositionInclude<ExtArgs> | null;
    /**
     * Filter, which PredictionPositions to fetch.
     */
    where?: Prisma.PredictionPositionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of PredictionPositions to fetch.
     */
    orderBy?: Prisma.PredictionPositionOrderByWithRelationInput | Prisma.PredictionPositionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing PredictionPositions.
     */
    cursor?: Prisma.PredictionPositionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` PredictionPositions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` PredictionPositions.
     */
    skip?: number;
    distinct?: Prisma.PredictionPositionScalarFieldEnum | Prisma.PredictionPositionScalarFieldEnum[];
};
/**
 * PredictionPosition create
 */
export type PredictionPositionCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PredictionPosition
     */
    select?: Prisma.PredictionPositionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the PredictionPosition
     */
    omit?: Prisma.PredictionPositionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PredictionPositionInclude<ExtArgs> | null;
    /**
     * The data needed to create a PredictionPosition.
     */
    data: Prisma.XOR<Prisma.PredictionPositionCreateInput, Prisma.PredictionPositionUncheckedCreateInput>;
};
/**
 * PredictionPosition createMany
 */
export type PredictionPositionCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many PredictionPositions.
     */
    data: Prisma.PredictionPositionCreateManyInput | Prisma.PredictionPositionCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * PredictionPosition createManyAndReturn
 */
export type PredictionPositionCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PredictionPosition
     */
    select?: Prisma.PredictionPositionSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the PredictionPosition
     */
    omit?: Prisma.PredictionPositionOmit<ExtArgs> | null;
    /**
     * The data used to create many PredictionPositions.
     */
    data: Prisma.PredictionPositionCreateManyInput | Prisma.PredictionPositionCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PredictionPositionIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * PredictionPosition update
 */
export type PredictionPositionUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PredictionPosition
     */
    select?: Prisma.PredictionPositionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the PredictionPosition
     */
    omit?: Prisma.PredictionPositionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PredictionPositionInclude<ExtArgs> | null;
    /**
     * The data needed to update a PredictionPosition.
     */
    data: Prisma.XOR<Prisma.PredictionPositionUpdateInput, Prisma.PredictionPositionUncheckedUpdateInput>;
    /**
     * Choose, which PredictionPosition to update.
     */
    where: Prisma.PredictionPositionWhereUniqueInput;
};
/**
 * PredictionPosition updateMany
 */
export type PredictionPositionUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update PredictionPositions.
     */
    data: Prisma.XOR<Prisma.PredictionPositionUpdateManyMutationInput, Prisma.PredictionPositionUncheckedUpdateManyInput>;
    /**
     * Filter which PredictionPositions to update
     */
    where?: Prisma.PredictionPositionWhereInput;
    /**
     * Limit how many PredictionPositions to update.
     */
    limit?: number;
};
/**
 * PredictionPosition updateManyAndReturn
 */
export type PredictionPositionUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PredictionPosition
     */
    select?: Prisma.PredictionPositionSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the PredictionPosition
     */
    omit?: Prisma.PredictionPositionOmit<ExtArgs> | null;
    /**
     * The data used to update PredictionPositions.
     */
    data: Prisma.XOR<Prisma.PredictionPositionUpdateManyMutationInput, Prisma.PredictionPositionUncheckedUpdateManyInput>;
    /**
     * Filter which PredictionPositions to update
     */
    where?: Prisma.PredictionPositionWhereInput;
    /**
     * Limit how many PredictionPositions to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PredictionPositionIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * PredictionPosition upsert
 */
export type PredictionPositionUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PredictionPosition
     */
    select?: Prisma.PredictionPositionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the PredictionPosition
     */
    omit?: Prisma.PredictionPositionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PredictionPositionInclude<ExtArgs> | null;
    /**
     * The filter to search for the PredictionPosition to update in case it exists.
     */
    where: Prisma.PredictionPositionWhereUniqueInput;
    /**
     * In case the PredictionPosition found by the `where` argument doesn't exist, create a new PredictionPosition with this data.
     */
    create: Prisma.XOR<Prisma.PredictionPositionCreateInput, Prisma.PredictionPositionUncheckedCreateInput>;
    /**
     * In case the PredictionPosition was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.PredictionPositionUpdateInput, Prisma.PredictionPositionUncheckedUpdateInput>;
};
/**
 * PredictionPosition delete
 */
export type PredictionPositionDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PredictionPosition
     */
    select?: Prisma.PredictionPositionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the PredictionPosition
     */
    omit?: Prisma.PredictionPositionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PredictionPositionInclude<ExtArgs> | null;
    /**
     * Filter which PredictionPosition to delete.
     */
    where: Prisma.PredictionPositionWhereUniqueInput;
};
/**
 * PredictionPosition deleteMany
 */
export type PredictionPositionDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which PredictionPositions to delete
     */
    where?: Prisma.PredictionPositionWhereInput;
    /**
     * Limit how many PredictionPositions to delete.
     */
    limit?: number;
};
/**
 * PredictionPosition without action
 */
export type PredictionPositionDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PredictionPosition
     */
    select?: Prisma.PredictionPositionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the PredictionPosition
     */
    omit?: Prisma.PredictionPositionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PredictionPositionInclude<ExtArgs> | null;
};
export {};
//# sourceMappingURL=PredictionPosition.d.ts.map