import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model PredictionMarket
 *
 */
export type PredictionMarketModel = runtime.Types.Result.DefaultSelection<Prisma.$PredictionMarketPayload>;
export type AggregatePredictionMarket = {
    _count: PredictionMarketCountAggregateOutputType | null;
    _avg: PredictionMarketAvgAggregateOutputType | null;
    _sum: PredictionMarketSumAggregateOutputType | null;
    _min: PredictionMarketMinAggregateOutputType | null;
    _max: PredictionMarketMaxAggregateOutputType | null;
};
export type PredictionMarketAvgAggregateOutputType = {
    liquidityPool: number | null;
    supplyA: number | null;
    supplyB: number | null;
    basePrice: number | null;
    curveK: number | null;
};
export type PredictionMarketSumAggregateOutputType = {
    liquidityPool: number | null;
    supplyA: number | null;
    supplyB: number | null;
    basePrice: number | null;
    curveK: number | null;
};
export type PredictionMarketMinAggregateOutputType = {
    id: string | null;
    matchId: string | null;
    contractAddr: string | null;
    liquidityPool: number | null;
    supplyA: number | null;
    supplyB: number | null;
    basePrice: number | null;
    curveK: number | null;
    status: $Enums.MarketStatus | null;
    createdAt: Date | null;
};
export type PredictionMarketMaxAggregateOutputType = {
    id: string | null;
    matchId: string | null;
    contractAddr: string | null;
    liquidityPool: number | null;
    supplyA: number | null;
    supplyB: number | null;
    basePrice: number | null;
    curveK: number | null;
    status: $Enums.MarketStatus | null;
    createdAt: Date | null;
};
export type PredictionMarketCountAggregateOutputType = {
    id: number;
    matchId: number;
    contractAddr: number;
    liquidityPool: number;
    supplyA: number;
    supplyB: number;
    basePrice: number;
    curveK: number;
    status: number;
    createdAt: number;
    _all: number;
};
export type PredictionMarketAvgAggregateInputType = {
    liquidityPool?: true;
    supplyA?: true;
    supplyB?: true;
    basePrice?: true;
    curveK?: true;
};
export type PredictionMarketSumAggregateInputType = {
    liquidityPool?: true;
    supplyA?: true;
    supplyB?: true;
    basePrice?: true;
    curveK?: true;
};
export type PredictionMarketMinAggregateInputType = {
    id?: true;
    matchId?: true;
    contractAddr?: true;
    liquidityPool?: true;
    supplyA?: true;
    supplyB?: true;
    basePrice?: true;
    curveK?: true;
    status?: true;
    createdAt?: true;
};
export type PredictionMarketMaxAggregateInputType = {
    id?: true;
    matchId?: true;
    contractAddr?: true;
    liquidityPool?: true;
    supplyA?: true;
    supplyB?: true;
    basePrice?: true;
    curveK?: true;
    status?: true;
    createdAt?: true;
};
export type PredictionMarketCountAggregateInputType = {
    id?: true;
    matchId?: true;
    contractAddr?: true;
    liquidityPool?: true;
    supplyA?: true;
    supplyB?: true;
    basePrice?: true;
    curveK?: true;
    status?: true;
    createdAt?: true;
    _all?: true;
};
export type PredictionMarketAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which PredictionMarket to aggregate.
     */
    where?: Prisma.PredictionMarketWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of PredictionMarkets to fetch.
     */
    orderBy?: Prisma.PredictionMarketOrderByWithRelationInput | Prisma.PredictionMarketOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.PredictionMarketWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` PredictionMarkets from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` PredictionMarkets.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned PredictionMarkets
    **/
    _count?: true | PredictionMarketCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: PredictionMarketAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: PredictionMarketSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: PredictionMarketMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: PredictionMarketMaxAggregateInputType;
};
export type GetPredictionMarketAggregateType<T extends PredictionMarketAggregateArgs> = {
    [P in keyof T & keyof AggregatePredictionMarket]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregatePredictionMarket[P]> : Prisma.GetScalarType<T[P], AggregatePredictionMarket[P]>;
};
export type PredictionMarketGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PredictionMarketWhereInput;
    orderBy?: Prisma.PredictionMarketOrderByWithAggregationInput | Prisma.PredictionMarketOrderByWithAggregationInput[];
    by: Prisma.PredictionMarketScalarFieldEnum[] | Prisma.PredictionMarketScalarFieldEnum;
    having?: Prisma.PredictionMarketScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: PredictionMarketCountAggregateInputType | true;
    _avg?: PredictionMarketAvgAggregateInputType;
    _sum?: PredictionMarketSumAggregateInputType;
    _min?: PredictionMarketMinAggregateInputType;
    _max?: PredictionMarketMaxAggregateInputType;
};
export type PredictionMarketGroupByOutputType = {
    id: string;
    matchId: string;
    contractAddr: string;
    liquidityPool: number;
    supplyA: number;
    supplyB: number;
    basePrice: number;
    curveK: number;
    status: $Enums.MarketStatus;
    createdAt: Date;
    _count: PredictionMarketCountAggregateOutputType | null;
    _avg: PredictionMarketAvgAggregateOutputType | null;
    _sum: PredictionMarketSumAggregateOutputType | null;
    _min: PredictionMarketMinAggregateOutputType | null;
    _max: PredictionMarketMaxAggregateOutputType | null;
};
type GetPredictionMarketGroupByPayload<T extends PredictionMarketGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<PredictionMarketGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof PredictionMarketGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], PredictionMarketGroupByOutputType[P]> : Prisma.GetScalarType<T[P], PredictionMarketGroupByOutputType[P]>;
}>>;
export type PredictionMarketWhereInput = {
    AND?: Prisma.PredictionMarketWhereInput | Prisma.PredictionMarketWhereInput[];
    OR?: Prisma.PredictionMarketWhereInput[];
    NOT?: Prisma.PredictionMarketWhereInput | Prisma.PredictionMarketWhereInput[];
    id?: Prisma.StringFilter<"PredictionMarket"> | string;
    matchId?: Prisma.StringFilter<"PredictionMarket"> | string;
    contractAddr?: Prisma.StringFilter<"PredictionMarket"> | string;
    liquidityPool?: Prisma.FloatFilter<"PredictionMarket"> | number;
    supplyA?: Prisma.IntFilter<"PredictionMarket"> | number;
    supplyB?: Prisma.IntFilter<"PredictionMarket"> | number;
    basePrice?: Prisma.FloatFilter<"PredictionMarket"> | number;
    curveK?: Prisma.FloatFilter<"PredictionMarket"> | number;
    status?: Prisma.EnumMarketStatusFilter<"PredictionMarket"> | $Enums.MarketStatus;
    createdAt?: Prisma.DateTimeFilter<"PredictionMarket"> | Date | string;
    match?: Prisma.XOR<Prisma.MatchScalarRelationFilter, Prisma.MatchWhereInput>;
    positions?: Prisma.PredictionPositionListRelationFilter;
};
export type PredictionMarketOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    matchId?: Prisma.SortOrder;
    contractAddr?: Prisma.SortOrder;
    liquidityPool?: Prisma.SortOrder;
    supplyA?: Prisma.SortOrder;
    supplyB?: Prisma.SortOrder;
    basePrice?: Prisma.SortOrder;
    curveK?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    match?: Prisma.MatchOrderByWithRelationInput;
    positions?: Prisma.PredictionPositionOrderByRelationAggregateInput;
};
export type PredictionMarketWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    matchId?: string;
    AND?: Prisma.PredictionMarketWhereInput | Prisma.PredictionMarketWhereInput[];
    OR?: Prisma.PredictionMarketWhereInput[];
    NOT?: Prisma.PredictionMarketWhereInput | Prisma.PredictionMarketWhereInput[];
    contractAddr?: Prisma.StringFilter<"PredictionMarket"> | string;
    liquidityPool?: Prisma.FloatFilter<"PredictionMarket"> | number;
    supplyA?: Prisma.IntFilter<"PredictionMarket"> | number;
    supplyB?: Prisma.IntFilter<"PredictionMarket"> | number;
    basePrice?: Prisma.FloatFilter<"PredictionMarket"> | number;
    curveK?: Prisma.FloatFilter<"PredictionMarket"> | number;
    status?: Prisma.EnumMarketStatusFilter<"PredictionMarket"> | $Enums.MarketStatus;
    createdAt?: Prisma.DateTimeFilter<"PredictionMarket"> | Date | string;
    match?: Prisma.XOR<Prisma.MatchScalarRelationFilter, Prisma.MatchWhereInput>;
    positions?: Prisma.PredictionPositionListRelationFilter;
}, "id" | "matchId">;
export type PredictionMarketOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    matchId?: Prisma.SortOrder;
    contractAddr?: Prisma.SortOrder;
    liquidityPool?: Prisma.SortOrder;
    supplyA?: Prisma.SortOrder;
    supplyB?: Prisma.SortOrder;
    basePrice?: Prisma.SortOrder;
    curveK?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    _count?: Prisma.PredictionMarketCountOrderByAggregateInput;
    _avg?: Prisma.PredictionMarketAvgOrderByAggregateInput;
    _max?: Prisma.PredictionMarketMaxOrderByAggregateInput;
    _min?: Prisma.PredictionMarketMinOrderByAggregateInput;
    _sum?: Prisma.PredictionMarketSumOrderByAggregateInput;
};
export type PredictionMarketScalarWhereWithAggregatesInput = {
    AND?: Prisma.PredictionMarketScalarWhereWithAggregatesInput | Prisma.PredictionMarketScalarWhereWithAggregatesInput[];
    OR?: Prisma.PredictionMarketScalarWhereWithAggregatesInput[];
    NOT?: Prisma.PredictionMarketScalarWhereWithAggregatesInput | Prisma.PredictionMarketScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"PredictionMarket"> | string;
    matchId?: Prisma.StringWithAggregatesFilter<"PredictionMarket"> | string;
    contractAddr?: Prisma.StringWithAggregatesFilter<"PredictionMarket"> | string;
    liquidityPool?: Prisma.FloatWithAggregatesFilter<"PredictionMarket"> | number;
    supplyA?: Prisma.IntWithAggregatesFilter<"PredictionMarket"> | number;
    supplyB?: Prisma.IntWithAggregatesFilter<"PredictionMarket"> | number;
    basePrice?: Prisma.FloatWithAggregatesFilter<"PredictionMarket"> | number;
    curveK?: Prisma.FloatWithAggregatesFilter<"PredictionMarket"> | number;
    status?: Prisma.EnumMarketStatusWithAggregatesFilter<"PredictionMarket"> | $Enums.MarketStatus;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"PredictionMarket"> | Date | string;
};
export type PredictionMarketCreateInput = {
    id?: string;
    contractAddr: string;
    liquidityPool: number;
    supplyA: number;
    supplyB: number;
    basePrice: number;
    curveK: number;
    status: $Enums.MarketStatus;
    createdAt?: Date | string;
    match: Prisma.MatchCreateNestedOneWithoutMarketInput;
    positions?: Prisma.PredictionPositionCreateNestedManyWithoutMarketInput;
};
export type PredictionMarketUncheckedCreateInput = {
    id?: string;
    matchId: string;
    contractAddr: string;
    liquidityPool: number;
    supplyA: number;
    supplyB: number;
    basePrice: number;
    curveK: number;
    status: $Enums.MarketStatus;
    createdAt?: Date | string;
    positions?: Prisma.PredictionPositionUncheckedCreateNestedManyWithoutMarketInput;
};
export type PredictionMarketUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    contractAddr?: Prisma.StringFieldUpdateOperationsInput | string;
    liquidityPool?: Prisma.FloatFieldUpdateOperationsInput | number;
    supplyA?: Prisma.IntFieldUpdateOperationsInput | number;
    supplyB?: Prisma.IntFieldUpdateOperationsInput | number;
    basePrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    curveK?: Prisma.FloatFieldUpdateOperationsInput | number;
    status?: Prisma.EnumMarketStatusFieldUpdateOperationsInput | $Enums.MarketStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    match?: Prisma.MatchUpdateOneRequiredWithoutMarketNestedInput;
    positions?: Prisma.PredictionPositionUpdateManyWithoutMarketNestedInput;
};
export type PredictionMarketUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    matchId?: Prisma.StringFieldUpdateOperationsInput | string;
    contractAddr?: Prisma.StringFieldUpdateOperationsInput | string;
    liquidityPool?: Prisma.FloatFieldUpdateOperationsInput | number;
    supplyA?: Prisma.IntFieldUpdateOperationsInput | number;
    supplyB?: Prisma.IntFieldUpdateOperationsInput | number;
    basePrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    curveK?: Prisma.FloatFieldUpdateOperationsInput | number;
    status?: Prisma.EnumMarketStatusFieldUpdateOperationsInput | $Enums.MarketStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    positions?: Prisma.PredictionPositionUncheckedUpdateManyWithoutMarketNestedInput;
};
export type PredictionMarketCreateManyInput = {
    id?: string;
    matchId: string;
    contractAddr: string;
    liquidityPool: number;
    supplyA: number;
    supplyB: number;
    basePrice: number;
    curveK: number;
    status: $Enums.MarketStatus;
    createdAt?: Date | string;
};
export type PredictionMarketUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    contractAddr?: Prisma.StringFieldUpdateOperationsInput | string;
    liquidityPool?: Prisma.FloatFieldUpdateOperationsInput | number;
    supplyA?: Prisma.IntFieldUpdateOperationsInput | number;
    supplyB?: Prisma.IntFieldUpdateOperationsInput | number;
    basePrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    curveK?: Prisma.FloatFieldUpdateOperationsInput | number;
    status?: Prisma.EnumMarketStatusFieldUpdateOperationsInput | $Enums.MarketStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PredictionMarketUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    matchId?: Prisma.StringFieldUpdateOperationsInput | string;
    contractAddr?: Prisma.StringFieldUpdateOperationsInput | string;
    liquidityPool?: Prisma.FloatFieldUpdateOperationsInput | number;
    supplyA?: Prisma.IntFieldUpdateOperationsInput | number;
    supplyB?: Prisma.IntFieldUpdateOperationsInput | number;
    basePrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    curveK?: Prisma.FloatFieldUpdateOperationsInput | number;
    status?: Prisma.EnumMarketStatusFieldUpdateOperationsInput | $Enums.MarketStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PredictionMarketNullableScalarRelationFilter = {
    is?: Prisma.PredictionMarketWhereInput | null;
    isNot?: Prisma.PredictionMarketWhereInput | null;
};
export type PredictionMarketCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    matchId?: Prisma.SortOrder;
    contractAddr?: Prisma.SortOrder;
    liquidityPool?: Prisma.SortOrder;
    supplyA?: Prisma.SortOrder;
    supplyB?: Prisma.SortOrder;
    basePrice?: Prisma.SortOrder;
    curveK?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type PredictionMarketAvgOrderByAggregateInput = {
    liquidityPool?: Prisma.SortOrder;
    supplyA?: Prisma.SortOrder;
    supplyB?: Prisma.SortOrder;
    basePrice?: Prisma.SortOrder;
    curveK?: Prisma.SortOrder;
};
export type PredictionMarketMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    matchId?: Prisma.SortOrder;
    contractAddr?: Prisma.SortOrder;
    liquidityPool?: Prisma.SortOrder;
    supplyA?: Prisma.SortOrder;
    supplyB?: Prisma.SortOrder;
    basePrice?: Prisma.SortOrder;
    curveK?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type PredictionMarketMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    matchId?: Prisma.SortOrder;
    contractAddr?: Prisma.SortOrder;
    liquidityPool?: Prisma.SortOrder;
    supplyA?: Prisma.SortOrder;
    supplyB?: Prisma.SortOrder;
    basePrice?: Prisma.SortOrder;
    curveK?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type PredictionMarketSumOrderByAggregateInput = {
    liquidityPool?: Prisma.SortOrder;
    supplyA?: Prisma.SortOrder;
    supplyB?: Prisma.SortOrder;
    basePrice?: Prisma.SortOrder;
    curveK?: Prisma.SortOrder;
};
export type PredictionMarketScalarRelationFilter = {
    is?: Prisma.PredictionMarketWhereInput;
    isNot?: Prisma.PredictionMarketWhereInput;
};
export type PredictionMarketCreateNestedOneWithoutMatchInput = {
    create?: Prisma.XOR<Prisma.PredictionMarketCreateWithoutMatchInput, Prisma.PredictionMarketUncheckedCreateWithoutMatchInput>;
    connectOrCreate?: Prisma.PredictionMarketCreateOrConnectWithoutMatchInput;
    connect?: Prisma.PredictionMarketWhereUniqueInput;
};
export type PredictionMarketUncheckedCreateNestedOneWithoutMatchInput = {
    create?: Prisma.XOR<Prisma.PredictionMarketCreateWithoutMatchInput, Prisma.PredictionMarketUncheckedCreateWithoutMatchInput>;
    connectOrCreate?: Prisma.PredictionMarketCreateOrConnectWithoutMatchInput;
    connect?: Prisma.PredictionMarketWhereUniqueInput;
};
export type PredictionMarketUpdateOneWithoutMatchNestedInput = {
    create?: Prisma.XOR<Prisma.PredictionMarketCreateWithoutMatchInput, Prisma.PredictionMarketUncheckedCreateWithoutMatchInput>;
    connectOrCreate?: Prisma.PredictionMarketCreateOrConnectWithoutMatchInput;
    upsert?: Prisma.PredictionMarketUpsertWithoutMatchInput;
    disconnect?: Prisma.PredictionMarketWhereInput | boolean;
    delete?: Prisma.PredictionMarketWhereInput | boolean;
    connect?: Prisma.PredictionMarketWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.PredictionMarketUpdateToOneWithWhereWithoutMatchInput, Prisma.PredictionMarketUpdateWithoutMatchInput>, Prisma.PredictionMarketUncheckedUpdateWithoutMatchInput>;
};
export type PredictionMarketUncheckedUpdateOneWithoutMatchNestedInput = {
    create?: Prisma.XOR<Prisma.PredictionMarketCreateWithoutMatchInput, Prisma.PredictionMarketUncheckedCreateWithoutMatchInput>;
    connectOrCreate?: Prisma.PredictionMarketCreateOrConnectWithoutMatchInput;
    upsert?: Prisma.PredictionMarketUpsertWithoutMatchInput;
    disconnect?: Prisma.PredictionMarketWhereInput | boolean;
    delete?: Prisma.PredictionMarketWhereInput | boolean;
    connect?: Prisma.PredictionMarketWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.PredictionMarketUpdateToOneWithWhereWithoutMatchInput, Prisma.PredictionMarketUpdateWithoutMatchInput>, Prisma.PredictionMarketUncheckedUpdateWithoutMatchInput>;
};
export type EnumMarketStatusFieldUpdateOperationsInput = {
    set?: $Enums.MarketStatus;
};
export type PredictionMarketCreateNestedOneWithoutPositionsInput = {
    create?: Prisma.XOR<Prisma.PredictionMarketCreateWithoutPositionsInput, Prisma.PredictionMarketUncheckedCreateWithoutPositionsInput>;
    connectOrCreate?: Prisma.PredictionMarketCreateOrConnectWithoutPositionsInput;
    connect?: Prisma.PredictionMarketWhereUniqueInput;
};
export type PredictionMarketUpdateOneRequiredWithoutPositionsNestedInput = {
    create?: Prisma.XOR<Prisma.PredictionMarketCreateWithoutPositionsInput, Prisma.PredictionMarketUncheckedCreateWithoutPositionsInput>;
    connectOrCreate?: Prisma.PredictionMarketCreateOrConnectWithoutPositionsInput;
    upsert?: Prisma.PredictionMarketUpsertWithoutPositionsInput;
    connect?: Prisma.PredictionMarketWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.PredictionMarketUpdateToOneWithWhereWithoutPositionsInput, Prisma.PredictionMarketUpdateWithoutPositionsInput>, Prisma.PredictionMarketUncheckedUpdateWithoutPositionsInput>;
};
export type PredictionMarketCreateWithoutMatchInput = {
    id?: string;
    contractAddr: string;
    liquidityPool: number;
    supplyA: number;
    supplyB: number;
    basePrice: number;
    curveK: number;
    status: $Enums.MarketStatus;
    createdAt?: Date | string;
    positions?: Prisma.PredictionPositionCreateNestedManyWithoutMarketInput;
};
export type PredictionMarketUncheckedCreateWithoutMatchInput = {
    id?: string;
    contractAddr: string;
    liquidityPool: number;
    supplyA: number;
    supplyB: number;
    basePrice: number;
    curveK: number;
    status: $Enums.MarketStatus;
    createdAt?: Date | string;
    positions?: Prisma.PredictionPositionUncheckedCreateNestedManyWithoutMarketInput;
};
export type PredictionMarketCreateOrConnectWithoutMatchInput = {
    where: Prisma.PredictionMarketWhereUniqueInput;
    create: Prisma.XOR<Prisma.PredictionMarketCreateWithoutMatchInput, Prisma.PredictionMarketUncheckedCreateWithoutMatchInput>;
};
export type PredictionMarketUpsertWithoutMatchInput = {
    update: Prisma.XOR<Prisma.PredictionMarketUpdateWithoutMatchInput, Prisma.PredictionMarketUncheckedUpdateWithoutMatchInput>;
    create: Prisma.XOR<Prisma.PredictionMarketCreateWithoutMatchInput, Prisma.PredictionMarketUncheckedCreateWithoutMatchInput>;
    where?: Prisma.PredictionMarketWhereInput;
};
export type PredictionMarketUpdateToOneWithWhereWithoutMatchInput = {
    where?: Prisma.PredictionMarketWhereInput;
    data: Prisma.XOR<Prisma.PredictionMarketUpdateWithoutMatchInput, Prisma.PredictionMarketUncheckedUpdateWithoutMatchInput>;
};
export type PredictionMarketUpdateWithoutMatchInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    contractAddr?: Prisma.StringFieldUpdateOperationsInput | string;
    liquidityPool?: Prisma.FloatFieldUpdateOperationsInput | number;
    supplyA?: Prisma.IntFieldUpdateOperationsInput | number;
    supplyB?: Prisma.IntFieldUpdateOperationsInput | number;
    basePrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    curveK?: Prisma.FloatFieldUpdateOperationsInput | number;
    status?: Prisma.EnumMarketStatusFieldUpdateOperationsInput | $Enums.MarketStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    positions?: Prisma.PredictionPositionUpdateManyWithoutMarketNestedInput;
};
export type PredictionMarketUncheckedUpdateWithoutMatchInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    contractAddr?: Prisma.StringFieldUpdateOperationsInput | string;
    liquidityPool?: Prisma.FloatFieldUpdateOperationsInput | number;
    supplyA?: Prisma.IntFieldUpdateOperationsInput | number;
    supplyB?: Prisma.IntFieldUpdateOperationsInput | number;
    basePrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    curveK?: Prisma.FloatFieldUpdateOperationsInput | number;
    status?: Prisma.EnumMarketStatusFieldUpdateOperationsInput | $Enums.MarketStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    positions?: Prisma.PredictionPositionUncheckedUpdateManyWithoutMarketNestedInput;
};
export type PredictionMarketCreateWithoutPositionsInput = {
    id?: string;
    contractAddr: string;
    liquidityPool: number;
    supplyA: number;
    supplyB: number;
    basePrice: number;
    curveK: number;
    status: $Enums.MarketStatus;
    createdAt?: Date | string;
    match: Prisma.MatchCreateNestedOneWithoutMarketInput;
};
export type PredictionMarketUncheckedCreateWithoutPositionsInput = {
    id?: string;
    matchId: string;
    contractAddr: string;
    liquidityPool: number;
    supplyA: number;
    supplyB: number;
    basePrice: number;
    curveK: number;
    status: $Enums.MarketStatus;
    createdAt?: Date | string;
};
export type PredictionMarketCreateOrConnectWithoutPositionsInput = {
    where: Prisma.PredictionMarketWhereUniqueInput;
    create: Prisma.XOR<Prisma.PredictionMarketCreateWithoutPositionsInput, Prisma.PredictionMarketUncheckedCreateWithoutPositionsInput>;
};
export type PredictionMarketUpsertWithoutPositionsInput = {
    update: Prisma.XOR<Prisma.PredictionMarketUpdateWithoutPositionsInput, Prisma.PredictionMarketUncheckedUpdateWithoutPositionsInput>;
    create: Prisma.XOR<Prisma.PredictionMarketCreateWithoutPositionsInput, Prisma.PredictionMarketUncheckedCreateWithoutPositionsInput>;
    where?: Prisma.PredictionMarketWhereInput;
};
export type PredictionMarketUpdateToOneWithWhereWithoutPositionsInput = {
    where?: Prisma.PredictionMarketWhereInput;
    data: Prisma.XOR<Prisma.PredictionMarketUpdateWithoutPositionsInput, Prisma.PredictionMarketUncheckedUpdateWithoutPositionsInput>;
};
export type PredictionMarketUpdateWithoutPositionsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    contractAddr?: Prisma.StringFieldUpdateOperationsInput | string;
    liquidityPool?: Prisma.FloatFieldUpdateOperationsInput | number;
    supplyA?: Prisma.IntFieldUpdateOperationsInput | number;
    supplyB?: Prisma.IntFieldUpdateOperationsInput | number;
    basePrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    curveK?: Prisma.FloatFieldUpdateOperationsInput | number;
    status?: Prisma.EnumMarketStatusFieldUpdateOperationsInput | $Enums.MarketStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    match?: Prisma.MatchUpdateOneRequiredWithoutMarketNestedInput;
};
export type PredictionMarketUncheckedUpdateWithoutPositionsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    matchId?: Prisma.StringFieldUpdateOperationsInput | string;
    contractAddr?: Prisma.StringFieldUpdateOperationsInput | string;
    liquidityPool?: Prisma.FloatFieldUpdateOperationsInput | number;
    supplyA?: Prisma.IntFieldUpdateOperationsInput | number;
    supplyB?: Prisma.IntFieldUpdateOperationsInput | number;
    basePrice?: Prisma.FloatFieldUpdateOperationsInput | number;
    curveK?: Prisma.FloatFieldUpdateOperationsInput | number;
    status?: Prisma.EnumMarketStatusFieldUpdateOperationsInput | $Enums.MarketStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
/**
 * Count Type PredictionMarketCountOutputType
 */
export type PredictionMarketCountOutputType = {
    positions: number;
};
export type PredictionMarketCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    positions?: boolean | PredictionMarketCountOutputTypeCountPositionsArgs;
};
/**
 * PredictionMarketCountOutputType without action
 */
export type PredictionMarketCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PredictionMarketCountOutputType
     */
    select?: Prisma.PredictionMarketCountOutputTypeSelect<ExtArgs> | null;
};
/**
 * PredictionMarketCountOutputType without action
 */
export type PredictionMarketCountOutputTypeCountPositionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PredictionPositionWhereInput;
};
export type PredictionMarketSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    matchId?: boolean;
    contractAddr?: boolean;
    liquidityPool?: boolean;
    supplyA?: boolean;
    supplyB?: boolean;
    basePrice?: boolean;
    curveK?: boolean;
    status?: boolean;
    createdAt?: boolean;
    match?: boolean | Prisma.MatchDefaultArgs<ExtArgs>;
    positions?: boolean | Prisma.PredictionMarket$positionsArgs<ExtArgs>;
    _count?: boolean | Prisma.PredictionMarketCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["predictionMarket"]>;
export type PredictionMarketSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    matchId?: boolean;
    contractAddr?: boolean;
    liquidityPool?: boolean;
    supplyA?: boolean;
    supplyB?: boolean;
    basePrice?: boolean;
    curveK?: boolean;
    status?: boolean;
    createdAt?: boolean;
    match?: boolean | Prisma.MatchDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["predictionMarket"]>;
export type PredictionMarketSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    matchId?: boolean;
    contractAddr?: boolean;
    liquidityPool?: boolean;
    supplyA?: boolean;
    supplyB?: boolean;
    basePrice?: boolean;
    curveK?: boolean;
    status?: boolean;
    createdAt?: boolean;
    match?: boolean | Prisma.MatchDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["predictionMarket"]>;
export type PredictionMarketSelectScalar = {
    id?: boolean;
    matchId?: boolean;
    contractAddr?: boolean;
    liquidityPool?: boolean;
    supplyA?: boolean;
    supplyB?: boolean;
    basePrice?: boolean;
    curveK?: boolean;
    status?: boolean;
    createdAt?: boolean;
};
export type PredictionMarketOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "matchId" | "contractAddr" | "liquidityPool" | "supplyA" | "supplyB" | "basePrice" | "curveK" | "status" | "createdAt", ExtArgs["result"]["predictionMarket"]>;
export type PredictionMarketInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    match?: boolean | Prisma.MatchDefaultArgs<ExtArgs>;
    positions?: boolean | Prisma.PredictionMarket$positionsArgs<ExtArgs>;
    _count?: boolean | Prisma.PredictionMarketCountOutputTypeDefaultArgs<ExtArgs>;
};
export type PredictionMarketIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    match?: boolean | Prisma.MatchDefaultArgs<ExtArgs>;
};
export type PredictionMarketIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    match?: boolean | Prisma.MatchDefaultArgs<ExtArgs>;
};
export type $PredictionMarketPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "PredictionMarket";
    objects: {
        match: Prisma.$MatchPayload<ExtArgs>;
        positions: Prisma.$PredictionPositionPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        matchId: string;
        contractAddr: string;
        liquidityPool: number;
        supplyA: number;
        supplyB: number;
        basePrice: number;
        curveK: number;
        status: $Enums.MarketStatus;
        createdAt: Date;
    }, ExtArgs["result"]["predictionMarket"]>;
    composites: {};
};
export type PredictionMarketGetPayload<S extends boolean | null | undefined | PredictionMarketDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$PredictionMarketPayload, S>;
export type PredictionMarketCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<PredictionMarketFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: PredictionMarketCountAggregateInputType | true;
};
export interface PredictionMarketDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['PredictionMarket'];
        meta: {
            name: 'PredictionMarket';
        };
    };
    /**
     * Find zero or one PredictionMarket that matches the filter.
     * @param {PredictionMarketFindUniqueArgs} args - Arguments to find a PredictionMarket
     * @example
     * // Get one PredictionMarket
     * const predictionMarket = await prisma.predictionMarket.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PredictionMarketFindUniqueArgs>(args: Prisma.SelectSubset<T, PredictionMarketFindUniqueArgs<ExtArgs>>): Prisma.Prisma__PredictionMarketClient<runtime.Types.Result.GetResult<Prisma.$PredictionMarketPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one PredictionMarket that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PredictionMarketFindUniqueOrThrowArgs} args - Arguments to find a PredictionMarket
     * @example
     * // Get one PredictionMarket
     * const predictionMarket = await prisma.predictionMarket.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PredictionMarketFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, PredictionMarketFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__PredictionMarketClient<runtime.Types.Result.GetResult<Prisma.$PredictionMarketPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first PredictionMarket that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PredictionMarketFindFirstArgs} args - Arguments to find a PredictionMarket
     * @example
     * // Get one PredictionMarket
     * const predictionMarket = await prisma.predictionMarket.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PredictionMarketFindFirstArgs>(args?: Prisma.SelectSubset<T, PredictionMarketFindFirstArgs<ExtArgs>>): Prisma.Prisma__PredictionMarketClient<runtime.Types.Result.GetResult<Prisma.$PredictionMarketPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first PredictionMarket that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PredictionMarketFindFirstOrThrowArgs} args - Arguments to find a PredictionMarket
     * @example
     * // Get one PredictionMarket
     * const predictionMarket = await prisma.predictionMarket.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PredictionMarketFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, PredictionMarketFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__PredictionMarketClient<runtime.Types.Result.GetResult<Prisma.$PredictionMarketPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more PredictionMarkets that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PredictionMarketFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PredictionMarkets
     * const predictionMarkets = await prisma.predictionMarket.findMany()
     *
     * // Get first 10 PredictionMarkets
     * const predictionMarkets = await prisma.predictionMarket.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const predictionMarketWithIdOnly = await prisma.predictionMarket.findMany({ select: { id: true } })
     *
     */
    findMany<T extends PredictionMarketFindManyArgs>(args?: Prisma.SelectSubset<T, PredictionMarketFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PredictionMarketPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a PredictionMarket.
     * @param {PredictionMarketCreateArgs} args - Arguments to create a PredictionMarket.
     * @example
     * // Create one PredictionMarket
     * const PredictionMarket = await prisma.predictionMarket.create({
     *   data: {
     *     // ... data to create a PredictionMarket
     *   }
     * })
     *
     */
    create<T extends PredictionMarketCreateArgs>(args: Prisma.SelectSubset<T, PredictionMarketCreateArgs<ExtArgs>>): Prisma.Prisma__PredictionMarketClient<runtime.Types.Result.GetResult<Prisma.$PredictionMarketPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many PredictionMarkets.
     * @param {PredictionMarketCreateManyArgs} args - Arguments to create many PredictionMarkets.
     * @example
     * // Create many PredictionMarkets
     * const predictionMarket = await prisma.predictionMarket.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends PredictionMarketCreateManyArgs>(args?: Prisma.SelectSubset<T, PredictionMarketCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many PredictionMarkets and returns the data saved in the database.
     * @param {PredictionMarketCreateManyAndReturnArgs} args - Arguments to create many PredictionMarkets.
     * @example
     * // Create many PredictionMarkets
     * const predictionMarket = await prisma.predictionMarket.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many PredictionMarkets and only return the `id`
     * const predictionMarketWithIdOnly = await prisma.predictionMarket.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends PredictionMarketCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, PredictionMarketCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PredictionMarketPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a PredictionMarket.
     * @param {PredictionMarketDeleteArgs} args - Arguments to delete one PredictionMarket.
     * @example
     * // Delete one PredictionMarket
     * const PredictionMarket = await prisma.predictionMarket.delete({
     *   where: {
     *     // ... filter to delete one PredictionMarket
     *   }
     * })
     *
     */
    delete<T extends PredictionMarketDeleteArgs>(args: Prisma.SelectSubset<T, PredictionMarketDeleteArgs<ExtArgs>>): Prisma.Prisma__PredictionMarketClient<runtime.Types.Result.GetResult<Prisma.$PredictionMarketPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one PredictionMarket.
     * @param {PredictionMarketUpdateArgs} args - Arguments to update one PredictionMarket.
     * @example
     * // Update one PredictionMarket
     * const predictionMarket = await prisma.predictionMarket.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends PredictionMarketUpdateArgs>(args: Prisma.SelectSubset<T, PredictionMarketUpdateArgs<ExtArgs>>): Prisma.Prisma__PredictionMarketClient<runtime.Types.Result.GetResult<Prisma.$PredictionMarketPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more PredictionMarkets.
     * @param {PredictionMarketDeleteManyArgs} args - Arguments to filter PredictionMarkets to delete.
     * @example
     * // Delete a few PredictionMarkets
     * const { count } = await prisma.predictionMarket.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends PredictionMarketDeleteManyArgs>(args?: Prisma.SelectSubset<T, PredictionMarketDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more PredictionMarkets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PredictionMarketUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PredictionMarkets
     * const predictionMarket = await prisma.predictionMarket.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends PredictionMarketUpdateManyArgs>(args: Prisma.SelectSubset<T, PredictionMarketUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more PredictionMarkets and returns the data updated in the database.
     * @param {PredictionMarketUpdateManyAndReturnArgs} args - Arguments to update many PredictionMarkets.
     * @example
     * // Update many PredictionMarkets
     * const predictionMarket = await prisma.predictionMarket.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more PredictionMarkets and only return the `id`
     * const predictionMarketWithIdOnly = await prisma.predictionMarket.updateManyAndReturn({
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
    updateManyAndReturn<T extends PredictionMarketUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, PredictionMarketUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PredictionMarketPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one PredictionMarket.
     * @param {PredictionMarketUpsertArgs} args - Arguments to update or create a PredictionMarket.
     * @example
     * // Update or create a PredictionMarket
     * const predictionMarket = await prisma.predictionMarket.upsert({
     *   create: {
     *     // ... data to create a PredictionMarket
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PredictionMarket we want to update
     *   }
     * })
     */
    upsert<T extends PredictionMarketUpsertArgs>(args: Prisma.SelectSubset<T, PredictionMarketUpsertArgs<ExtArgs>>): Prisma.Prisma__PredictionMarketClient<runtime.Types.Result.GetResult<Prisma.$PredictionMarketPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of PredictionMarkets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PredictionMarketCountArgs} args - Arguments to filter PredictionMarkets to count.
     * @example
     * // Count the number of PredictionMarkets
     * const count = await prisma.predictionMarket.count({
     *   where: {
     *     // ... the filter for the PredictionMarkets we want to count
     *   }
     * })
    **/
    count<T extends PredictionMarketCountArgs>(args?: Prisma.Subset<T, PredictionMarketCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], PredictionMarketCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a PredictionMarket.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PredictionMarketAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends PredictionMarketAggregateArgs>(args: Prisma.Subset<T, PredictionMarketAggregateArgs>): Prisma.PrismaPromise<GetPredictionMarketAggregateType<T>>;
    /**
     * Group by PredictionMarket.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PredictionMarketGroupByArgs} args - Group by arguments.
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
    groupBy<T extends PredictionMarketGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: PredictionMarketGroupByArgs['orderBy'];
    } : {
        orderBy?: PredictionMarketGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, PredictionMarketGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPredictionMarketGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the PredictionMarket model
     */
    readonly fields: PredictionMarketFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for PredictionMarket.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__PredictionMarketClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    match<T extends Prisma.MatchDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.MatchDefaultArgs<ExtArgs>>): Prisma.Prisma__MatchClient<runtime.Types.Result.GetResult<Prisma.$MatchPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    positions<T extends Prisma.PredictionMarket$positionsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.PredictionMarket$positionsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PredictionPositionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
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
 * Fields of the PredictionMarket model
 */
export interface PredictionMarketFieldRefs {
    readonly id: Prisma.FieldRef<"PredictionMarket", 'String'>;
    readonly matchId: Prisma.FieldRef<"PredictionMarket", 'String'>;
    readonly contractAddr: Prisma.FieldRef<"PredictionMarket", 'String'>;
    readonly liquidityPool: Prisma.FieldRef<"PredictionMarket", 'Float'>;
    readonly supplyA: Prisma.FieldRef<"PredictionMarket", 'Int'>;
    readonly supplyB: Prisma.FieldRef<"PredictionMarket", 'Int'>;
    readonly basePrice: Prisma.FieldRef<"PredictionMarket", 'Float'>;
    readonly curveK: Prisma.FieldRef<"PredictionMarket", 'Float'>;
    readonly status: Prisma.FieldRef<"PredictionMarket", 'MarketStatus'>;
    readonly createdAt: Prisma.FieldRef<"PredictionMarket", 'DateTime'>;
}
/**
 * PredictionMarket findUnique
 */
export type PredictionMarketFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PredictionMarket
     */
    select?: Prisma.PredictionMarketSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the PredictionMarket
     */
    omit?: Prisma.PredictionMarketOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PredictionMarketInclude<ExtArgs> | null;
    /**
     * Filter, which PredictionMarket to fetch.
     */
    where: Prisma.PredictionMarketWhereUniqueInput;
};
/**
 * PredictionMarket findUniqueOrThrow
 */
export type PredictionMarketFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PredictionMarket
     */
    select?: Prisma.PredictionMarketSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the PredictionMarket
     */
    omit?: Prisma.PredictionMarketOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PredictionMarketInclude<ExtArgs> | null;
    /**
     * Filter, which PredictionMarket to fetch.
     */
    where: Prisma.PredictionMarketWhereUniqueInput;
};
/**
 * PredictionMarket findFirst
 */
export type PredictionMarketFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PredictionMarket
     */
    select?: Prisma.PredictionMarketSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the PredictionMarket
     */
    omit?: Prisma.PredictionMarketOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PredictionMarketInclude<ExtArgs> | null;
    /**
     * Filter, which PredictionMarket to fetch.
     */
    where?: Prisma.PredictionMarketWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of PredictionMarkets to fetch.
     */
    orderBy?: Prisma.PredictionMarketOrderByWithRelationInput | Prisma.PredictionMarketOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for PredictionMarkets.
     */
    cursor?: Prisma.PredictionMarketWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` PredictionMarkets from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` PredictionMarkets.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of PredictionMarkets.
     */
    distinct?: Prisma.PredictionMarketScalarFieldEnum | Prisma.PredictionMarketScalarFieldEnum[];
};
/**
 * PredictionMarket findFirstOrThrow
 */
export type PredictionMarketFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PredictionMarket
     */
    select?: Prisma.PredictionMarketSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the PredictionMarket
     */
    omit?: Prisma.PredictionMarketOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PredictionMarketInclude<ExtArgs> | null;
    /**
     * Filter, which PredictionMarket to fetch.
     */
    where?: Prisma.PredictionMarketWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of PredictionMarkets to fetch.
     */
    orderBy?: Prisma.PredictionMarketOrderByWithRelationInput | Prisma.PredictionMarketOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for PredictionMarkets.
     */
    cursor?: Prisma.PredictionMarketWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` PredictionMarkets from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` PredictionMarkets.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of PredictionMarkets.
     */
    distinct?: Prisma.PredictionMarketScalarFieldEnum | Prisma.PredictionMarketScalarFieldEnum[];
};
/**
 * PredictionMarket findMany
 */
export type PredictionMarketFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PredictionMarket
     */
    select?: Prisma.PredictionMarketSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the PredictionMarket
     */
    omit?: Prisma.PredictionMarketOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PredictionMarketInclude<ExtArgs> | null;
    /**
     * Filter, which PredictionMarkets to fetch.
     */
    where?: Prisma.PredictionMarketWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of PredictionMarkets to fetch.
     */
    orderBy?: Prisma.PredictionMarketOrderByWithRelationInput | Prisma.PredictionMarketOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing PredictionMarkets.
     */
    cursor?: Prisma.PredictionMarketWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` PredictionMarkets from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` PredictionMarkets.
     */
    skip?: number;
    distinct?: Prisma.PredictionMarketScalarFieldEnum | Prisma.PredictionMarketScalarFieldEnum[];
};
/**
 * PredictionMarket create
 */
export type PredictionMarketCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PredictionMarket
     */
    select?: Prisma.PredictionMarketSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the PredictionMarket
     */
    omit?: Prisma.PredictionMarketOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PredictionMarketInclude<ExtArgs> | null;
    /**
     * The data needed to create a PredictionMarket.
     */
    data: Prisma.XOR<Prisma.PredictionMarketCreateInput, Prisma.PredictionMarketUncheckedCreateInput>;
};
/**
 * PredictionMarket createMany
 */
export type PredictionMarketCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many PredictionMarkets.
     */
    data: Prisma.PredictionMarketCreateManyInput | Prisma.PredictionMarketCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * PredictionMarket createManyAndReturn
 */
export type PredictionMarketCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PredictionMarket
     */
    select?: Prisma.PredictionMarketSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the PredictionMarket
     */
    omit?: Prisma.PredictionMarketOmit<ExtArgs> | null;
    /**
     * The data used to create many PredictionMarkets.
     */
    data: Prisma.PredictionMarketCreateManyInput | Prisma.PredictionMarketCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PredictionMarketIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * PredictionMarket update
 */
export type PredictionMarketUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PredictionMarket
     */
    select?: Prisma.PredictionMarketSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the PredictionMarket
     */
    omit?: Prisma.PredictionMarketOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PredictionMarketInclude<ExtArgs> | null;
    /**
     * The data needed to update a PredictionMarket.
     */
    data: Prisma.XOR<Prisma.PredictionMarketUpdateInput, Prisma.PredictionMarketUncheckedUpdateInput>;
    /**
     * Choose, which PredictionMarket to update.
     */
    where: Prisma.PredictionMarketWhereUniqueInput;
};
/**
 * PredictionMarket updateMany
 */
export type PredictionMarketUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update PredictionMarkets.
     */
    data: Prisma.XOR<Prisma.PredictionMarketUpdateManyMutationInput, Prisma.PredictionMarketUncheckedUpdateManyInput>;
    /**
     * Filter which PredictionMarkets to update
     */
    where?: Prisma.PredictionMarketWhereInput;
    /**
     * Limit how many PredictionMarkets to update.
     */
    limit?: number;
};
/**
 * PredictionMarket updateManyAndReturn
 */
export type PredictionMarketUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PredictionMarket
     */
    select?: Prisma.PredictionMarketSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the PredictionMarket
     */
    omit?: Prisma.PredictionMarketOmit<ExtArgs> | null;
    /**
     * The data used to update PredictionMarkets.
     */
    data: Prisma.XOR<Prisma.PredictionMarketUpdateManyMutationInput, Prisma.PredictionMarketUncheckedUpdateManyInput>;
    /**
     * Filter which PredictionMarkets to update
     */
    where?: Prisma.PredictionMarketWhereInput;
    /**
     * Limit how many PredictionMarkets to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PredictionMarketIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * PredictionMarket upsert
 */
export type PredictionMarketUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PredictionMarket
     */
    select?: Prisma.PredictionMarketSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the PredictionMarket
     */
    omit?: Prisma.PredictionMarketOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PredictionMarketInclude<ExtArgs> | null;
    /**
     * The filter to search for the PredictionMarket to update in case it exists.
     */
    where: Prisma.PredictionMarketWhereUniqueInput;
    /**
     * In case the PredictionMarket found by the `where` argument doesn't exist, create a new PredictionMarket with this data.
     */
    create: Prisma.XOR<Prisma.PredictionMarketCreateInput, Prisma.PredictionMarketUncheckedCreateInput>;
    /**
     * In case the PredictionMarket was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.PredictionMarketUpdateInput, Prisma.PredictionMarketUncheckedUpdateInput>;
};
/**
 * PredictionMarket delete
 */
export type PredictionMarketDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PredictionMarket
     */
    select?: Prisma.PredictionMarketSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the PredictionMarket
     */
    omit?: Prisma.PredictionMarketOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PredictionMarketInclude<ExtArgs> | null;
    /**
     * Filter which PredictionMarket to delete.
     */
    where: Prisma.PredictionMarketWhereUniqueInput;
};
/**
 * PredictionMarket deleteMany
 */
export type PredictionMarketDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which PredictionMarkets to delete
     */
    where?: Prisma.PredictionMarketWhereInput;
    /**
     * Limit how many PredictionMarkets to delete.
     */
    limit?: number;
};
/**
 * PredictionMarket.positions
 */
export type PredictionMarket$positionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    where?: Prisma.PredictionPositionWhereInput;
    orderBy?: Prisma.PredictionPositionOrderByWithRelationInput | Prisma.PredictionPositionOrderByWithRelationInput[];
    cursor?: Prisma.PredictionPositionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.PredictionPositionScalarFieldEnum | Prisma.PredictionPositionScalarFieldEnum[];
};
/**
 * PredictionMarket without action
 */
export type PredictionMarketDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PredictionMarket
     */
    select?: Prisma.PredictionMarketSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the PredictionMarket
     */
    omit?: Prisma.PredictionMarketOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PredictionMarketInclude<ExtArgs> | null;
};
export {};
//# sourceMappingURL=PredictionMarket.d.ts.map