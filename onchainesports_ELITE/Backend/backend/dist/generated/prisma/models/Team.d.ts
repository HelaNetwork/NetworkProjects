import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model Team
 *
 */
export type TeamModel = runtime.Types.Result.DefaultSelection<Prisma.$TeamPayload>;
export type AggregateTeam = {
    _count: TeamCountAggregateOutputType | null;
    _min: TeamMinAggregateOutputType | null;
    _max: TeamMaxAggregateOutputType | null;
};
export type TeamMinAggregateOutputType = {
    id: string | null;
    name: string | null;
    game: string | null;
    region: string | null;
    logoUrl: string | null;
    createdAt: Date | null;
};
export type TeamMaxAggregateOutputType = {
    id: string | null;
    name: string | null;
    game: string | null;
    region: string | null;
    logoUrl: string | null;
    createdAt: Date | null;
};
export type TeamCountAggregateOutputType = {
    id: number;
    name: number;
    game: number;
    region: number;
    logoUrl: number;
    createdAt: number;
    _all: number;
};
export type TeamMinAggregateInputType = {
    id?: true;
    name?: true;
    game?: true;
    region?: true;
    logoUrl?: true;
    createdAt?: true;
};
export type TeamMaxAggregateInputType = {
    id?: true;
    name?: true;
    game?: true;
    region?: true;
    logoUrl?: true;
    createdAt?: true;
};
export type TeamCountAggregateInputType = {
    id?: true;
    name?: true;
    game?: true;
    region?: true;
    logoUrl?: true;
    createdAt?: true;
    _all?: true;
};
export type TeamAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which Team to aggregate.
     */
    where?: Prisma.TeamWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Teams to fetch.
     */
    orderBy?: Prisma.TeamOrderByWithRelationInput | Prisma.TeamOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.TeamWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Teams from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Teams.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Teams
    **/
    _count?: true | TeamCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: TeamMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: TeamMaxAggregateInputType;
};
export type GetTeamAggregateType<T extends TeamAggregateArgs> = {
    [P in keyof T & keyof AggregateTeam]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateTeam[P]> : Prisma.GetScalarType<T[P], AggregateTeam[P]>;
};
export type TeamGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TeamWhereInput;
    orderBy?: Prisma.TeamOrderByWithAggregationInput | Prisma.TeamOrderByWithAggregationInput[];
    by: Prisma.TeamScalarFieldEnum[] | Prisma.TeamScalarFieldEnum;
    having?: Prisma.TeamScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: TeamCountAggregateInputType | true;
    _min?: TeamMinAggregateInputType;
    _max?: TeamMaxAggregateInputType;
};
export type TeamGroupByOutputType = {
    id: string;
    name: string;
    game: string;
    region: string | null;
    logoUrl: string | null;
    createdAt: Date;
    _count: TeamCountAggregateOutputType | null;
    _min: TeamMinAggregateOutputType | null;
    _max: TeamMaxAggregateOutputType | null;
};
type GetTeamGroupByPayload<T extends TeamGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<TeamGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof TeamGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], TeamGroupByOutputType[P]> : Prisma.GetScalarType<T[P], TeamGroupByOutputType[P]>;
}>>;
export type TeamWhereInput = {
    AND?: Prisma.TeamWhereInput | Prisma.TeamWhereInput[];
    OR?: Prisma.TeamWhereInput[];
    NOT?: Prisma.TeamWhereInput | Prisma.TeamWhereInput[];
    id?: Prisma.StringFilter<"Team"> | string;
    name?: Prisma.StringFilter<"Team"> | string;
    game?: Prisma.StringFilter<"Team"> | string;
    region?: Prisma.StringNullableFilter<"Team"> | string | null;
    logoUrl?: Prisma.StringNullableFilter<"Team"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"Team"> | Date | string;
    assets?: Prisma.AssetListRelationFilter;
    matchesA?: Prisma.MatchListRelationFilter;
    matchesB?: Prisma.MatchListRelationFilter;
};
export type TeamOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    game?: Prisma.SortOrder;
    region?: Prisma.SortOrderInput | Prisma.SortOrder;
    logoUrl?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    assets?: Prisma.AssetOrderByRelationAggregateInput;
    matchesA?: Prisma.MatchOrderByRelationAggregateInput;
    matchesB?: Prisma.MatchOrderByRelationAggregateInput;
};
export type TeamWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.TeamWhereInput | Prisma.TeamWhereInput[];
    OR?: Prisma.TeamWhereInput[];
    NOT?: Prisma.TeamWhereInput | Prisma.TeamWhereInput[];
    name?: Prisma.StringFilter<"Team"> | string;
    game?: Prisma.StringFilter<"Team"> | string;
    region?: Prisma.StringNullableFilter<"Team"> | string | null;
    logoUrl?: Prisma.StringNullableFilter<"Team"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"Team"> | Date | string;
    assets?: Prisma.AssetListRelationFilter;
    matchesA?: Prisma.MatchListRelationFilter;
    matchesB?: Prisma.MatchListRelationFilter;
}, "id">;
export type TeamOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    game?: Prisma.SortOrder;
    region?: Prisma.SortOrderInput | Prisma.SortOrder;
    logoUrl?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    _count?: Prisma.TeamCountOrderByAggregateInput;
    _max?: Prisma.TeamMaxOrderByAggregateInput;
    _min?: Prisma.TeamMinOrderByAggregateInput;
};
export type TeamScalarWhereWithAggregatesInput = {
    AND?: Prisma.TeamScalarWhereWithAggregatesInput | Prisma.TeamScalarWhereWithAggregatesInput[];
    OR?: Prisma.TeamScalarWhereWithAggregatesInput[];
    NOT?: Prisma.TeamScalarWhereWithAggregatesInput | Prisma.TeamScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"Team"> | string;
    name?: Prisma.StringWithAggregatesFilter<"Team"> | string;
    game?: Prisma.StringWithAggregatesFilter<"Team"> | string;
    region?: Prisma.StringNullableWithAggregatesFilter<"Team"> | string | null;
    logoUrl?: Prisma.StringNullableWithAggregatesFilter<"Team"> | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Team"> | Date | string;
};
export type TeamCreateInput = {
    id?: string;
    name: string;
    game: string;
    region?: string | null;
    logoUrl?: string | null;
    createdAt?: Date | string;
    assets?: Prisma.AssetCreateNestedManyWithoutTeamInput;
    matchesA?: Prisma.MatchCreateNestedManyWithoutTeamAInput;
    matchesB?: Prisma.MatchCreateNestedManyWithoutTeamBInput;
};
export type TeamUncheckedCreateInput = {
    id?: string;
    name: string;
    game: string;
    region?: string | null;
    logoUrl?: string | null;
    createdAt?: Date | string;
    assets?: Prisma.AssetUncheckedCreateNestedManyWithoutTeamInput;
    matchesA?: Prisma.MatchUncheckedCreateNestedManyWithoutTeamAInput;
    matchesB?: Prisma.MatchUncheckedCreateNestedManyWithoutTeamBInput;
};
export type TeamUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    game?: Prisma.StringFieldUpdateOperationsInput | string;
    region?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    logoUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    assets?: Prisma.AssetUpdateManyWithoutTeamNestedInput;
    matchesA?: Prisma.MatchUpdateManyWithoutTeamANestedInput;
    matchesB?: Prisma.MatchUpdateManyWithoutTeamBNestedInput;
};
export type TeamUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    game?: Prisma.StringFieldUpdateOperationsInput | string;
    region?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    logoUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    assets?: Prisma.AssetUncheckedUpdateManyWithoutTeamNestedInput;
    matchesA?: Prisma.MatchUncheckedUpdateManyWithoutTeamANestedInput;
    matchesB?: Prisma.MatchUncheckedUpdateManyWithoutTeamBNestedInput;
};
export type TeamCreateManyInput = {
    id?: string;
    name: string;
    game: string;
    region?: string | null;
    logoUrl?: string | null;
    createdAt?: Date | string;
};
export type TeamUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    game?: Prisma.StringFieldUpdateOperationsInput | string;
    region?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    logoUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TeamUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    game?: Prisma.StringFieldUpdateOperationsInput | string;
    region?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    logoUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TeamCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    game?: Prisma.SortOrder;
    region?: Prisma.SortOrder;
    logoUrl?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type TeamMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    game?: Prisma.SortOrder;
    region?: Prisma.SortOrder;
    logoUrl?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type TeamMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    game?: Prisma.SortOrder;
    region?: Prisma.SortOrder;
    logoUrl?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type TeamNullableScalarRelationFilter = {
    is?: Prisma.TeamWhereInput | null;
    isNot?: Prisma.TeamWhereInput | null;
};
export type TeamScalarRelationFilter = {
    is?: Prisma.TeamWhereInput;
    isNot?: Prisma.TeamWhereInput;
};
export type TeamCreateNestedOneWithoutAssetsInput = {
    create?: Prisma.XOR<Prisma.TeamCreateWithoutAssetsInput, Prisma.TeamUncheckedCreateWithoutAssetsInput>;
    connectOrCreate?: Prisma.TeamCreateOrConnectWithoutAssetsInput;
    connect?: Prisma.TeamWhereUniqueInput;
};
export type TeamUpdateOneWithoutAssetsNestedInput = {
    create?: Prisma.XOR<Prisma.TeamCreateWithoutAssetsInput, Prisma.TeamUncheckedCreateWithoutAssetsInput>;
    connectOrCreate?: Prisma.TeamCreateOrConnectWithoutAssetsInput;
    upsert?: Prisma.TeamUpsertWithoutAssetsInput;
    disconnect?: Prisma.TeamWhereInput | boolean;
    delete?: Prisma.TeamWhereInput | boolean;
    connect?: Prisma.TeamWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.TeamUpdateToOneWithWhereWithoutAssetsInput, Prisma.TeamUpdateWithoutAssetsInput>, Prisma.TeamUncheckedUpdateWithoutAssetsInput>;
};
export type TeamCreateNestedOneWithoutMatchesAInput = {
    create?: Prisma.XOR<Prisma.TeamCreateWithoutMatchesAInput, Prisma.TeamUncheckedCreateWithoutMatchesAInput>;
    connectOrCreate?: Prisma.TeamCreateOrConnectWithoutMatchesAInput;
    connect?: Prisma.TeamWhereUniqueInput;
};
export type TeamCreateNestedOneWithoutMatchesBInput = {
    create?: Prisma.XOR<Prisma.TeamCreateWithoutMatchesBInput, Prisma.TeamUncheckedCreateWithoutMatchesBInput>;
    connectOrCreate?: Prisma.TeamCreateOrConnectWithoutMatchesBInput;
    connect?: Prisma.TeamWhereUniqueInput;
};
export type TeamUpdateOneRequiredWithoutMatchesANestedInput = {
    create?: Prisma.XOR<Prisma.TeamCreateWithoutMatchesAInput, Prisma.TeamUncheckedCreateWithoutMatchesAInput>;
    connectOrCreate?: Prisma.TeamCreateOrConnectWithoutMatchesAInput;
    upsert?: Prisma.TeamUpsertWithoutMatchesAInput;
    connect?: Prisma.TeamWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.TeamUpdateToOneWithWhereWithoutMatchesAInput, Prisma.TeamUpdateWithoutMatchesAInput>, Prisma.TeamUncheckedUpdateWithoutMatchesAInput>;
};
export type TeamUpdateOneRequiredWithoutMatchesBNestedInput = {
    create?: Prisma.XOR<Prisma.TeamCreateWithoutMatchesBInput, Prisma.TeamUncheckedCreateWithoutMatchesBInput>;
    connectOrCreate?: Prisma.TeamCreateOrConnectWithoutMatchesBInput;
    upsert?: Prisma.TeamUpsertWithoutMatchesBInput;
    connect?: Prisma.TeamWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.TeamUpdateToOneWithWhereWithoutMatchesBInput, Prisma.TeamUpdateWithoutMatchesBInput>, Prisma.TeamUncheckedUpdateWithoutMatchesBInput>;
};
export type TeamCreateWithoutAssetsInput = {
    id?: string;
    name: string;
    game: string;
    region?: string | null;
    logoUrl?: string | null;
    createdAt?: Date | string;
    matchesA?: Prisma.MatchCreateNestedManyWithoutTeamAInput;
    matchesB?: Prisma.MatchCreateNestedManyWithoutTeamBInput;
};
export type TeamUncheckedCreateWithoutAssetsInput = {
    id?: string;
    name: string;
    game: string;
    region?: string | null;
    logoUrl?: string | null;
    createdAt?: Date | string;
    matchesA?: Prisma.MatchUncheckedCreateNestedManyWithoutTeamAInput;
    matchesB?: Prisma.MatchUncheckedCreateNestedManyWithoutTeamBInput;
};
export type TeamCreateOrConnectWithoutAssetsInput = {
    where: Prisma.TeamWhereUniqueInput;
    create: Prisma.XOR<Prisma.TeamCreateWithoutAssetsInput, Prisma.TeamUncheckedCreateWithoutAssetsInput>;
};
export type TeamUpsertWithoutAssetsInput = {
    update: Prisma.XOR<Prisma.TeamUpdateWithoutAssetsInput, Prisma.TeamUncheckedUpdateWithoutAssetsInput>;
    create: Prisma.XOR<Prisma.TeamCreateWithoutAssetsInput, Prisma.TeamUncheckedCreateWithoutAssetsInput>;
    where?: Prisma.TeamWhereInput;
};
export type TeamUpdateToOneWithWhereWithoutAssetsInput = {
    where?: Prisma.TeamWhereInput;
    data: Prisma.XOR<Prisma.TeamUpdateWithoutAssetsInput, Prisma.TeamUncheckedUpdateWithoutAssetsInput>;
};
export type TeamUpdateWithoutAssetsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    game?: Prisma.StringFieldUpdateOperationsInput | string;
    region?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    logoUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    matchesA?: Prisma.MatchUpdateManyWithoutTeamANestedInput;
    matchesB?: Prisma.MatchUpdateManyWithoutTeamBNestedInput;
};
export type TeamUncheckedUpdateWithoutAssetsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    game?: Prisma.StringFieldUpdateOperationsInput | string;
    region?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    logoUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    matchesA?: Prisma.MatchUncheckedUpdateManyWithoutTeamANestedInput;
    matchesB?: Prisma.MatchUncheckedUpdateManyWithoutTeamBNestedInput;
};
export type TeamCreateWithoutMatchesAInput = {
    id?: string;
    name: string;
    game: string;
    region?: string | null;
    logoUrl?: string | null;
    createdAt?: Date | string;
    assets?: Prisma.AssetCreateNestedManyWithoutTeamInput;
    matchesB?: Prisma.MatchCreateNestedManyWithoutTeamBInput;
};
export type TeamUncheckedCreateWithoutMatchesAInput = {
    id?: string;
    name: string;
    game: string;
    region?: string | null;
    logoUrl?: string | null;
    createdAt?: Date | string;
    assets?: Prisma.AssetUncheckedCreateNestedManyWithoutTeamInput;
    matchesB?: Prisma.MatchUncheckedCreateNestedManyWithoutTeamBInput;
};
export type TeamCreateOrConnectWithoutMatchesAInput = {
    where: Prisma.TeamWhereUniqueInput;
    create: Prisma.XOR<Prisma.TeamCreateWithoutMatchesAInput, Prisma.TeamUncheckedCreateWithoutMatchesAInput>;
};
export type TeamCreateWithoutMatchesBInput = {
    id?: string;
    name: string;
    game: string;
    region?: string | null;
    logoUrl?: string | null;
    createdAt?: Date | string;
    assets?: Prisma.AssetCreateNestedManyWithoutTeamInput;
    matchesA?: Prisma.MatchCreateNestedManyWithoutTeamAInput;
};
export type TeamUncheckedCreateWithoutMatchesBInput = {
    id?: string;
    name: string;
    game: string;
    region?: string | null;
    logoUrl?: string | null;
    createdAt?: Date | string;
    assets?: Prisma.AssetUncheckedCreateNestedManyWithoutTeamInput;
    matchesA?: Prisma.MatchUncheckedCreateNestedManyWithoutTeamAInput;
};
export type TeamCreateOrConnectWithoutMatchesBInput = {
    where: Prisma.TeamWhereUniqueInput;
    create: Prisma.XOR<Prisma.TeamCreateWithoutMatchesBInput, Prisma.TeamUncheckedCreateWithoutMatchesBInput>;
};
export type TeamUpsertWithoutMatchesAInput = {
    update: Prisma.XOR<Prisma.TeamUpdateWithoutMatchesAInput, Prisma.TeamUncheckedUpdateWithoutMatchesAInput>;
    create: Prisma.XOR<Prisma.TeamCreateWithoutMatchesAInput, Prisma.TeamUncheckedCreateWithoutMatchesAInput>;
    where?: Prisma.TeamWhereInput;
};
export type TeamUpdateToOneWithWhereWithoutMatchesAInput = {
    where?: Prisma.TeamWhereInput;
    data: Prisma.XOR<Prisma.TeamUpdateWithoutMatchesAInput, Prisma.TeamUncheckedUpdateWithoutMatchesAInput>;
};
export type TeamUpdateWithoutMatchesAInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    game?: Prisma.StringFieldUpdateOperationsInput | string;
    region?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    logoUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    assets?: Prisma.AssetUpdateManyWithoutTeamNestedInput;
    matchesB?: Prisma.MatchUpdateManyWithoutTeamBNestedInput;
};
export type TeamUncheckedUpdateWithoutMatchesAInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    game?: Prisma.StringFieldUpdateOperationsInput | string;
    region?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    logoUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    assets?: Prisma.AssetUncheckedUpdateManyWithoutTeamNestedInput;
    matchesB?: Prisma.MatchUncheckedUpdateManyWithoutTeamBNestedInput;
};
export type TeamUpsertWithoutMatchesBInput = {
    update: Prisma.XOR<Prisma.TeamUpdateWithoutMatchesBInput, Prisma.TeamUncheckedUpdateWithoutMatchesBInput>;
    create: Prisma.XOR<Prisma.TeamCreateWithoutMatchesBInput, Prisma.TeamUncheckedCreateWithoutMatchesBInput>;
    where?: Prisma.TeamWhereInput;
};
export type TeamUpdateToOneWithWhereWithoutMatchesBInput = {
    where?: Prisma.TeamWhereInput;
    data: Prisma.XOR<Prisma.TeamUpdateWithoutMatchesBInput, Prisma.TeamUncheckedUpdateWithoutMatchesBInput>;
};
export type TeamUpdateWithoutMatchesBInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    game?: Prisma.StringFieldUpdateOperationsInput | string;
    region?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    logoUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    assets?: Prisma.AssetUpdateManyWithoutTeamNestedInput;
    matchesA?: Prisma.MatchUpdateManyWithoutTeamANestedInput;
};
export type TeamUncheckedUpdateWithoutMatchesBInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    game?: Prisma.StringFieldUpdateOperationsInput | string;
    region?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    logoUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    assets?: Prisma.AssetUncheckedUpdateManyWithoutTeamNestedInput;
    matchesA?: Prisma.MatchUncheckedUpdateManyWithoutTeamANestedInput;
};
/**
 * Count Type TeamCountOutputType
 */
export type TeamCountOutputType = {
    assets: number;
    matchesA: number;
    matchesB: number;
};
export type TeamCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    assets?: boolean | TeamCountOutputTypeCountAssetsArgs;
    matchesA?: boolean | TeamCountOutputTypeCountMatchesAArgs;
    matchesB?: boolean | TeamCountOutputTypeCountMatchesBArgs;
};
/**
 * TeamCountOutputType without action
 */
export type TeamCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TeamCountOutputType
     */
    select?: Prisma.TeamCountOutputTypeSelect<ExtArgs> | null;
};
/**
 * TeamCountOutputType without action
 */
export type TeamCountOutputTypeCountAssetsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AssetWhereInput;
};
/**
 * TeamCountOutputType without action
 */
export type TeamCountOutputTypeCountMatchesAArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MatchWhereInput;
};
/**
 * TeamCountOutputType without action
 */
export type TeamCountOutputTypeCountMatchesBArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MatchWhereInput;
};
export type TeamSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    game?: boolean;
    region?: boolean;
    logoUrl?: boolean;
    createdAt?: boolean;
    assets?: boolean | Prisma.Team$assetsArgs<ExtArgs>;
    matchesA?: boolean | Prisma.Team$matchesAArgs<ExtArgs>;
    matchesB?: boolean | Prisma.Team$matchesBArgs<ExtArgs>;
    _count?: boolean | Prisma.TeamCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["team"]>;
export type TeamSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    game?: boolean;
    region?: boolean;
    logoUrl?: boolean;
    createdAt?: boolean;
}, ExtArgs["result"]["team"]>;
export type TeamSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    game?: boolean;
    region?: boolean;
    logoUrl?: boolean;
    createdAt?: boolean;
}, ExtArgs["result"]["team"]>;
export type TeamSelectScalar = {
    id?: boolean;
    name?: boolean;
    game?: boolean;
    region?: boolean;
    logoUrl?: boolean;
    createdAt?: boolean;
};
export type TeamOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "name" | "game" | "region" | "logoUrl" | "createdAt", ExtArgs["result"]["team"]>;
export type TeamInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    assets?: boolean | Prisma.Team$assetsArgs<ExtArgs>;
    matchesA?: boolean | Prisma.Team$matchesAArgs<ExtArgs>;
    matchesB?: boolean | Prisma.Team$matchesBArgs<ExtArgs>;
    _count?: boolean | Prisma.TeamCountOutputTypeDefaultArgs<ExtArgs>;
};
export type TeamIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type TeamIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $TeamPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Team";
    objects: {
        assets: Prisma.$AssetPayload<ExtArgs>[];
        matchesA: Prisma.$MatchPayload<ExtArgs>[];
        matchesB: Prisma.$MatchPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        name: string;
        game: string;
        region: string | null;
        logoUrl: string | null;
        createdAt: Date;
    }, ExtArgs["result"]["team"]>;
    composites: {};
};
export type TeamGetPayload<S extends boolean | null | undefined | TeamDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$TeamPayload, S>;
export type TeamCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<TeamFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: TeamCountAggregateInputType | true;
};
export interface TeamDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Team'];
        meta: {
            name: 'Team';
        };
    };
    /**
     * Find zero or one Team that matches the filter.
     * @param {TeamFindUniqueArgs} args - Arguments to find a Team
     * @example
     * // Get one Team
     * const team = await prisma.team.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TeamFindUniqueArgs>(args: Prisma.SelectSubset<T, TeamFindUniqueArgs<ExtArgs>>): Prisma.Prisma__TeamClient<runtime.Types.Result.GetResult<Prisma.$TeamPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one Team that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TeamFindUniqueOrThrowArgs} args - Arguments to find a Team
     * @example
     * // Get one Team
     * const team = await prisma.team.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TeamFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, TeamFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__TeamClient<runtime.Types.Result.GetResult<Prisma.$TeamPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first Team that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TeamFindFirstArgs} args - Arguments to find a Team
     * @example
     * // Get one Team
     * const team = await prisma.team.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TeamFindFirstArgs>(args?: Prisma.SelectSubset<T, TeamFindFirstArgs<ExtArgs>>): Prisma.Prisma__TeamClient<runtime.Types.Result.GetResult<Prisma.$TeamPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first Team that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TeamFindFirstOrThrowArgs} args - Arguments to find a Team
     * @example
     * // Get one Team
     * const team = await prisma.team.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TeamFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, TeamFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__TeamClient<runtime.Types.Result.GetResult<Prisma.$TeamPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more Teams that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TeamFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Teams
     * const teams = await prisma.team.findMany()
     *
     * // Get first 10 Teams
     * const teams = await prisma.team.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const teamWithIdOnly = await prisma.team.findMany({ select: { id: true } })
     *
     */
    findMany<T extends TeamFindManyArgs>(args?: Prisma.SelectSubset<T, TeamFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TeamPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a Team.
     * @param {TeamCreateArgs} args - Arguments to create a Team.
     * @example
     * // Create one Team
     * const Team = await prisma.team.create({
     *   data: {
     *     // ... data to create a Team
     *   }
     * })
     *
     */
    create<T extends TeamCreateArgs>(args: Prisma.SelectSubset<T, TeamCreateArgs<ExtArgs>>): Prisma.Prisma__TeamClient<runtime.Types.Result.GetResult<Prisma.$TeamPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many Teams.
     * @param {TeamCreateManyArgs} args - Arguments to create many Teams.
     * @example
     * // Create many Teams
     * const team = await prisma.team.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends TeamCreateManyArgs>(args?: Prisma.SelectSubset<T, TeamCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many Teams and returns the data saved in the database.
     * @param {TeamCreateManyAndReturnArgs} args - Arguments to create many Teams.
     * @example
     * // Create many Teams
     * const team = await prisma.team.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Teams and only return the `id`
     * const teamWithIdOnly = await prisma.team.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends TeamCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, TeamCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TeamPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a Team.
     * @param {TeamDeleteArgs} args - Arguments to delete one Team.
     * @example
     * // Delete one Team
     * const Team = await prisma.team.delete({
     *   where: {
     *     // ... filter to delete one Team
     *   }
     * })
     *
     */
    delete<T extends TeamDeleteArgs>(args: Prisma.SelectSubset<T, TeamDeleteArgs<ExtArgs>>): Prisma.Prisma__TeamClient<runtime.Types.Result.GetResult<Prisma.$TeamPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one Team.
     * @param {TeamUpdateArgs} args - Arguments to update one Team.
     * @example
     * // Update one Team
     * const team = await prisma.team.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends TeamUpdateArgs>(args: Prisma.SelectSubset<T, TeamUpdateArgs<ExtArgs>>): Prisma.Prisma__TeamClient<runtime.Types.Result.GetResult<Prisma.$TeamPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more Teams.
     * @param {TeamDeleteManyArgs} args - Arguments to filter Teams to delete.
     * @example
     * // Delete a few Teams
     * const { count } = await prisma.team.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends TeamDeleteManyArgs>(args?: Prisma.SelectSubset<T, TeamDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more Teams.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TeamUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Teams
     * const team = await prisma.team.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends TeamUpdateManyArgs>(args: Prisma.SelectSubset<T, TeamUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more Teams and returns the data updated in the database.
     * @param {TeamUpdateManyAndReturnArgs} args - Arguments to update many Teams.
     * @example
     * // Update many Teams
     * const team = await prisma.team.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more Teams and only return the `id`
     * const teamWithIdOnly = await prisma.team.updateManyAndReturn({
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
    updateManyAndReturn<T extends TeamUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, TeamUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TeamPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one Team.
     * @param {TeamUpsertArgs} args - Arguments to update or create a Team.
     * @example
     * // Update or create a Team
     * const team = await prisma.team.upsert({
     *   create: {
     *     // ... data to create a Team
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Team we want to update
     *   }
     * })
     */
    upsert<T extends TeamUpsertArgs>(args: Prisma.SelectSubset<T, TeamUpsertArgs<ExtArgs>>): Prisma.Prisma__TeamClient<runtime.Types.Result.GetResult<Prisma.$TeamPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of Teams.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TeamCountArgs} args - Arguments to filter Teams to count.
     * @example
     * // Count the number of Teams
     * const count = await prisma.team.count({
     *   where: {
     *     // ... the filter for the Teams we want to count
     *   }
     * })
    **/
    count<T extends TeamCountArgs>(args?: Prisma.Subset<T, TeamCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], TeamCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a Team.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TeamAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends TeamAggregateArgs>(args: Prisma.Subset<T, TeamAggregateArgs>): Prisma.PrismaPromise<GetTeamAggregateType<T>>;
    /**
     * Group by Team.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TeamGroupByArgs} args - Group by arguments.
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
    groupBy<T extends TeamGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: TeamGroupByArgs['orderBy'];
    } : {
        orderBy?: TeamGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, TeamGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTeamGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the Team model
     */
    readonly fields: TeamFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for Team.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__TeamClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    assets<T extends Prisma.Team$assetsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Team$assetsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    matchesA<T extends Prisma.Team$matchesAArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Team$matchesAArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MatchPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    matchesB<T extends Prisma.Team$matchesBArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Team$matchesBArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MatchPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
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
 * Fields of the Team model
 */
export interface TeamFieldRefs {
    readonly id: Prisma.FieldRef<"Team", 'String'>;
    readonly name: Prisma.FieldRef<"Team", 'String'>;
    readonly game: Prisma.FieldRef<"Team", 'String'>;
    readonly region: Prisma.FieldRef<"Team", 'String'>;
    readonly logoUrl: Prisma.FieldRef<"Team", 'String'>;
    readonly createdAt: Prisma.FieldRef<"Team", 'DateTime'>;
}
/**
 * Team findUnique
 */
export type TeamFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which Team to fetch.
     */
    where: Prisma.TeamWhereUniqueInput;
};
/**
 * Team findUniqueOrThrow
 */
export type TeamFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which Team to fetch.
     */
    where: Prisma.TeamWhereUniqueInput;
};
/**
 * Team findFirst
 */
export type TeamFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which Team to fetch.
     */
    where?: Prisma.TeamWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Teams to fetch.
     */
    orderBy?: Prisma.TeamOrderByWithRelationInput | Prisma.TeamOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Teams.
     */
    cursor?: Prisma.TeamWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Teams from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Teams.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Teams.
     */
    distinct?: Prisma.TeamScalarFieldEnum | Prisma.TeamScalarFieldEnum[];
};
/**
 * Team findFirstOrThrow
 */
export type TeamFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which Team to fetch.
     */
    where?: Prisma.TeamWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Teams to fetch.
     */
    orderBy?: Prisma.TeamOrderByWithRelationInput | Prisma.TeamOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Teams.
     */
    cursor?: Prisma.TeamWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Teams from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Teams.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Teams.
     */
    distinct?: Prisma.TeamScalarFieldEnum | Prisma.TeamScalarFieldEnum[];
};
/**
 * Team findMany
 */
export type TeamFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which Teams to fetch.
     */
    where?: Prisma.TeamWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Teams to fetch.
     */
    orderBy?: Prisma.TeamOrderByWithRelationInput | Prisma.TeamOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Teams.
     */
    cursor?: Prisma.TeamWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Teams from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Teams.
     */
    skip?: number;
    distinct?: Prisma.TeamScalarFieldEnum | Prisma.TeamScalarFieldEnum[];
};
/**
 * Team create
 */
export type TeamCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * The data needed to create a Team.
     */
    data: Prisma.XOR<Prisma.TeamCreateInput, Prisma.TeamUncheckedCreateInput>;
};
/**
 * Team createMany
 */
export type TeamCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many Teams.
     */
    data: Prisma.TeamCreateManyInput | Prisma.TeamCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * Team createManyAndReturn
 */
export type TeamCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Team
     */
    select?: Prisma.TeamSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Team
     */
    omit?: Prisma.TeamOmit<ExtArgs> | null;
    /**
     * The data used to create many Teams.
     */
    data: Prisma.TeamCreateManyInput | Prisma.TeamCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * Team update
 */
export type TeamUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * The data needed to update a Team.
     */
    data: Prisma.XOR<Prisma.TeamUpdateInput, Prisma.TeamUncheckedUpdateInput>;
    /**
     * Choose, which Team to update.
     */
    where: Prisma.TeamWhereUniqueInput;
};
/**
 * Team updateMany
 */
export type TeamUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update Teams.
     */
    data: Prisma.XOR<Prisma.TeamUpdateManyMutationInput, Prisma.TeamUncheckedUpdateManyInput>;
    /**
     * Filter which Teams to update
     */
    where?: Prisma.TeamWhereInput;
    /**
     * Limit how many Teams to update.
     */
    limit?: number;
};
/**
 * Team updateManyAndReturn
 */
export type TeamUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Team
     */
    select?: Prisma.TeamSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Team
     */
    omit?: Prisma.TeamOmit<ExtArgs> | null;
    /**
     * The data used to update Teams.
     */
    data: Prisma.XOR<Prisma.TeamUpdateManyMutationInput, Prisma.TeamUncheckedUpdateManyInput>;
    /**
     * Filter which Teams to update
     */
    where?: Prisma.TeamWhereInput;
    /**
     * Limit how many Teams to update.
     */
    limit?: number;
};
/**
 * Team upsert
 */
export type TeamUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * The filter to search for the Team to update in case it exists.
     */
    where: Prisma.TeamWhereUniqueInput;
    /**
     * In case the Team found by the `where` argument doesn't exist, create a new Team with this data.
     */
    create: Prisma.XOR<Prisma.TeamCreateInput, Prisma.TeamUncheckedCreateInput>;
    /**
     * In case the Team was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.TeamUpdateInput, Prisma.TeamUncheckedUpdateInput>;
};
/**
 * Team delete
 */
export type TeamDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter which Team to delete.
     */
    where: Prisma.TeamWhereUniqueInput;
};
/**
 * Team deleteMany
 */
export type TeamDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which Teams to delete
     */
    where?: Prisma.TeamWhereInput;
    /**
     * Limit how many Teams to delete.
     */
    limit?: number;
};
/**
 * Team.assets
 */
export type Team$assetsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    where?: Prisma.AssetWhereInput;
    orderBy?: Prisma.AssetOrderByWithRelationInput | Prisma.AssetOrderByWithRelationInput[];
    cursor?: Prisma.AssetWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.AssetScalarFieldEnum | Prisma.AssetScalarFieldEnum[];
};
/**
 * Team.matchesA
 */
export type Team$matchesAArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    where?: Prisma.MatchWhereInput;
    orderBy?: Prisma.MatchOrderByWithRelationInput | Prisma.MatchOrderByWithRelationInput[];
    cursor?: Prisma.MatchWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.MatchScalarFieldEnum | Prisma.MatchScalarFieldEnum[];
};
/**
 * Team.matchesB
 */
export type Team$matchesBArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    where?: Prisma.MatchWhereInput;
    orderBy?: Prisma.MatchOrderByWithRelationInput | Prisma.MatchOrderByWithRelationInput[];
    cursor?: Prisma.MatchWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.MatchScalarFieldEnum | Prisma.MatchScalarFieldEnum[];
};
/**
 * Team without action
 */
export type TeamDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
};
export {};
//# sourceMappingURL=Team.d.ts.map