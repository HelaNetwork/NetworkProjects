import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model Match
 *
 */
export type MatchModel = runtime.Types.Result.DefaultSelection<Prisma.$MatchPayload>;
export type AggregateMatch = {
    _count: MatchCountAggregateOutputType | null;
    _min: MatchMinAggregateOutputType | null;
    _max: MatchMaxAggregateOutputType | null;
};
export type MatchMinAggregateOutputType = {
    id: string | null;
    teamAId: string | null;
    teamBId: string | null;
    tournament: string | null;
    startTime: Date | null;
    status: $Enums.MatchStatus | null;
    result: $Enums.MatchResult | null;
    createdAt: Date | null;
};
export type MatchMaxAggregateOutputType = {
    id: string | null;
    teamAId: string | null;
    teamBId: string | null;
    tournament: string | null;
    startTime: Date | null;
    status: $Enums.MatchStatus | null;
    result: $Enums.MatchResult | null;
    createdAt: Date | null;
};
export type MatchCountAggregateOutputType = {
    id: number;
    teamAId: number;
    teamBId: number;
    tournament: number;
    startTime: number;
    status: number;
    result: number;
    createdAt: number;
    _all: number;
};
export type MatchMinAggregateInputType = {
    id?: true;
    teamAId?: true;
    teamBId?: true;
    tournament?: true;
    startTime?: true;
    status?: true;
    result?: true;
    createdAt?: true;
};
export type MatchMaxAggregateInputType = {
    id?: true;
    teamAId?: true;
    teamBId?: true;
    tournament?: true;
    startTime?: true;
    status?: true;
    result?: true;
    createdAt?: true;
};
export type MatchCountAggregateInputType = {
    id?: true;
    teamAId?: true;
    teamBId?: true;
    tournament?: true;
    startTime?: true;
    status?: true;
    result?: true;
    createdAt?: true;
    _all?: true;
};
export type MatchAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which Match to aggregate.
     */
    where?: Prisma.MatchWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Matches to fetch.
     */
    orderBy?: Prisma.MatchOrderByWithRelationInput | Prisma.MatchOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.MatchWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Matches from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Matches.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Matches
    **/
    _count?: true | MatchCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: MatchMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: MatchMaxAggregateInputType;
};
export type GetMatchAggregateType<T extends MatchAggregateArgs> = {
    [P in keyof T & keyof AggregateMatch]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateMatch[P]> : Prisma.GetScalarType<T[P], AggregateMatch[P]>;
};
export type MatchGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MatchWhereInput;
    orderBy?: Prisma.MatchOrderByWithAggregationInput | Prisma.MatchOrderByWithAggregationInput[];
    by: Prisma.MatchScalarFieldEnum[] | Prisma.MatchScalarFieldEnum;
    having?: Prisma.MatchScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: MatchCountAggregateInputType | true;
    _min?: MatchMinAggregateInputType;
    _max?: MatchMaxAggregateInputType;
};
export type MatchGroupByOutputType = {
    id: string;
    teamAId: string;
    teamBId: string;
    tournament: string | null;
    startTime: Date;
    status: $Enums.MatchStatus;
    result: $Enums.MatchResult | null;
    createdAt: Date;
    _count: MatchCountAggregateOutputType | null;
    _min: MatchMinAggregateOutputType | null;
    _max: MatchMaxAggregateOutputType | null;
};
type GetMatchGroupByPayload<T extends MatchGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<MatchGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof MatchGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], MatchGroupByOutputType[P]> : Prisma.GetScalarType<T[P], MatchGroupByOutputType[P]>;
}>>;
export type MatchWhereInput = {
    AND?: Prisma.MatchWhereInput | Prisma.MatchWhereInput[];
    OR?: Prisma.MatchWhereInput[];
    NOT?: Prisma.MatchWhereInput | Prisma.MatchWhereInput[];
    id?: Prisma.StringFilter<"Match"> | string;
    teamAId?: Prisma.StringFilter<"Match"> | string;
    teamBId?: Prisma.StringFilter<"Match"> | string;
    tournament?: Prisma.StringNullableFilter<"Match"> | string | null;
    startTime?: Prisma.DateTimeFilter<"Match"> | Date | string;
    status?: Prisma.EnumMatchStatusFilter<"Match"> | $Enums.MatchStatus;
    result?: Prisma.EnumMatchResultNullableFilter<"Match"> | $Enums.MatchResult | null;
    createdAt?: Prisma.DateTimeFilter<"Match"> | Date | string;
    teamA?: Prisma.XOR<Prisma.TeamScalarRelationFilter, Prisma.TeamWhereInput>;
    teamB?: Prisma.XOR<Prisma.TeamScalarRelationFilter, Prisma.TeamWhereInput>;
    market?: Prisma.XOR<Prisma.PredictionMarketNullableScalarRelationFilter, Prisma.PredictionMarketWhereInput> | null;
};
export type MatchOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    teamAId?: Prisma.SortOrder;
    teamBId?: Prisma.SortOrder;
    tournament?: Prisma.SortOrderInput | Prisma.SortOrder;
    startTime?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    result?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    teamA?: Prisma.TeamOrderByWithRelationInput;
    teamB?: Prisma.TeamOrderByWithRelationInput;
    market?: Prisma.PredictionMarketOrderByWithRelationInput;
};
export type MatchWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.MatchWhereInput | Prisma.MatchWhereInput[];
    OR?: Prisma.MatchWhereInput[];
    NOT?: Prisma.MatchWhereInput | Prisma.MatchWhereInput[];
    teamAId?: Prisma.StringFilter<"Match"> | string;
    teamBId?: Prisma.StringFilter<"Match"> | string;
    tournament?: Prisma.StringNullableFilter<"Match"> | string | null;
    startTime?: Prisma.DateTimeFilter<"Match"> | Date | string;
    status?: Prisma.EnumMatchStatusFilter<"Match"> | $Enums.MatchStatus;
    result?: Prisma.EnumMatchResultNullableFilter<"Match"> | $Enums.MatchResult | null;
    createdAt?: Prisma.DateTimeFilter<"Match"> | Date | string;
    teamA?: Prisma.XOR<Prisma.TeamScalarRelationFilter, Prisma.TeamWhereInput>;
    teamB?: Prisma.XOR<Prisma.TeamScalarRelationFilter, Prisma.TeamWhereInput>;
    market?: Prisma.XOR<Prisma.PredictionMarketNullableScalarRelationFilter, Prisma.PredictionMarketWhereInput> | null;
}, "id">;
export type MatchOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    teamAId?: Prisma.SortOrder;
    teamBId?: Prisma.SortOrder;
    tournament?: Prisma.SortOrderInput | Prisma.SortOrder;
    startTime?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    result?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    _count?: Prisma.MatchCountOrderByAggregateInput;
    _max?: Prisma.MatchMaxOrderByAggregateInput;
    _min?: Prisma.MatchMinOrderByAggregateInput;
};
export type MatchScalarWhereWithAggregatesInput = {
    AND?: Prisma.MatchScalarWhereWithAggregatesInput | Prisma.MatchScalarWhereWithAggregatesInput[];
    OR?: Prisma.MatchScalarWhereWithAggregatesInput[];
    NOT?: Prisma.MatchScalarWhereWithAggregatesInput | Prisma.MatchScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"Match"> | string;
    teamAId?: Prisma.StringWithAggregatesFilter<"Match"> | string;
    teamBId?: Prisma.StringWithAggregatesFilter<"Match"> | string;
    tournament?: Prisma.StringNullableWithAggregatesFilter<"Match"> | string | null;
    startTime?: Prisma.DateTimeWithAggregatesFilter<"Match"> | Date | string;
    status?: Prisma.EnumMatchStatusWithAggregatesFilter<"Match"> | $Enums.MatchStatus;
    result?: Prisma.EnumMatchResultNullableWithAggregatesFilter<"Match"> | $Enums.MatchResult | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Match"> | Date | string;
};
export type MatchCreateInput = {
    id?: string;
    tournament?: string | null;
    startTime: Date | string;
    status: $Enums.MatchStatus;
    result?: $Enums.MatchResult | null;
    createdAt?: Date | string;
    teamA: Prisma.TeamCreateNestedOneWithoutMatchesAInput;
    teamB: Prisma.TeamCreateNestedOneWithoutMatchesBInput;
    market?: Prisma.PredictionMarketCreateNestedOneWithoutMatchInput;
};
export type MatchUncheckedCreateInput = {
    id?: string;
    teamAId: string;
    teamBId: string;
    tournament?: string | null;
    startTime: Date | string;
    status: $Enums.MatchStatus;
    result?: $Enums.MatchResult | null;
    createdAt?: Date | string;
    market?: Prisma.PredictionMarketUncheckedCreateNestedOneWithoutMatchInput;
};
export type MatchUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tournament?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    startTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumMatchStatusFieldUpdateOperationsInput | $Enums.MatchStatus;
    result?: Prisma.NullableEnumMatchResultFieldUpdateOperationsInput | $Enums.MatchResult | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    teamA?: Prisma.TeamUpdateOneRequiredWithoutMatchesANestedInput;
    teamB?: Prisma.TeamUpdateOneRequiredWithoutMatchesBNestedInput;
    market?: Prisma.PredictionMarketUpdateOneWithoutMatchNestedInput;
};
export type MatchUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    teamAId?: Prisma.StringFieldUpdateOperationsInput | string;
    teamBId?: Prisma.StringFieldUpdateOperationsInput | string;
    tournament?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    startTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumMatchStatusFieldUpdateOperationsInput | $Enums.MatchStatus;
    result?: Prisma.NullableEnumMatchResultFieldUpdateOperationsInput | $Enums.MatchResult | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    market?: Prisma.PredictionMarketUncheckedUpdateOneWithoutMatchNestedInput;
};
export type MatchCreateManyInput = {
    id?: string;
    teamAId: string;
    teamBId: string;
    tournament?: string | null;
    startTime: Date | string;
    status: $Enums.MatchStatus;
    result?: $Enums.MatchResult | null;
    createdAt?: Date | string;
};
export type MatchUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tournament?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    startTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumMatchStatusFieldUpdateOperationsInput | $Enums.MatchStatus;
    result?: Prisma.NullableEnumMatchResultFieldUpdateOperationsInput | $Enums.MatchResult | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type MatchUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    teamAId?: Prisma.StringFieldUpdateOperationsInput | string;
    teamBId?: Prisma.StringFieldUpdateOperationsInput | string;
    tournament?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    startTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumMatchStatusFieldUpdateOperationsInput | $Enums.MatchStatus;
    result?: Prisma.NullableEnumMatchResultFieldUpdateOperationsInput | $Enums.MatchResult | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type MatchListRelationFilter = {
    every?: Prisma.MatchWhereInput;
    some?: Prisma.MatchWhereInput;
    none?: Prisma.MatchWhereInput;
};
export type MatchOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type MatchCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    teamAId?: Prisma.SortOrder;
    teamBId?: Prisma.SortOrder;
    tournament?: Prisma.SortOrder;
    startTime?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    result?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type MatchMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    teamAId?: Prisma.SortOrder;
    teamBId?: Prisma.SortOrder;
    tournament?: Prisma.SortOrder;
    startTime?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    result?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type MatchMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    teamAId?: Prisma.SortOrder;
    teamBId?: Prisma.SortOrder;
    tournament?: Prisma.SortOrder;
    startTime?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    result?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type MatchScalarRelationFilter = {
    is?: Prisma.MatchWhereInput;
    isNot?: Prisma.MatchWhereInput;
};
export type MatchCreateNestedManyWithoutTeamAInput = {
    create?: Prisma.XOR<Prisma.MatchCreateWithoutTeamAInput, Prisma.MatchUncheckedCreateWithoutTeamAInput> | Prisma.MatchCreateWithoutTeamAInput[] | Prisma.MatchUncheckedCreateWithoutTeamAInput[];
    connectOrCreate?: Prisma.MatchCreateOrConnectWithoutTeamAInput | Prisma.MatchCreateOrConnectWithoutTeamAInput[];
    createMany?: Prisma.MatchCreateManyTeamAInputEnvelope;
    connect?: Prisma.MatchWhereUniqueInput | Prisma.MatchWhereUniqueInput[];
};
export type MatchCreateNestedManyWithoutTeamBInput = {
    create?: Prisma.XOR<Prisma.MatchCreateWithoutTeamBInput, Prisma.MatchUncheckedCreateWithoutTeamBInput> | Prisma.MatchCreateWithoutTeamBInput[] | Prisma.MatchUncheckedCreateWithoutTeamBInput[];
    connectOrCreate?: Prisma.MatchCreateOrConnectWithoutTeamBInput | Prisma.MatchCreateOrConnectWithoutTeamBInput[];
    createMany?: Prisma.MatchCreateManyTeamBInputEnvelope;
    connect?: Prisma.MatchWhereUniqueInput | Prisma.MatchWhereUniqueInput[];
};
export type MatchUncheckedCreateNestedManyWithoutTeamAInput = {
    create?: Prisma.XOR<Prisma.MatchCreateWithoutTeamAInput, Prisma.MatchUncheckedCreateWithoutTeamAInput> | Prisma.MatchCreateWithoutTeamAInput[] | Prisma.MatchUncheckedCreateWithoutTeamAInput[];
    connectOrCreate?: Prisma.MatchCreateOrConnectWithoutTeamAInput | Prisma.MatchCreateOrConnectWithoutTeamAInput[];
    createMany?: Prisma.MatchCreateManyTeamAInputEnvelope;
    connect?: Prisma.MatchWhereUniqueInput | Prisma.MatchWhereUniqueInput[];
};
export type MatchUncheckedCreateNestedManyWithoutTeamBInput = {
    create?: Prisma.XOR<Prisma.MatchCreateWithoutTeamBInput, Prisma.MatchUncheckedCreateWithoutTeamBInput> | Prisma.MatchCreateWithoutTeamBInput[] | Prisma.MatchUncheckedCreateWithoutTeamBInput[];
    connectOrCreate?: Prisma.MatchCreateOrConnectWithoutTeamBInput | Prisma.MatchCreateOrConnectWithoutTeamBInput[];
    createMany?: Prisma.MatchCreateManyTeamBInputEnvelope;
    connect?: Prisma.MatchWhereUniqueInput | Prisma.MatchWhereUniqueInput[];
};
export type MatchUpdateManyWithoutTeamANestedInput = {
    create?: Prisma.XOR<Prisma.MatchCreateWithoutTeamAInput, Prisma.MatchUncheckedCreateWithoutTeamAInput> | Prisma.MatchCreateWithoutTeamAInput[] | Prisma.MatchUncheckedCreateWithoutTeamAInput[];
    connectOrCreate?: Prisma.MatchCreateOrConnectWithoutTeamAInput | Prisma.MatchCreateOrConnectWithoutTeamAInput[];
    upsert?: Prisma.MatchUpsertWithWhereUniqueWithoutTeamAInput | Prisma.MatchUpsertWithWhereUniqueWithoutTeamAInput[];
    createMany?: Prisma.MatchCreateManyTeamAInputEnvelope;
    set?: Prisma.MatchWhereUniqueInput | Prisma.MatchWhereUniqueInput[];
    disconnect?: Prisma.MatchWhereUniqueInput | Prisma.MatchWhereUniqueInput[];
    delete?: Prisma.MatchWhereUniqueInput | Prisma.MatchWhereUniqueInput[];
    connect?: Prisma.MatchWhereUniqueInput | Prisma.MatchWhereUniqueInput[];
    update?: Prisma.MatchUpdateWithWhereUniqueWithoutTeamAInput | Prisma.MatchUpdateWithWhereUniqueWithoutTeamAInput[];
    updateMany?: Prisma.MatchUpdateManyWithWhereWithoutTeamAInput | Prisma.MatchUpdateManyWithWhereWithoutTeamAInput[];
    deleteMany?: Prisma.MatchScalarWhereInput | Prisma.MatchScalarWhereInput[];
};
export type MatchUpdateManyWithoutTeamBNestedInput = {
    create?: Prisma.XOR<Prisma.MatchCreateWithoutTeamBInput, Prisma.MatchUncheckedCreateWithoutTeamBInput> | Prisma.MatchCreateWithoutTeamBInput[] | Prisma.MatchUncheckedCreateWithoutTeamBInput[];
    connectOrCreate?: Prisma.MatchCreateOrConnectWithoutTeamBInput | Prisma.MatchCreateOrConnectWithoutTeamBInput[];
    upsert?: Prisma.MatchUpsertWithWhereUniqueWithoutTeamBInput | Prisma.MatchUpsertWithWhereUniqueWithoutTeamBInput[];
    createMany?: Prisma.MatchCreateManyTeamBInputEnvelope;
    set?: Prisma.MatchWhereUniqueInput | Prisma.MatchWhereUniqueInput[];
    disconnect?: Prisma.MatchWhereUniqueInput | Prisma.MatchWhereUniqueInput[];
    delete?: Prisma.MatchWhereUniqueInput | Prisma.MatchWhereUniqueInput[];
    connect?: Prisma.MatchWhereUniqueInput | Prisma.MatchWhereUniqueInput[];
    update?: Prisma.MatchUpdateWithWhereUniqueWithoutTeamBInput | Prisma.MatchUpdateWithWhereUniqueWithoutTeamBInput[];
    updateMany?: Prisma.MatchUpdateManyWithWhereWithoutTeamBInput | Prisma.MatchUpdateManyWithWhereWithoutTeamBInput[];
    deleteMany?: Prisma.MatchScalarWhereInput | Prisma.MatchScalarWhereInput[];
};
export type MatchUncheckedUpdateManyWithoutTeamANestedInput = {
    create?: Prisma.XOR<Prisma.MatchCreateWithoutTeamAInput, Prisma.MatchUncheckedCreateWithoutTeamAInput> | Prisma.MatchCreateWithoutTeamAInput[] | Prisma.MatchUncheckedCreateWithoutTeamAInput[];
    connectOrCreate?: Prisma.MatchCreateOrConnectWithoutTeamAInput | Prisma.MatchCreateOrConnectWithoutTeamAInput[];
    upsert?: Prisma.MatchUpsertWithWhereUniqueWithoutTeamAInput | Prisma.MatchUpsertWithWhereUniqueWithoutTeamAInput[];
    createMany?: Prisma.MatchCreateManyTeamAInputEnvelope;
    set?: Prisma.MatchWhereUniqueInput | Prisma.MatchWhereUniqueInput[];
    disconnect?: Prisma.MatchWhereUniqueInput | Prisma.MatchWhereUniqueInput[];
    delete?: Prisma.MatchWhereUniqueInput | Prisma.MatchWhereUniqueInput[];
    connect?: Prisma.MatchWhereUniqueInput | Prisma.MatchWhereUniqueInput[];
    update?: Prisma.MatchUpdateWithWhereUniqueWithoutTeamAInput | Prisma.MatchUpdateWithWhereUniqueWithoutTeamAInput[];
    updateMany?: Prisma.MatchUpdateManyWithWhereWithoutTeamAInput | Prisma.MatchUpdateManyWithWhereWithoutTeamAInput[];
    deleteMany?: Prisma.MatchScalarWhereInput | Prisma.MatchScalarWhereInput[];
};
export type MatchUncheckedUpdateManyWithoutTeamBNestedInput = {
    create?: Prisma.XOR<Prisma.MatchCreateWithoutTeamBInput, Prisma.MatchUncheckedCreateWithoutTeamBInput> | Prisma.MatchCreateWithoutTeamBInput[] | Prisma.MatchUncheckedCreateWithoutTeamBInput[];
    connectOrCreate?: Prisma.MatchCreateOrConnectWithoutTeamBInput | Prisma.MatchCreateOrConnectWithoutTeamBInput[];
    upsert?: Prisma.MatchUpsertWithWhereUniqueWithoutTeamBInput | Prisma.MatchUpsertWithWhereUniqueWithoutTeamBInput[];
    createMany?: Prisma.MatchCreateManyTeamBInputEnvelope;
    set?: Prisma.MatchWhereUniqueInput | Prisma.MatchWhereUniqueInput[];
    disconnect?: Prisma.MatchWhereUniqueInput | Prisma.MatchWhereUniqueInput[];
    delete?: Prisma.MatchWhereUniqueInput | Prisma.MatchWhereUniqueInput[];
    connect?: Prisma.MatchWhereUniqueInput | Prisma.MatchWhereUniqueInput[];
    update?: Prisma.MatchUpdateWithWhereUniqueWithoutTeamBInput | Prisma.MatchUpdateWithWhereUniqueWithoutTeamBInput[];
    updateMany?: Prisma.MatchUpdateManyWithWhereWithoutTeamBInput | Prisma.MatchUpdateManyWithWhereWithoutTeamBInput[];
    deleteMany?: Prisma.MatchScalarWhereInput | Prisma.MatchScalarWhereInput[];
};
export type EnumMatchStatusFieldUpdateOperationsInput = {
    set?: $Enums.MatchStatus;
};
export type NullableEnumMatchResultFieldUpdateOperationsInput = {
    set?: $Enums.MatchResult | null;
};
export type MatchCreateNestedOneWithoutMarketInput = {
    create?: Prisma.XOR<Prisma.MatchCreateWithoutMarketInput, Prisma.MatchUncheckedCreateWithoutMarketInput>;
    connectOrCreate?: Prisma.MatchCreateOrConnectWithoutMarketInput;
    connect?: Prisma.MatchWhereUniqueInput;
};
export type MatchUpdateOneRequiredWithoutMarketNestedInput = {
    create?: Prisma.XOR<Prisma.MatchCreateWithoutMarketInput, Prisma.MatchUncheckedCreateWithoutMarketInput>;
    connectOrCreate?: Prisma.MatchCreateOrConnectWithoutMarketInput;
    upsert?: Prisma.MatchUpsertWithoutMarketInput;
    connect?: Prisma.MatchWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.MatchUpdateToOneWithWhereWithoutMarketInput, Prisma.MatchUpdateWithoutMarketInput>, Prisma.MatchUncheckedUpdateWithoutMarketInput>;
};
export type MatchCreateWithoutTeamAInput = {
    id?: string;
    tournament?: string | null;
    startTime: Date | string;
    status: $Enums.MatchStatus;
    result?: $Enums.MatchResult | null;
    createdAt?: Date | string;
    teamB: Prisma.TeamCreateNestedOneWithoutMatchesBInput;
    market?: Prisma.PredictionMarketCreateNestedOneWithoutMatchInput;
};
export type MatchUncheckedCreateWithoutTeamAInput = {
    id?: string;
    teamBId: string;
    tournament?: string | null;
    startTime: Date | string;
    status: $Enums.MatchStatus;
    result?: $Enums.MatchResult | null;
    createdAt?: Date | string;
    market?: Prisma.PredictionMarketUncheckedCreateNestedOneWithoutMatchInput;
};
export type MatchCreateOrConnectWithoutTeamAInput = {
    where: Prisma.MatchWhereUniqueInput;
    create: Prisma.XOR<Prisma.MatchCreateWithoutTeamAInput, Prisma.MatchUncheckedCreateWithoutTeamAInput>;
};
export type MatchCreateManyTeamAInputEnvelope = {
    data: Prisma.MatchCreateManyTeamAInput | Prisma.MatchCreateManyTeamAInput[];
    skipDuplicates?: boolean;
};
export type MatchCreateWithoutTeamBInput = {
    id?: string;
    tournament?: string | null;
    startTime: Date | string;
    status: $Enums.MatchStatus;
    result?: $Enums.MatchResult | null;
    createdAt?: Date | string;
    teamA: Prisma.TeamCreateNestedOneWithoutMatchesAInput;
    market?: Prisma.PredictionMarketCreateNestedOneWithoutMatchInput;
};
export type MatchUncheckedCreateWithoutTeamBInput = {
    id?: string;
    teamAId: string;
    tournament?: string | null;
    startTime: Date | string;
    status: $Enums.MatchStatus;
    result?: $Enums.MatchResult | null;
    createdAt?: Date | string;
    market?: Prisma.PredictionMarketUncheckedCreateNestedOneWithoutMatchInput;
};
export type MatchCreateOrConnectWithoutTeamBInput = {
    where: Prisma.MatchWhereUniqueInput;
    create: Prisma.XOR<Prisma.MatchCreateWithoutTeamBInput, Prisma.MatchUncheckedCreateWithoutTeamBInput>;
};
export type MatchCreateManyTeamBInputEnvelope = {
    data: Prisma.MatchCreateManyTeamBInput | Prisma.MatchCreateManyTeamBInput[];
    skipDuplicates?: boolean;
};
export type MatchUpsertWithWhereUniqueWithoutTeamAInput = {
    where: Prisma.MatchWhereUniqueInput;
    update: Prisma.XOR<Prisma.MatchUpdateWithoutTeamAInput, Prisma.MatchUncheckedUpdateWithoutTeamAInput>;
    create: Prisma.XOR<Prisma.MatchCreateWithoutTeamAInput, Prisma.MatchUncheckedCreateWithoutTeamAInput>;
};
export type MatchUpdateWithWhereUniqueWithoutTeamAInput = {
    where: Prisma.MatchWhereUniqueInput;
    data: Prisma.XOR<Prisma.MatchUpdateWithoutTeamAInput, Prisma.MatchUncheckedUpdateWithoutTeamAInput>;
};
export type MatchUpdateManyWithWhereWithoutTeamAInput = {
    where: Prisma.MatchScalarWhereInput;
    data: Prisma.XOR<Prisma.MatchUpdateManyMutationInput, Prisma.MatchUncheckedUpdateManyWithoutTeamAInput>;
};
export type MatchScalarWhereInput = {
    AND?: Prisma.MatchScalarWhereInput | Prisma.MatchScalarWhereInput[];
    OR?: Prisma.MatchScalarWhereInput[];
    NOT?: Prisma.MatchScalarWhereInput | Prisma.MatchScalarWhereInput[];
    id?: Prisma.StringFilter<"Match"> | string;
    teamAId?: Prisma.StringFilter<"Match"> | string;
    teamBId?: Prisma.StringFilter<"Match"> | string;
    tournament?: Prisma.StringNullableFilter<"Match"> | string | null;
    startTime?: Prisma.DateTimeFilter<"Match"> | Date | string;
    status?: Prisma.EnumMatchStatusFilter<"Match"> | $Enums.MatchStatus;
    result?: Prisma.EnumMatchResultNullableFilter<"Match"> | $Enums.MatchResult | null;
    createdAt?: Prisma.DateTimeFilter<"Match"> | Date | string;
};
export type MatchUpsertWithWhereUniqueWithoutTeamBInput = {
    where: Prisma.MatchWhereUniqueInput;
    update: Prisma.XOR<Prisma.MatchUpdateWithoutTeamBInput, Prisma.MatchUncheckedUpdateWithoutTeamBInput>;
    create: Prisma.XOR<Prisma.MatchCreateWithoutTeamBInput, Prisma.MatchUncheckedCreateWithoutTeamBInput>;
};
export type MatchUpdateWithWhereUniqueWithoutTeamBInput = {
    where: Prisma.MatchWhereUniqueInput;
    data: Prisma.XOR<Prisma.MatchUpdateWithoutTeamBInput, Prisma.MatchUncheckedUpdateWithoutTeamBInput>;
};
export type MatchUpdateManyWithWhereWithoutTeamBInput = {
    where: Prisma.MatchScalarWhereInput;
    data: Prisma.XOR<Prisma.MatchUpdateManyMutationInput, Prisma.MatchUncheckedUpdateManyWithoutTeamBInput>;
};
export type MatchCreateWithoutMarketInput = {
    id?: string;
    tournament?: string | null;
    startTime: Date | string;
    status: $Enums.MatchStatus;
    result?: $Enums.MatchResult | null;
    createdAt?: Date | string;
    teamA: Prisma.TeamCreateNestedOneWithoutMatchesAInput;
    teamB: Prisma.TeamCreateNestedOneWithoutMatchesBInput;
};
export type MatchUncheckedCreateWithoutMarketInput = {
    id?: string;
    teamAId: string;
    teamBId: string;
    tournament?: string | null;
    startTime: Date | string;
    status: $Enums.MatchStatus;
    result?: $Enums.MatchResult | null;
    createdAt?: Date | string;
};
export type MatchCreateOrConnectWithoutMarketInput = {
    where: Prisma.MatchWhereUniqueInput;
    create: Prisma.XOR<Prisma.MatchCreateWithoutMarketInput, Prisma.MatchUncheckedCreateWithoutMarketInput>;
};
export type MatchUpsertWithoutMarketInput = {
    update: Prisma.XOR<Prisma.MatchUpdateWithoutMarketInput, Prisma.MatchUncheckedUpdateWithoutMarketInput>;
    create: Prisma.XOR<Prisma.MatchCreateWithoutMarketInput, Prisma.MatchUncheckedCreateWithoutMarketInput>;
    where?: Prisma.MatchWhereInput;
};
export type MatchUpdateToOneWithWhereWithoutMarketInput = {
    where?: Prisma.MatchWhereInput;
    data: Prisma.XOR<Prisma.MatchUpdateWithoutMarketInput, Prisma.MatchUncheckedUpdateWithoutMarketInput>;
};
export type MatchUpdateWithoutMarketInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tournament?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    startTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumMatchStatusFieldUpdateOperationsInput | $Enums.MatchStatus;
    result?: Prisma.NullableEnumMatchResultFieldUpdateOperationsInput | $Enums.MatchResult | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    teamA?: Prisma.TeamUpdateOneRequiredWithoutMatchesANestedInput;
    teamB?: Prisma.TeamUpdateOneRequiredWithoutMatchesBNestedInput;
};
export type MatchUncheckedUpdateWithoutMarketInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    teamAId?: Prisma.StringFieldUpdateOperationsInput | string;
    teamBId?: Prisma.StringFieldUpdateOperationsInput | string;
    tournament?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    startTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumMatchStatusFieldUpdateOperationsInput | $Enums.MatchStatus;
    result?: Prisma.NullableEnumMatchResultFieldUpdateOperationsInput | $Enums.MatchResult | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type MatchCreateManyTeamAInput = {
    id?: string;
    teamBId: string;
    tournament?: string | null;
    startTime: Date | string;
    status: $Enums.MatchStatus;
    result?: $Enums.MatchResult | null;
    createdAt?: Date | string;
};
export type MatchCreateManyTeamBInput = {
    id?: string;
    teamAId: string;
    tournament?: string | null;
    startTime: Date | string;
    status: $Enums.MatchStatus;
    result?: $Enums.MatchResult | null;
    createdAt?: Date | string;
};
export type MatchUpdateWithoutTeamAInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tournament?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    startTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumMatchStatusFieldUpdateOperationsInput | $Enums.MatchStatus;
    result?: Prisma.NullableEnumMatchResultFieldUpdateOperationsInput | $Enums.MatchResult | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    teamB?: Prisma.TeamUpdateOneRequiredWithoutMatchesBNestedInput;
    market?: Prisma.PredictionMarketUpdateOneWithoutMatchNestedInput;
};
export type MatchUncheckedUpdateWithoutTeamAInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    teamBId?: Prisma.StringFieldUpdateOperationsInput | string;
    tournament?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    startTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumMatchStatusFieldUpdateOperationsInput | $Enums.MatchStatus;
    result?: Prisma.NullableEnumMatchResultFieldUpdateOperationsInput | $Enums.MatchResult | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    market?: Prisma.PredictionMarketUncheckedUpdateOneWithoutMatchNestedInput;
};
export type MatchUncheckedUpdateManyWithoutTeamAInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    teamBId?: Prisma.StringFieldUpdateOperationsInput | string;
    tournament?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    startTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumMatchStatusFieldUpdateOperationsInput | $Enums.MatchStatus;
    result?: Prisma.NullableEnumMatchResultFieldUpdateOperationsInput | $Enums.MatchResult | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type MatchUpdateWithoutTeamBInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tournament?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    startTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumMatchStatusFieldUpdateOperationsInput | $Enums.MatchStatus;
    result?: Prisma.NullableEnumMatchResultFieldUpdateOperationsInput | $Enums.MatchResult | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    teamA?: Prisma.TeamUpdateOneRequiredWithoutMatchesANestedInput;
    market?: Prisma.PredictionMarketUpdateOneWithoutMatchNestedInput;
};
export type MatchUncheckedUpdateWithoutTeamBInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    teamAId?: Prisma.StringFieldUpdateOperationsInput | string;
    tournament?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    startTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumMatchStatusFieldUpdateOperationsInput | $Enums.MatchStatus;
    result?: Prisma.NullableEnumMatchResultFieldUpdateOperationsInput | $Enums.MatchResult | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    market?: Prisma.PredictionMarketUncheckedUpdateOneWithoutMatchNestedInput;
};
export type MatchUncheckedUpdateManyWithoutTeamBInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    teamAId?: Prisma.StringFieldUpdateOperationsInput | string;
    tournament?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    startTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumMatchStatusFieldUpdateOperationsInput | $Enums.MatchStatus;
    result?: Prisma.NullableEnumMatchResultFieldUpdateOperationsInput | $Enums.MatchResult | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type MatchSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    teamAId?: boolean;
    teamBId?: boolean;
    tournament?: boolean;
    startTime?: boolean;
    status?: boolean;
    result?: boolean;
    createdAt?: boolean;
    teamA?: boolean | Prisma.TeamDefaultArgs<ExtArgs>;
    teamB?: boolean | Prisma.TeamDefaultArgs<ExtArgs>;
    market?: boolean | Prisma.Match$marketArgs<ExtArgs>;
}, ExtArgs["result"]["match"]>;
export type MatchSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    teamAId?: boolean;
    teamBId?: boolean;
    tournament?: boolean;
    startTime?: boolean;
    status?: boolean;
    result?: boolean;
    createdAt?: boolean;
    teamA?: boolean | Prisma.TeamDefaultArgs<ExtArgs>;
    teamB?: boolean | Prisma.TeamDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["match"]>;
export type MatchSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    teamAId?: boolean;
    teamBId?: boolean;
    tournament?: boolean;
    startTime?: boolean;
    status?: boolean;
    result?: boolean;
    createdAt?: boolean;
    teamA?: boolean | Prisma.TeamDefaultArgs<ExtArgs>;
    teamB?: boolean | Prisma.TeamDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["match"]>;
export type MatchSelectScalar = {
    id?: boolean;
    teamAId?: boolean;
    teamBId?: boolean;
    tournament?: boolean;
    startTime?: boolean;
    status?: boolean;
    result?: boolean;
    createdAt?: boolean;
};
export type MatchOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "teamAId" | "teamBId" | "tournament" | "startTime" | "status" | "result" | "createdAt", ExtArgs["result"]["match"]>;
export type MatchInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    teamA?: boolean | Prisma.TeamDefaultArgs<ExtArgs>;
    teamB?: boolean | Prisma.TeamDefaultArgs<ExtArgs>;
    market?: boolean | Prisma.Match$marketArgs<ExtArgs>;
};
export type MatchIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    teamA?: boolean | Prisma.TeamDefaultArgs<ExtArgs>;
    teamB?: boolean | Prisma.TeamDefaultArgs<ExtArgs>;
};
export type MatchIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    teamA?: boolean | Prisma.TeamDefaultArgs<ExtArgs>;
    teamB?: boolean | Prisma.TeamDefaultArgs<ExtArgs>;
};
export type $MatchPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Match";
    objects: {
        teamA: Prisma.$TeamPayload<ExtArgs>;
        teamB: Prisma.$TeamPayload<ExtArgs>;
        market: Prisma.$PredictionMarketPayload<ExtArgs> | null;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        teamAId: string;
        teamBId: string;
        tournament: string | null;
        startTime: Date;
        status: $Enums.MatchStatus;
        result: $Enums.MatchResult | null;
        createdAt: Date;
    }, ExtArgs["result"]["match"]>;
    composites: {};
};
export type MatchGetPayload<S extends boolean | null | undefined | MatchDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$MatchPayload, S>;
export type MatchCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<MatchFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: MatchCountAggregateInputType | true;
};
export interface MatchDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Match'];
        meta: {
            name: 'Match';
        };
    };
    /**
     * Find zero or one Match that matches the filter.
     * @param {MatchFindUniqueArgs} args - Arguments to find a Match
     * @example
     * // Get one Match
     * const match = await prisma.match.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MatchFindUniqueArgs>(args: Prisma.SelectSubset<T, MatchFindUniqueArgs<ExtArgs>>): Prisma.Prisma__MatchClient<runtime.Types.Result.GetResult<Prisma.$MatchPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one Match that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MatchFindUniqueOrThrowArgs} args - Arguments to find a Match
     * @example
     * // Get one Match
     * const match = await prisma.match.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MatchFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, MatchFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__MatchClient<runtime.Types.Result.GetResult<Prisma.$MatchPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first Match that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MatchFindFirstArgs} args - Arguments to find a Match
     * @example
     * // Get one Match
     * const match = await prisma.match.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MatchFindFirstArgs>(args?: Prisma.SelectSubset<T, MatchFindFirstArgs<ExtArgs>>): Prisma.Prisma__MatchClient<runtime.Types.Result.GetResult<Prisma.$MatchPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first Match that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MatchFindFirstOrThrowArgs} args - Arguments to find a Match
     * @example
     * // Get one Match
     * const match = await prisma.match.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MatchFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, MatchFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__MatchClient<runtime.Types.Result.GetResult<Prisma.$MatchPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more Matches that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MatchFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Matches
     * const matches = await prisma.match.findMany()
     *
     * // Get first 10 Matches
     * const matches = await prisma.match.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const matchWithIdOnly = await prisma.match.findMany({ select: { id: true } })
     *
     */
    findMany<T extends MatchFindManyArgs>(args?: Prisma.SelectSubset<T, MatchFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MatchPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a Match.
     * @param {MatchCreateArgs} args - Arguments to create a Match.
     * @example
     * // Create one Match
     * const Match = await prisma.match.create({
     *   data: {
     *     // ... data to create a Match
     *   }
     * })
     *
     */
    create<T extends MatchCreateArgs>(args: Prisma.SelectSubset<T, MatchCreateArgs<ExtArgs>>): Prisma.Prisma__MatchClient<runtime.Types.Result.GetResult<Prisma.$MatchPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many Matches.
     * @param {MatchCreateManyArgs} args - Arguments to create many Matches.
     * @example
     * // Create many Matches
     * const match = await prisma.match.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends MatchCreateManyArgs>(args?: Prisma.SelectSubset<T, MatchCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many Matches and returns the data saved in the database.
     * @param {MatchCreateManyAndReturnArgs} args - Arguments to create many Matches.
     * @example
     * // Create many Matches
     * const match = await prisma.match.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Matches and only return the `id`
     * const matchWithIdOnly = await prisma.match.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends MatchCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, MatchCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MatchPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a Match.
     * @param {MatchDeleteArgs} args - Arguments to delete one Match.
     * @example
     * // Delete one Match
     * const Match = await prisma.match.delete({
     *   where: {
     *     // ... filter to delete one Match
     *   }
     * })
     *
     */
    delete<T extends MatchDeleteArgs>(args: Prisma.SelectSubset<T, MatchDeleteArgs<ExtArgs>>): Prisma.Prisma__MatchClient<runtime.Types.Result.GetResult<Prisma.$MatchPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one Match.
     * @param {MatchUpdateArgs} args - Arguments to update one Match.
     * @example
     * // Update one Match
     * const match = await prisma.match.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends MatchUpdateArgs>(args: Prisma.SelectSubset<T, MatchUpdateArgs<ExtArgs>>): Prisma.Prisma__MatchClient<runtime.Types.Result.GetResult<Prisma.$MatchPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more Matches.
     * @param {MatchDeleteManyArgs} args - Arguments to filter Matches to delete.
     * @example
     * // Delete a few Matches
     * const { count } = await prisma.match.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends MatchDeleteManyArgs>(args?: Prisma.SelectSubset<T, MatchDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more Matches.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MatchUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Matches
     * const match = await prisma.match.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends MatchUpdateManyArgs>(args: Prisma.SelectSubset<T, MatchUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more Matches and returns the data updated in the database.
     * @param {MatchUpdateManyAndReturnArgs} args - Arguments to update many Matches.
     * @example
     * // Update many Matches
     * const match = await prisma.match.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more Matches and only return the `id`
     * const matchWithIdOnly = await prisma.match.updateManyAndReturn({
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
    updateManyAndReturn<T extends MatchUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, MatchUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MatchPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one Match.
     * @param {MatchUpsertArgs} args - Arguments to update or create a Match.
     * @example
     * // Update or create a Match
     * const match = await prisma.match.upsert({
     *   create: {
     *     // ... data to create a Match
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Match we want to update
     *   }
     * })
     */
    upsert<T extends MatchUpsertArgs>(args: Prisma.SelectSubset<T, MatchUpsertArgs<ExtArgs>>): Prisma.Prisma__MatchClient<runtime.Types.Result.GetResult<Prisma.$MatchPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of Matches.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MatchCountArgs} args - Arguments to filter Matches to count.
     * @example
     * // Count the number of Matches
     * const count = await prisma.match.count({
     *   where: {
     *     // ... the filter for the Matches we want to count
     *   }
     * })
    **/
    count<T extends MatchCountArgs>(args?: Prisma.Subset<T, MatchCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], MatchCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a Match.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MatchAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends MatchAggregateArgs>(args: Prisma.Subset<T, MatchAggregateArgs>): Prisma.PrismaPromise<GetMatchAggregateType<T>>;
    /**
     * Group by Match.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MatchGroupByArgs} args - Group by arguments.
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
    groupBy<T extends MatchGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: MatchGroupByArgs['orderBy'];
    } : {
        orderBy?: MatchGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, MatchGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMatchGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the Match model
     */
    readonly fields: MatchFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for Match.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__MatchClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    teamA<T extends Prisma.TeamDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.TeamDefaultArgs<ExtArgs>>): Prisma.Prisma__TeamClient<runtime.Types.Result.GetResult<Prisma.$TeamPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    teamB<T extends Prisma.TeamDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.TeamDefaultArgs<ExtArgs>>): Prisma.Prisma__TeamClient<runtime.Types.Result.GetResult<Prisma.$TeamPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    market<T extends Prisma.Match$marketArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Match$marketArgs<ExtArgs>>): Prisma.Prisma__PredictionMarketClient<runtime.Types.Result.GetResult<Prisma.$PredictionMarketPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
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
 * Fields of the Match model
 */
export interface MatchFieldRefs {
    readonly id: Prisma.FieldRef<"Match", 'String'>;
    readonly teamAId: Prisma.FieldRef<"Match", 'String'>;
    readonly teamBId: Prisma.FieldRef<"Match", 'String'>;
    readonly tournament: Prisma.FieldRef<"Match", 'String'>;
    readonly startTime: Prisma.FieldRef<"Match", 'DateTime'>;
    readonly status: Prisma.FieldRef<"Match", 'MatchStatus'>;
    readonly result: Prisma.FieldRef<"Match", 'MatchResult'>;
    readonly createdAt: Prisma.FieldRef<"Match", 'DateTime'>;
}
/**
 * Match findUnique
 */
export type MatchFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Match
     */
    select?: Prisma.MatchSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Match
     */
    omit?: Prisma.MatchOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MatchInclude<ExtArgs> | null;
    /**
     * Filter, which Match to fetch.
     */
    where: Prisma.MatchWhereUniqueInput;
};
/**
 * Match findUniqueOrThrow
 */
export type MatchFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Match
     */
    select?: Prisma.MatchSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Match
     */
    omit?: Prisma.MatchOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MatchInclude<ExtArgs> | null;
    /**
     * Filter, which Match to fetch.
     */
    where: Prisma.MatchWhereUniqueInput;
};
/**
 * Match findFirst
 */
export type MatchFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Match
     */
    select?: Prisma.MatchSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Match
     */
    omit?: Prisma.MatchOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MatchInclude<ExtArgs> | null;
    /**
     * Filter, which Match to fetch.
     */
    where?: Prisma.MatchWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Matches to fetch.
     */
    orderBy?: Prisma.MatchOrderByWithRelationInput | Prisma.MatchOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Matches.
     */
    cursor?: Prisma.MatchWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Matches from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Matches.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Matches.
     */
    distinct?: Prisma.MatchScalarFieldEnum | Prisma.MatchScalarFieldEnum[];
};
/**
 * Match findFirstOrThrow
 */
export type MatchFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Match
     */
    select?: Prisma.MatchSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Match
     */
    omit?: Prisma.MatchOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MatchInclude<ExtArgs> | null;
    /**
     * Filter, which Match to fetch.
     */
    where?: Prisma.MatchWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Matches to fetch.
     */
    orderBy?: Prisma.MatchOrderByWithRelationInput | Prisma.MatchOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Matches.
     */
    cursor?: Prisma.MatchWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Matches from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Matches.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Matches.
     */
    distinct?: Prisma.MatchScalarFieldEnum | Prisma.MatchScalarFieldEnum[];
};
/**
 * Match findMany
 */
export type MatchFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Match
     */
    select?: Prisma.MatchSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Match
     */
    omit?: Prisma.MatchOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MatchInclude<ExtArgs> | null;
    /**
     * Filter, which Matches to fetch.
     */
    where?: Prisma.MatchWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Matches to fetch.
     */
    orderBy?: Prisma.MatchOrderByWithRelationInput | Prisma.MatchOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Matches.
     */
    cursor?: Prisma.MatchWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Matches from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Matches.
     */
    skip?: number;
    distinct?: Prisma.MatchScalarFieldEnum | Prisma.MatchScalarFieldEnum[];
};
/**
 * Match create
 */
export type MatchCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Match
     */
    select?: Prisma.MatchSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Match
     */
    omit?: Prisma.MatchOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MatchInclude<ExtArgs> | null;
    /**
     * The data needed to create a Match.
     */
    data: Prisma.XOR<Prisma.MatchCreateInput, Prisma.MatchUncheckedCreateInput>;
};
/**
 * Match createMany
 */
export type MatchCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many Matches.
     */
    data: Prisma.MatchCreateManyInput | Prisma.MatchCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * Match createManyAndReturn
 */
export type MatchCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Match
     */
    select?: Prisma.MatchSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Match
     */
    omit?: Prisma.MatchOmit<ExtArgs> | null;
    /**
     * The data used to create many Matches.
     */
    data: Prisma.MatchCreateManyInput | Prisma.MatchCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MatchIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * Match update
 */
export type MatchUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Match
     */
    select?: Prisma.MatchSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Match
     */
    omit?: Prisma.MatchOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MatchInclude<ExtArgs> | null;
    /**
     * The data needed to update a Match.
     */
    data: Prisma.XOR<Prisma.MatchUpdateInput, Prisma.MatchUncheckedUpdateInput>;
    /**
     * Choose, which Match to update.
     */
    where: Prisma.MatchWhereUniqueInput;
};
/**
 * Match updateMany
 */
export type MatchUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update Matches.
     */
    data: Prisma.XOR<Prisma.MatchUpdateManyMutationInput, Prisma.MatchUncheckedUpdateManyInput>;
    /**
     * Filter which Matches to update
     */
    where?: Prisma.MatchWhereInput;
    /**
     * Limit how many Matches to update.
     */
    limit?: number;
};
/**
 * Match updateManyAndReturn
 */
export type MatchUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Match
     */
    select?: Prisma.MatchSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Match
     */
    omit?: Prisma.MatchOmit<ExtArgs> | null;
    /**
     * The data used to update Matches.
     */
    data: Prisma.XOR<Prisma.MatchUpdateManyMutationInput, Prisma.MatchUncheckedUpdateManyInput>;
    /**
     * Filter which Matches to update
     */
    where?: Prisma.MatchWhereInput;
    /**
     * Limit how many Matches to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MatchIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * Match upsert
 */
export type MatchUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Match
     */
    select?: Prisma.MatchSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Match
     */
    omit?: Prisma.MatchOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MatchInclude<ExtArgs> | null;
    /**
     * The filter to search for the Match to update in case it exists.
     */
    where: Prisma.MatchWhereUniqueInput;
    /**
     * In case the Match found by the `where` argument doesn't exist, create a new Match with this data.
     */
    create: Prisma.XOR<Prisma.MatchCreateInput, Prisma.MatchUncheckedCreateInput>;
    /**
     * In case the Match was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.MatchUpdateInput, Prisma.MatchUncheckedUpdateInput>;
};
/**
 * Match delete
 */
export type MatchDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Match
     */
    select?: Prisma.MatchSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Match
     */
    omit?: Prisma.MatchOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MatchInclude<ExtArgs> | null;
    /**
     * Filter which Match to delete.
     */
    where: Prisma.MatchWhereUniqueInput;
};
/**
 * Match deleteMany
 */
export type MatchDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which Matches to delete
     */
    where?: Prisma.MatchWhereInput;
    /**
     * Limit how many Matches to delete.
     */
    limit?: number;
};
/**
 * Match.market
 */
export type Match$marketArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    where?: Prisma.PredictionMarketWhereInput;
};
/**
 * Match without action
 */
export type MatchDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Match
     */
    select?: Prisma.MatchSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Match
     */
    omit?: Prisma.MatchOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MatchInclude<ExtArgs> | null;
};
export {};
//# sourceMappingURL=Match.d.ts.map