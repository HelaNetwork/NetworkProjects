import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model ListingDraft
 *
 */
export type ListingDraftModel = runtime.Types.Result.DefaultSelection<Prisma.$ListingDraftPayload>;
export type AggregateListingDraft = {
    _count: ListingDraftCountAggregateOutputType | null;
    _avg: ListingDraftAvgAggregateOutputType | null;
    _sum: ListingDraftSumAggregateOutputType | null;
    _min: ListingDraftMinAggregateOutputType | null;
    _max: ListingDraftMaxAggregateOutputType | null;
};
export type ListingDraftAvgAggregateOutputType = {
    stepCompleted: number | null;
};
export type ListingDraftSumAggregateOutputType = {
    stepCompleted: number | null;
};
export type ListingDraftMinAggregateOutputType = {
    id: string | null;
    userWallet: string | null;
    stepCompleted: number | null;
    submittedAt: Date | null;
    propertyId: string | null;
};
export type ListingDraftMaxAggregateOutputType = {
    id: string | null;
    userWallet: string | null;
    stepCompleted: number | null;
    submittedAt: Date | null;
    propertyId: string | null;
};
export type ListingDraftCountAggregateOutputType = {
    id: number;
    userWallet: number;
    stepCompleted: number;
    step1Data: number;
    step2Data: number;
    step3Data: number;
    step4Data: number;
    submittedAt: number;
    propertyId: number;
    _all: number;
};
export type ListingDraftAvgAggregateInputType = {
    stepCompleted?: true;
};
export type ListingDraftSumAggregateInputType = {
    stepCompleted?: true;
};
export type ListingDraftMinAggregateInputType = {
    id?: true;
    userWallet?: true;
    stepCompleted?: true;
    submittedAt?: true;
    propertyId?: true;
};
export type ListingDraftMaxAggregateInputType = {
    id?: true;
    userWallet?: true;
    stepCompleted?: true;
    submittedAt?: true;
    propertyId?: true;
};
export type ListingDraftCountAggregateInputType = {
    id?: true;
    userWallet?: true;
    stepCompleted?: true;
    step1Data?: true;
    step2Data?: true;
    step3Data?: true;
    step4Data?: true;
    submittedAt?: true;
    propertyId?: true;
    _all?: true;
};
export type ListingDraftAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which ListingDraft to aggregate.
     */
    where?: Prisma.ListingDraftWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ListingDrafts to fetch.
     */
    orderBy?: Prisma.ListingDraftOrderByWithRelationInput | Prisma.ListingDraftOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.ListingDraftWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ListingDrafts from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ListingDrafts.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned ListingDrafts
    **/
    _count?: true | ListingDraftCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: ListingDraftAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: ListingDraftSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: ListingDraftMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: ListingDraftMaxAggregateInputType;
};
export type GetListingDraftAggregateType<T extends ListingDraftAggregateArgs> = {
    [P in keyof T & keyof AggregateListingDraft]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateListingDraft[P]> : Prisma.GetScalarType<T[P], AggregateListingDraft[P]>;
};
export type ListingDraftGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ListingDraftWhereInput;
    orderBy?: Prisma.ListingDraftOrderByWithAggregationInput | Prisma.ListingDraftOrderByWithAggregationInput[];
    by: Prisma.ListingDraftScalarFieldEnum[] | Prisma.ListingDraftScalarFieldEnum;
    having?: Prisma.ListingDraftScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ListingDraftCountAggregateInputType | true;
    _avg?: ListingDraftAvgAggregateInputType;
    _sum?: ListingDraftSumAggregateInputType;
    _min?: ListingDraftMinAggregateInputType;
    _max?: ListingDraftMaxAggregateInputType;
};
export type ListingDraftGroupByOutputType = {
    id: string;
    userWallet: string;
    stepCompleted: number;
    step1Data: runtime.JsonValue | null;
    step2Data: runtime.JsonValue | null;
    step3Data: runtime.JsonValue | null;
    step4Data: runtime.JsonValue | null;
    submittedAt: Date | null;
    propertyId: string | null;
    _count: ListingDraftCountAggregateOutputType | null;
    _avg: ListingDraftAvgAggregateOutputType | null;
    _sum: ListingDraftSumAggregateOutputType | null;
    _min: ListingDraftMinAggregateOutputType | null;
    _max: ListingDraftMaxAggregateOutputType | null;
};
type GetListingDraftGroupByPayload<T extends ListingDraftGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ListingDraftGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ListingDraftGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ListingDraftGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ListingDraftGroupByOutputType[P]>;
}>>;
export type ListingDraftWhereInput = {
    AND?: Prisma.ListingDraftWhereInput | Prisma.ListingDraftWhereInput[];
    OR?: Prisma.ListingDraftWhereInput[];
    NOT?: Prisma.ListingDraftWhereInput | Prisma.ListingDraftWhereInput[];
    id?: Prisma.StringFilter<"ListingDraft"> | string;
    userWallet?: Prisma.StringFilter<"ListingDraft"> | string;
    stepCompleted?: Prisma.IntFilter<"ListingDraft"> | number;
    step1Data?: Prisma.JsonNullableFilter<"ListingDraft">;
    step2Data?: Prisma.JsonNullableFilter<"ListingDraft">;
    step3Data?: Prisma.JsonNullableFilter<"ListingDraft">;
    step4Data?: Prisma.JsonNullableFilter<"ListingDraft">;
    submittedAt?: Prisma.DateTimeNullableFilter<"ListingDraft"> | Date | string | null;
    propertyId?: Prisma.StringNullableFilter<"ListingDraft"> | string | null;
    property?: Prisma.XOR<Prisma.PropertyNullableScalarRelationFilter, Prisma.PropertyWhereInput> | null;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
};
export type ListingDraftOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    userWallet?: Prisma.SortOrder;
    stepCompleted?: Prisma.SortOrder;
    step1Data?: Prisma.SortOrderInput | Prisma.SortOrder;
    step2Data?: Prisma.SortOrderInput | Prisma.SortOrder;
    step3Data?: Prisma.SortOrderInput | Prisma.SortOrder;
    step4Data?: Prisma.SortOrderInput | Prisma.SortOrder;
    submittedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    propertyId?: Prisma.SortOrderInput | Prisma.SortOrder;
    property?: Prisma.PropertyOrderByWithRelationInput;
    user?: Prisma.UserOrderByWithRelationInput;
};
export type ListingDraftWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.ListingDraftWhereInput | Prisma.ListingDraftWhereInput[];
    OR?: Prisma.ListingDraftWhereInput[];
    NOT?: Prisma.ListingDraftWhereInput | Prisma.ListingDraftWhereInput[];
    userWallet?: Prisma.StringFilter<"ListingDraft"> | string;
    stepCompleted?: Prisma.IntFilter<"ListingDraft"> | number;
    step1Data?: Prisma.JsonNullableFilter<"ListingDraft">;
    step2Data?: Prisma.JsonNullableFilter<"ListingDraft">;
    step3Data?: Prisma.JsonNullableFilter<"ListingDraft">;
    step4Data?: Prisma.JsonNullableFilter<"ListingDraft">;
    submittedAt?: Prisma.DateTimeNullableFilter<"ListingDraft"> | Date | string | null;
    propertyId?: Prisma.StringNullableFilter<"ListingDraft"> | string | null;
    property?: Prisma.XOR<Prisma.PropertyNullableScalarRelationFilter, Prisma.PropertyWhereInput> | null;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
}, "id">;
export type ListingDraftOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    userWallet?: Prisma.SortOrder;
    stepCompleted?: Prisma.SortOrder;
    step1Data?: Prisma.SortOrderInput | Prisma.SortOrder;
    step2Data?: Prisma.SortOrderInput | Prisma.SortOrder;
    step3Data?: Prisma.SortOrderInput | Prisma.SortOrder;
    step4Data?: Prisma.SortOrderInput | Prisma.SortOrder;
    submittedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    propertyId?: Prisma.SortOrderInput | Prisma.SortOrder;
    _count?: Prisma.ListingDraftCountOrderByAggregateInput;
    _avg?: Prisma.ListingDraftAvgOrderByAggregateInput;
    _max?: Prisma.ListingDraftMaxOrderByAggregateInput;
    _min?: Prisma.ListingDraftMinOrderByAggregateInput;
    _sum?: Prisma.ListingDraftSumOrderByAggregateInput;
};
export type ListingDraftScalarWhereWithAggregatesInput = {
    AND?: Prisma.ListingDraftScalarWhereWithAggregatesInput | Prisma.ListingDraftScalarWhereWithAggregatesInput[];
    OR?: Prisma.ListingDraftScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ListingDraftScalarWhereWithAggregatesInput | Prisma.ListingDraftScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"ListingDraft"> | string;
    userWallet?: Prisma.StringWithAggregatesFilter<"ListingDraft"> | string;
    stepCompleted?: Prisma.IntWithAggregatesFilter<"ListingDraft"> | number;
    step1Data?: Prisma.JsonNullableWithAggregatesFilter<"ListingDraft">;
    step2Data?: Prisma.JsonNullableWithAggregatesFilter<"ListingDraft">;
    step3Data?: Prisma.JsonNullableWithAggregatesFilter<"ListingDraft">;
    step4Data?: Prisma.JsonNullableWithAggregatesFilter<"ListingDraft">;
    submittedAt?: Prisma.DateTimeNullableWithAggregatesFilter<"ListingDraft"> | Date | string | null;
    propertyId?: Prisma.StringNullableWithAggregatesFilter<"ListingDraft"> | string | null;
};
export type ListingDraftCreateInput = {
    id?: string;
    stepCompleted: number;
    step1Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    step2Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    step3Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    step4Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    submittedAt?: Date | string | null;
    property?: Prisma.PropertyCreateNestedOneWithoutListingDraftsInput;
    user: Prisma.UserCreateNestedOneWithoutListingDraftsInput;
};
export type ListingDraftUncheckedCreateInput = {
    id?: string;
    userWallet: string;
    stepCompleted: number;
    step1Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    step2Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    step3Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    step4Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    submittedAt?: Date | string | null;
    propertyId?: string | null;
};
export type ListingDraftUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    stepCompleted?: Prisma.IntFieldUpdateOperationsInput | number;
    step1Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    step2Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    step3Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    step4Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    submittedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    property?: Prisma.PropertyUpdateOneWithoutListingDraftsNestedInput;
    user?: Prisma.UserUpdateOneRequiredWithoutListingDraftsNestedInput;
};
export type ListingDraftUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userWallet?: Prisma.StringFieldUpdateOperationsInput | string;
    stepCompleted?: Prisma.IntFieldUpdateOperationsInput | number;
    step1Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    step2Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    step3Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    step4Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    submittedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    propertyId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type ListingDraftCreateManyInput = {
    id?: string;
    userWallet: string;
    stepCompleted: number;
    step1Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    step2Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    step3Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    step4Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    submittedAt?: Date | string | null;
    propertyId?: string | null;
};
export type ListingDraftUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    stepCompleted?: Prisma.IntFieldUpdateOperationsInput | number;
    step1Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    step2Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    step3Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    step4Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    submittedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type ListingDraftUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userWallet?: Prisma.StringFieldUpdateOperationsInput | string;
    stepCompleted?: Prisma.IntFieldUpdateOperationsInput | number;
    step1Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    step2Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    step3Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    step4Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    submittedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    propertyId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type ListingDraftListRelationFilter = {
    every?: Prisma.ListingDraftWhereInput;
    some?: Prisma.ListingDraftWhereInput;
    none?: Prisma.ListingDraftWhereInput;
};
export type ListingDraftOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type ListingDraftCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userWallet?: Prisma.SortOrder;
    stepCompleted?: Prisma.SortOrder;
    step1Data?: Prisma.SortOrder;
    step2Data?: Prisma.SortOrder;
    step3Data?: Prisma.SortOrder;
    step4Data?: Prisma.SortOrder;
    submittedAt?: Prisma.SortOrder;
    propertyId?: Prisma.SortOrder;
};
export type ListingDraftAvgOrderByAggregateInput = {
    stepCompleted?: Prisma.SortOrder;
};
export type ListingDraftMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userWallet?: Prisma.SortOrder;
    stepCompleted?: Prisma.SortOrder;
    submittedAt?: Prisma.SortOrder;
    propertyId?: Prisma.SortOrder;
};
export type ListingDraftMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userWallet?: Prisma.SortOrder;
    stepCompleted?: Prisma.SortOrder;
    submittedAt?: Prisma.SortOrder;
    propertyId?: Prisma.SortOrder;
};
export type ListingDraftSumOrderByAggregateInput = {
    stepCompleted?: Prisma.SortOrder;
};
export type ListingDraftCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.ListingDraftCreateWithoutUserInput, Prisma.ListingDraftUncheckedCreateWithoutUserInput> | Prisma.ListingDraftCreateWithoutUserInput[] | Prisma.ListingDraftUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.ListingDraftCreateOrConnectWithoutUserInput | Prisma.ListingDraftCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.ListingDraftCreateManyUserInputEnvelope;
    connect?: Prisma.ListingDraftWhereUniqueInput | Prisma.ListingDraftWhereUniqueInput[];
};
export type ListingDraftUncheckedCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.ListingDraftCreateWithoutUserInput, Prisma.ListingDraftUncheckedCreateWithoutUserInput> | Prisma.ListingDraftCreateWithoutUserInput[] | Prisma.ListingDraftUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.ListingDraftCreateOrConnectWithoutUserInput | Prisma.ListingDraftCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.ListingDraftCreateManyUserInputEnvelope;
    connect?: Prisma.ListingDraftWhereUniqueInput | Prisma.ListingDraftWhereUniqueInput[];
};
export type ListingDraftUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.ListingDraftCreateWithoutUserInput, Prisma.ListingDraftUncheckedCreateWithoutUserInput> | Prisma.ListingDraftCreateWithoutUserInput[] | Prisma.ListingDraftUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.ListingDraftCreateOrConnectWithoutUserInput | Prisma.ListingDraftCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.ListingDraftUpsertWithWhereUniqueWithoutUserInput | Prisma.ListingDraftUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.ListingDraftCreateManyUserInputEnvelope;
    set?: Prisma.ListingDraftWhereUniqueInput | Prisma.ListingDraftWhereUniqueInput[];
    disconnect?: Prisma.ListingDraftWhereUniqueInput | Prisma.ListingDraftWhereUniqueInput[];
    delete?: Prisma.ListingDraftWhereUniqueInput | Prisma.ListingDraftWhereUniqueInput[];
    connect?: Prisma.ListingDraftWhereUniqueInput | Prisma.ListingDraftWhereUniqueInput[];
    update?: Prisma.ListingDraftUpdateWithWhereUniqueWithoutUserInput | Prisma.ListingDraftUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.ListingDraftUpdateManyWithWhereWithoutUserInput | Prisma.ListingDraftUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.ListingDraftScalarWhereInput | Prisma.ListingDraftScalarWhereInput[];
};
export type ListingDraftUncheckedUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.ListingDraftCreateWithoutUserInput, Prisma.ListingDraftUncheckedCreateWithoutUserInput> | Prisma.ListingDraftCreateWithoutUserInput[] | Prisma.ListingDraftUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.ListingDraftCreateOrConnectWithoutUserInput | Prisma.ListingDraftCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.ListingDraftUpsertWithWhereUniqueWithoutUserInput | Prisma.ListingDraftUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.ListingDraftCreateManyUserInputEnvelope;
    set?: Prisma.ListingDraftWhereUniqueInput | Prisma.ListingDraftWhereUniqueInput[];
    disconnect?: Prisma.ListingDraftWhereUniqueInput | Prisma.ListingDraftWhereUniqueInput[];
    delete?: Prisma.ListingDraftWhereUniqueInput | Prisma.ListingDraftWhereUniqueInput[];
    connect?: Prisma.ListingDraftWhereUniqueInput | Prisma.ListingDraftWhereUniqueInput[];
    update?: Prisma.ListingDraftUpdateWithWhereUniqueWithoutUserInput | Prisma.ListingDraftUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.ListingDraftUpdateManyWithWhereWithoutUserInput | Prisma.ListingDraftUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.ListingDraftScalarWhereInput | Prisma.ListingDraftScalarWhereInput[];
};
export type ListingDraftCreateNestedManyWithoutPropertyInput = {
    create?: Prisma.XOR<Prisma.ListingDraftCreateWithoutPropertyInput, Prisma.ListingDraftUncheckedCreateWithoutPropertyInput> | Prisma.ListingDraftCreateWithoutPropertyInput[] | Prisma.ListingDraftUncheckedCreateWithoutPropertyInput[];
    connectOrCreate?: Prisma.ListingDraftCreateOrConnectWithoutPropertyInput | Prisma.ListingDraftCreateOrConnectWithoutPropertyInput[];
    createMany?: Prisma.ListingDraftCreateManyPropertyInputEnvelope;
    connect?: Prisma.ListingDraftWhereUniqueInput | Prisma.ListingDraftWhereUniqueInput[];
};
export type ListingDraftUncheckedCreateNestedManyWithoutPropertyInput = {
    create?: Prisma.XOR<Prisma.ListingDraftCreateWithoutPropertyInput, Prisma.ListingDraftUncheckedCreateWithoutPropertyInput> | Prisma.ListingDraftCreateWithoutPropertyInput[] | Prisma.ListingDraftUncheckedCreateWithoutPropertyInput[];
    connectOrCreate?: Prisma.ListingDraftCreateOrConnectWithoutPropertyInput | Prisma.ListingDraftCreateOrConnectWithoutPropertyInput[];
    createMany?: Prisma.ListingDraftCreateManyPropertyInputEnvelope;
    connect?: Prisma.ListingDraftWhereUniqueInput | Prisma.ListingDraftWhereUniqueInput[];
};
export type ListingDraftUpdateManyWithoutPropertyNestedInput = {
    create?: Prisma.XOR<Prisma.ListingDraftCreateWithoutPropertyInput, Prisma.ListingDraftUncheckedCreateWithoutPropertyInput> | Prisma.ListingDraftCreateWithoutPropertyInput[] | Prisma.ListingDraftUncheckedCreateWithoutPropertyInput[];
    connectOrCreate?: Prisma.ListingDraftCreateOrConnectWithoutPropertyInput | Prisma.ListingDraftCreateOrConnectWithoutPropertyInput[];
    upsert?: Prisma.ListingDraftUpsertWithWhereUniqueWithoutPropertyInput | Prisma.ListingDraftUpsertWithWhereUniqueWithoutPropertyInput[];
    createMany?: Prisma.ListingDraftCreateManyPropertyInputEnvelope;
    set?: Prisma.ListingDraftWhereUniqueInput | Prisma.ListingDraftWhereUniqueInput[];
    disconnect?: Prisma.ListingDraftWhereUniqueInput | Prisma.ListingDraftWhereUniqueInput[];
    delete?: Prisma.ListingDraftWhereUniqueInput | Prisma.ListingDraftWhereUniqueInput[];
    connect?: Prisma.ListingDraftWhereUniqueInput | Prisma.ListingDraftWhereUniqueInput[];
    update?: Prisma.ListingDraftUpdateWithWhereUniqueWithoutPropertyInput | Prisma.ListingDraftUpdateWithWhereUniqueWithoutPropertyInput[];
    updateMany?: Prisma.ListingDraftUpdateManyWithWhereWithoutPropertyInput | Prisma.ListingDraftUpdateManyWithWhereWithoutPropertyInput[];
    deleteMany?: Prisma.ListingDraftScalarWhereInput | Prisma.ListingDraftScalarWhereInput[];
};
export type ListingDraftUncheckedUpdateManyWithoutPropertyNestedInput = {
    create?: Prisma.XOR<Prisma.ListingDraftCreateWithoutPropertyInput, Prisma.ListingDraftUncheckedCreateWithoutPropertyInput> | Prisma.ListingDraftCreateWithoutPropertyInput[] | Prisma.ListingDraftUncheckedCreateWithoutPropertyInput[];
    connectOrCreate?: Prisma.ListingDraftCreateOrConnectWithoutPropertyInput | Prisma.ListingDraftCreateOrConnectWithoutPropertyInput[];
    upsert?: Prisma.ListingDraftUpsertWithWhereUniqueWithoutPropertyInput | Prisma.ListingDraftUpsertWithWhereUniqueWithoutPropertyInput[];
    createMany?: Prisma.ListingDraftCreateManyPropertyInputEnvelope;
    set?: Prisma.ListingDraftWhereUniqueInput | Prisma.ListingDraftWhereUniqueInput[];
    disconnect?: Prisma.ListingDraftWhereUniqueInput | Prisma.ListingDraftWhereUniqueInput[];
    delete?: Prisma.ListingDraftWhereUniqueInput | Prisma.ListingDraftWhereUniqueInput[];
    connect?: Prisma.ListingDraftWhereUniqueInput | Prisma.ListingDraftWhereUniqueInput[];
    update?: Prisma.ListingDraftUpdateWithWhereUniqueWithoutPropertyInput | Prisma.ListingDraftUpdateWithWhereUniqueWithoutPropertyInput[];
    updateMany?: Prisma.ListingDraftUpdateManyWithWhereWithoutPropertyInput | Prisma.ListingDraftUpdateManyWithWhereWithoutPropertyInput[];
    deleteMany?: Prisma.ListingDraftScalarWhereInput | Prisma.ListingDraftScalarWhereInput[];
};
export type ListingDraftCreateWithoutUserInput = {
    id?: string;
    stepCompleted: number;
    step1Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    step2Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    step3Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    step4Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    submittedAt?: Date | string | null;
    property?: Prisma.PropertyCreateNestedOneWithoutListingDraftsInput;
};
export type ListingDraftUncheckedCreateWithoutUserInput = {
    id?: string;
    stepCompleted: number;
    step1Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    step2Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    step3Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    step4Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    submittedAt?: Date | string | null;
    propertyId?: string | null;
};
export type ListingDraftCreateOrConnectWithoutUserInput = {
    where: Prisma.ListingDraftWhereUniqueInput;
    create: Prisma.XOR<Prisma.ListingDraftCreateWithoutUserInput, Prisma.ListingDraftUncheckedCreateWithoutUserInput>;
};
export type ListingDraftCreateManyUserInputEnvelope = {
    data: Prisma.ListingDraftCreateManyUserInput | Prisma.ListingDraftCreateManyUserInput[];
    skipDuplicates?: boolean;
};
export type ListingDraftUpsertWithWhereUniqueWithoutUserInput = {
    where: Prisma.ListingDraftWhereUniqueInput;
    update: Prisma.XOR<Prisma.ListingDraftUpdateWithoutUserInput, Prisma.ListingDraftUncheckedUpdateWithoutUserInput>;
    create: Prisma.XOR<Prisma.ListingDraftCreateWithoutUserInput, Prisma.ListingDraftUncheckedCreateWithoutUserInput>;
};
export type ListingDraftUpdateWithWhereUniqueWithoutUserInput = {
    where: Prisma.ListingDraftWhereUniqueInput;
    data: Prisma.XOR<Prisma.ListingDraftUpdateWithoutUserInput, Prisma.ListingDraftUncheckedUpdateWithoutUserInput>;
};
export type ListingDraftUpdateManyWithWhereWithoutUserInput = {
    where: Prisma.ListingDraftScalarWhereInput;
    data: Prisma.XOR<Prisma.ListingDraftUpdateManyMutationInput, Prisma.ListingDraftUncheckedUpdateManyWithoutUserInput>;
};
export type ListingDraftScalarWhereInput = {
    AND?: Prisma.ListingDraftScalarWhereInput | Prisma.ListingDraftScalarWhereInput[];
    OR?: Prisma.ListingDraftScalarWhereInput[];
    NOT?: Prisma.ListingDraftScalarWhereInput | Prisma.ListingDraftScalarWhereInput[];
    id?: Prisma.StringFilter<"ListingDraft"> | string;
    userWallet?: Prisma.StringFilter<"ListingDraft"> | string;
    stepCompleted?: Prisma.IntFilter<"ListingDraft"> | number;
    step1Data?: Prisma.JsonNullableFilter<"ListingDraft">;
    step2Data?: Prisma.JsonNullableFilter<"ListingDraft">;
    step3Data?: Prisma.JsonNullableFilter<"ListingDraft">;
    step4Data?: Prisma.JsonNullableFilter<"ListingDraft">;
    submittedAt?: Prisma.DateTimeNullableFilter<"ListingDraft"> | Date | string | null;
    propertyId?: Prisma.StringNullableFilter<"ListingDraft"> | string | null;
};
export type ListingDraftCreateWithoutPropertyInput = {
    id?: string;
    stepCompleted: number;
    step1Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    step2Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    step3Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    step4Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    submittedAt?: Date | string | null;
    user: Prisma.UserCreateNestedOneWithoutListingDraftsInput;
};
export type ListingDraftUncheckedCreateWithoutPropertyInput = {
    id?: string;
    userWallet: string;
    stepCompleted: number;
    step1Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    step2Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    step3Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    step4Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    submittedAt?: Date | string | null;
};
export type ListingDraftCreateOrConnectWithoutPropertyInput = {
    where: Prisma.ListingDraftWhereUniqueInput;
    create: Prisma.XOR<Prisma.ListingDraftCreateWithoutPropertyInput, Prisma.ListingDraftUncheckedCreateWithoutPropertyInput>;
};
export type ListingDraftCreateManyPropertyInputEnvelope = {
    data: Prisma.ListingDraftCreateManyPropertyInput | Prisma.ListingDraftCreateManyPropertyInput[];
    skipDuplicates?: boolean;
};
export type ListingDraftUpsertWithWhereUniqueWithoutPropertyInput = {
    where: Prisma.ListingDraftWhereUniqueInput;
    update: Prisma.XOR<Prisma.ListingDraftUpdateWithoutPropertyInput, Prisma.ListingDraftUncheckedUpdateWithoutPropertyInput>;
    create: Prisma.XOR<Prisma.ListingDraftCreateWithoutPropertyInput, Prisma.ListingDraftUncheckedCreateWithoutPropertyInput>;
};
export type ListingDraftUpdateWithWhereUniqueWithoutPropertyInput = {
    where: Prisma.ListingDraftWhereUniqueInput;
    data: Prisma.XOR<Prisma.ListingDraftUpdateWithoutPropertyInput, Prisma.ListingDraftUncheckedUpdateWithoutPropertyInput>;
};
export type ListingDraftUpdateManyWithWhereWithoutPropertyInput = {
    where: Prisma.ListingDraftScalarWhereInput;
    data: Prisma.XOR<Prisma.ListingDraftUpdateManyMutationInput, Prisma.ListingDraftUncheckedUpdateManyWithoutPropertyInput>;
};
export type ListingDraftCreateManyUserInput = {
    id?: string;
    stepCompleted: number;
    step1Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    step2Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    step3Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    step4Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    submittedAt?: Date | string | null;
    propertyId?: string | null;
};
export type ListingDraftUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    stepCompleted?: Prisma.IntFieldUpdateOperationsInput | number;
    step1Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    step2Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    step3Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    step4Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    submittedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    property?: Prisma.PropertyUpdateOneWithoutListingDraftsNestedInput;
};
export type ListingDraftUncheckedUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    stepCompleted?: Prisma.IntFieldUpdateOperationsInput | number;
    step1Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    step2Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    step3Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    step4Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    submittedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    propertyId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type ListingDraftUncheckedUpdateManyWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    stepCompleted?: Prisma.IntFieldUpdateOperationsInput | number;
    step1Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    step2Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    step3Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    step4Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    submittedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    propertyId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type ListingDraftCreateManyPropertyInput = {
    id?: string;
    userWallet: string;
    stepCompleted: number;
    step1Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    step2Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    step3Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    step4Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    submittedAt?: Date | string | null;
};
export type ListingDraftUpdateWithoutPropertyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    stepCompleted?: Prisma.IntFieldUpdateOperationsInput | number;
    step1Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    step2Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    step3Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    step4Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    submittedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    user?: Prisma.UserUpdateOneRequiredWithoutListingDraftsNestedInput;
};
export type ListingDraftUncheckedUpdateWithoutPropertyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userWallet?: Prisma.StringFieldUpdateOperationsInput | string;
    stepCompleted?: Prisma.IntFieldUpdateOperationsInput | number;
    step1Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    step2Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    step3Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    step4Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    submittedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type ListingDraftUncheckedUpdateManyWithoutPropertyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userWallet?: Prisma.StringFieldUpdateOperationsInput | string;
    stepCompleted?: Prisma.IntFieldUpdateOperationsInput | number;
    step1Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    step2Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    step3Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    step4Data?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    submittedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type ListingDraftSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userWallet?: boolean;
    stepCompleted?: boolean;
    step1Data?: boolean;
    step2Data?: boolean;
    step3Data?: boolean;
    step4Data?: boolean;
    submittedAt?: boolean;
    propertyId?: boolean;
    property?: boolean | Prisma.ListingDraft$propertyArgs<ExtArgs>;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["listingDraft"]>;
export type ListingDraftSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userWallet?: boolean;
    stepCompleted?: boolean;
    step1Data?: boolean;
    step2Data?: boolean;
    step3Data?: boolean;
    step4Data?: boolean;
    submittedAt?: boolean;
    propertyId?: boolean;
    property?: boolean | Prisma.ListingDraft$propertyArgs<ExtArgs>;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["listingDraft"]>;
export type ListingDraftSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userWallet?: boolean;
    stepCompleted?: boolean;
    step1Data?: boolean;
    step2Data?: boolean;
    step3Data?: boolean;
    step4Data?: boolean;
    submittedAt?: boolean;
    propertyId?: boolean;
    property?: boolean | Prisma.ListingDraft$propertyArgs<ExtArgs>;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["listingDraft"]>;
export type ListingDraftSelectScalar = {
    id?: boolean;
    userWallet?: boolean;
    stepCompleted?: boolean;
    step1Data?: boolean;
    step2Data?: boolean;
    step3Data?: boolean;
    step4Data?: boolean;
    submittedAt?: boolean;
    propertyId?: boolean;
};
export type ListingDraftOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "userWallet" | "stepCompleted" | "step1Data" | "step2Data" | "step3Data" | "step4Data" | "submittedAt" | "propertyId", ExtArgs["result"]["listingDraft"]>;
export type ListingDraftInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    property?: boolean | Prisma.ListingDraft$propertyArgs<ExtArgs>;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type ListingDraftIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    property?: boolean | Prisma.ListingDraft$propertyArgs<ExtArgs>;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type ListingDraftIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    property?: boolean | Prisma.ListingDraft$propertyArgs<ExtArgs>;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type $ListingDraftPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "ListingDraft";
    objects: {
        property: Prisma.$PropertyPayload<ExtArgs> | null;
        user: Prisma.$UserPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        userWallet: string;
        stepCompleted: number;
        step1Data: runtime.JsonValue | null;
        step2Data: runtime.JsonValue | null;
        step3Data: runtime.JsonValue | null;
        step4Data: runtime.JsonValue | null;
        submittedAt: Date | null;
        propertyId: string | null;
    }, ExtArgs["result"]["listingDraft"]>;
    composites: {};
};
export type ListingDraftGetPayload<S extends boolean | null | undefined | ListingDraftDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ListingDraftPayload, S>;
export type ListingDraftCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ListingDraftFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ListingDraftCountAggregateInputType | true;
};
export interface ListingDraftDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['ListingDraft'];
        meta: {
            name: 'ListingDraft';
        };
    };
    /**
     * Find zero or one ListingDraft that matches the filter.
     * @param {ListingDraftFindUniqueArgs} args - Arguments to find a ListingDraft
     * @example
     * // Get one ListingDraft
     * const listingDraft = await prisma.listingDraft.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ListingDraftFindUniqueArgs>(args: Prisma.SelectSubset<T, ListingDraftFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ListingDraftClient<runtime.Types.Result.GetResult<Prisma.$ListingDraftPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one ListingDraft that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ListingDraftFindUniqueOrThrowArgs} args - Arguments to find a ListingDraft
     * @example
     * // Get one ListingDraft
     * const listingDraft = await prisma.listingDraft.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ListingDraftFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ListingDraftFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ListingDraftClient<runtime.Types.Result.GetResult<Prisma.$ListingDraftPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first ListingDraft that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ListingDraftFindFirstArgs} args - Arguments to find a ListingDraft
     * @example
     * // Get one ListingDraft
     * const listingDraft = await prisma.listingDraft.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ListingDraftFindFirstArgs>(args?: Prisma.SelectSubset<T, ListingDraftFindFirstArgs<ExtArgs>>): Prisma.Prisma__ListingDraftClient<runtime.Types.Result.GetResult<Prisma.$ListingDraftPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first ListingDraft that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ListingDraftFindFirstOrThrowArgs} args - Arguments to find a ListingDraft
     * @example
     * // Get one ListingDraft
     * const listingDraft = await prisma.listingDraft.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ListingDraftFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ListingDraftFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ListingDraftClient<runtime.Types.Result.GetResult<Prisma.$ListingDraftPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more ListingDrafts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ListingDraftFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ListingDrafts
     * const listingDrafts = await prisma.listingDraft.findMany()
     *
     * // Get first 10 ListingDrafts
     * const listingDrafts = await prisma.listingDraft.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const listingDraftWithIdOnly = await prisma.listingDraft.findMany({ select: { id: true } })
     *
     */
    findMany<T extends ListingDraftFindManyArgs>(args?: Prisma.SelectSubset<T, ListingDraftFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ListingDraftPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a ListingDraft.
     * @param {ListingDraftCreateArgs} args - Arguments to create a ListingDraft.
     * @example
     * // Create one ListingDraft
     * const ListingDraft = await prisma.listingDraft.create({
     *   data: {
     *     // ... data to create a ListingDraft
     *   }
     * })
     *
     */
    create<T extends ListingDraftCreateArgs>(args: Prisma.SelectSubset<T, ListingDraftCreateArgs<ExtArgs>>): Prisma.Prisma__ListingDraftClient<runtime.Types.Result.GetResult<Prisma.$ListingDraftPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many ListingDrafts.
     * @param {ListingDraftCreateManyArgs} args - Arguments to create many ListingDrafts.
     * @example
     * // Create many ListingDrafts
     * const listingDraft = await prisma.listingDraft.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends ListingDraftCreateManyArgs>(args?: Prisma.SelectSubset<T, ListingDraftCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many ListingDrafts and returns the data saved in the database.
     * @param {ListingDraftCreateManyAndReturnArgs} args - Arguments to create many ListingDrafts.
     * @example
     * // Create many ListingDrafts
     * const listingDraft = await prisma.listingDraft.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many ListingDrafts and only return the `id`
     * const listingDraftWithIdOnly = await prisma.listingDraft.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends ListingDraftCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ListingDraftCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ListingDraftPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a ListingDraft.
     * @param {ListingDraftDeleteArgs} args - Arguments to delete one ListingDraft.
     * @example
     * // Delete one ListingDraft
     * const ListingDraft = await prisma.listingDraft.delete({
     *   where: {
     *     // ... filter to delete one ListingDraft
     *   }
     * })
     *
     */
    delete<T extends ListingDraftDeleteArgs>(args: Prisma.SelectSubset<T, ListingDraftDeleteArgs<ExtArgs>>): Prisma.Prisma__ListingDraftClient<runtime.Types.Result.GetResult<Prisma.$ListingDraftPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one ListingDraft.
     * @param {ListingDraftUpdateArgs} args - Arguments to update one ListingDraft.
     * @example
     * // Update one ListingDraft
     * const listingDraft = await prisma.listingDraft.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends ListingDraftUpdateArgs>(args: Prisma.SelectSubset<T, ListingDraftUpdateArgs<ExtArgs>>): Prisma.Prisma__ListingDraftClient<runtime.Types.Result.GetResult<Prisma.$ListingDraftPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more ListingDrafts.
     * @param {ListingDraftDeleteManyArgs} args - Arguments to filter ListingDrafts to delete.
     * @example
     * // Delete a few ListingDrafts
     * const { count } = await prisma.listingDraft.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends ListingDraftDeleteManyArgs>(args?: Prisma.SelectSubset<T, ListingDraftDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more ListingDrafts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ListingDraftUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ListingDrafts
     * const listingDraft = await prisma.listingDraft.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends ListingDraftUpdateManyArgs>(args: Prisma.SelectSubset<T, ListingDraftUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more ListingDrafts and returns the data updated in the database.
     * @param {ListingDraftUpdateManyAndReturnArgs} args - Arguments to update many ListingDrafts.
     * @example
     * // Update many ListingDrafts
     * const listingDraft = await prisma.listingDraft.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more ListingDrafts and only return the `id`
     * const listingDraftWithIdOnly = await prisma.listingDraft.updateManyAndReturn({
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
    updateManyAndReturn<T extends ListingDraftUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ListingDraftUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ListingDraftPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one ListingDraft.
     * @param {ListingDraftUpsertArgs} args - Arguments to update or create a ListingDraft.
     * @example
     * // Update or create a ListingDraft
     * const listingDraft = await prisma.listingDraft.upsert({
     *   create: {
     *     // ... data to create a ListingDraft
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ListingDraft we want to update
     *   }
     * })
     */
    upsert<T extends ListingDraftUpsertArgs>(args: Prisma.SelectSubset<T, ListingDraftUpsertArgs<ExtArgs>>): Prisma.Prisma__ListingDraftClient<runtime.Types.Result.GetResult<Prisma.$ListingDraftPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of ListingDrafts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ListingDraftCountArgs} args - Arguments to filter ListingDrafts to count.
     * @example
     * // Count the number of ListingDrafts
     * const count = await prisma.listingDraft.count({
     *   where: {
     *     // ... the filter for the ListingDrafts we want to count
     *   }
     * })
    **/
    count<T extends ListingDraftCountArgs>(args?: Prisma.Subset<T, ListingDraftCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ListingDraftCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a ListingDraft.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ListingDraftAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ListingDraftAggregateArgs>(args: Prisma.Subset<T, ListingDraftAggregateArgs>): Prisma.PrismaPromise<GetListingDraftAggregateType<T>>;
    /**
     * Group by ListingDraft.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ListingDraftGroupByArgs} args - Group by arguments.
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
    groupBy<T extends ListingDraftGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ListingDraftGroupByArgs['orderBy'];
    } : {
        orderBy?: ListingDraftGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ListingDraftGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetListingDraftGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the ListingDraft model
     */
    readonly fields: ListingDraftFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for ListingDraft.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__ListingDraftClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    property<T extends Prisma.ListingDraft$propertyArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ListingDraft$propertyArgs<ExtArgs>>): Prisma.Prisma__PropertyClient<runtime.Types.Result.GetResult<Prisma.$PropertyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    user<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
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
 * Fields of the ListingDraft model
 */
export interface ListingDraftFieldRefs {
    readonly id: Prisma.FieldRef<"ListingDraft", 'String'>;
    readonly userWallet: Prisma.FieldRef<"ListingDraft", 'String'>;
    readonly stepCompleted: Prisma.FieldRef<"ListingDraft", 'Int'>;
    readonly step1Data: Prisma.FieldRef<"ListingDraft", 'Json'>;
    readonly step2Data: Prisma.FieldRef<"ListingDraft", 'Json'>;
    readonly step3Data: Prisma.FieldRef<"ListingDraft", 'Json'>;
    readonly step4Data: Prisma.FieldRef<"ListingDraft", 'Json'>;
    readonly submittedAt: Prisma.FieldRef<"ListingDraft", 'DateTime'>;
    readonly propertyId: Prisma.FieldRef<"ListingDraft", 'String'>;
}
/**
 * ListingDraft findUnique
 */
export type ListingDraftFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ListingDraft
     */
    select?: Prisma.ListingDraftSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ListingDraft
     */
    omit?: Prisma.ListingDraftOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ListingDraftInclude<ExtArgs> | null;
    /**
     * Filter, which ListingDraft to fetch.
     */
    where: Prisma.ListingDraftWhereUniqueInput;
};
/**
 * ListingDraft findUniqueOrThrow
 */
export type ListingDraftFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ListingDraft
     */
    select?: Prisma.ListingDraftSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ListingDraft
     */
    omit?: Prisma.ListingDraftOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ListingDraftInclude<ExtArgs> | null;
    /**
     * Filter, which ListingDraft to fetch.
     */
    where: Prisma.ListingDraftWhereUniqueInput;
};
/**
 * ListingDraft findFirst
 */
export type ListingDraftFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ListingDraft
     */
    select?: Prisma.ListingDraftSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ListingDraft
     */
    omit?: Prisma.ListingDraftOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ListingDraftInclude<ExtArgs> | null;
    /**
     * Filter, which ListingDraft to fetch.
     */
    where?: Prisma.ListingDraftWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ListingDrafts to fetch.
     */
    orderBy?: Prisma.ListingDraftOrderByWithRelationInput | Prisma.ListingDraftOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for ListingDrafts.
     */
    cursor?: Prisma.ListingDraftWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ListingDrafts from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ListingDrafts.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of ListingDrafts.
     */
    distinct?: Prisma.ListingDraftScalarFieldEnum | Prisma.ListingDraftScalarFieldEnum[];
};
/**
 * ListingDraft findFirstOrThrow
 */
export type ListingDraftFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ListingDraft
     */
    select?: Prisma.ListingDraftSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ListingDraft
     */
    omit?: Prisma.ListingDraftOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ListingDraftInclude<ExtArgs> | null;
    /**
     * Filter, which ListingDraft to fetch.
     */
    where?: Prisma.ListingDraftWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ListingDrafts to fetch.
     */
    orderBy?: Prisma.ListingDraftOrderByWithRelationInput | Prisma.ListingDraftOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for ListingDrafts.
     */
    cursor?: Prisma.ListingDraftWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ListingDrafts from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ListingDrafts.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of ListingDrafts.
     */
    distinct?: Prisma.ListingDraftScalarFieldEnum | Prisma.ListingDraftScalarFieldEnum[];
};
/**
 * ListingDraft findMany
 */
export type ListingDraftFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ListingDraft
     */
    select?: Prisma.ListingDraftSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ListingDraft
     */
    omit?: Prisma.ListingDraftOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ListingDraftInclude<ExtArgs> | null;
    /**
     * Filter, which ListingDrafts to fetch.
     */
    where?: Prisma.ListingDraftWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ListingDrafts to fetch.
     */
    orderBy?: Prisma.ListingDraftOrderByWithRelationInput | Prisma.ListingDraftOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing ListingDrafts.
     */
    cursor?: Prisma.ListingDraftWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ListingDrafts from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ListingDrafts.
     */
    skip?: number;
    distinct?: Prisma.ListingDraftScalarFieldEnum | Prisma.ListingDraftScalarFieldEnum[];
};
/**
 * ListingDraft create
 */
export type ListingDraftCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ListingDraft
     */
    select?: Prisma.ListingDraftSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ListingDraft
     */
    omit?: Prisma.ListingDraftOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ListingDraftInclude<ExtArgs> | null;
    /**
     * The data needed to create a ListingDraft.
     */
    data: Prisma.XOR<Prisma.ListingDraftCreateInput, Prisma.ListingDraftUncheckedCreateInput>;
};
/**
 * ListingDraft createMany
 */
export type ListingDraftCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many ListingDrafts.
     */
    data: Prisma.ListingDraftCreateManyInput | Prisma.ListingDraftCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * ListingDraft createManyAndReturn
 */
export type ListingDraftCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ListingDraft
     */
    select?: Prisma.ListingDraftSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the ListingDraft
     */
    omit?: Prisma.ListingDraftOmit<ExtArgs> | null;
    /**
     * The data used to create many ListingDrafts.
     */
    data: Prisma.ListingDraftCreateManyInput | Prisma.ListingDraftCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ListingDraftIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * ListingDraft update
 */
export type ListingDraftUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ListingDraft
     */
    select?: Prisma.ListingDraftSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ListingDraft
     */
    omit?: Prisma.ListingDraftOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ListingDraftInclude<ExtArgs> | null;
    /**
     * The data needed to update a ListingDraft.
     */
    data: Prisma.XOR<Prisma.ListingDraftUpdateInput, Prisma.ListingDraftUncheckedUpdateInput>;
    /**
     * Choose, which ListingDraft to update.
     */
    where: Prisma.ListingDraftWhereUniqueInput;
};
/**
 * ListingDraft updateMany
 */
export type ListingDraftUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update ListingDrafts.
     */
    data: Prisma.XOR<Prisma.ListingDraftUpdateManyMutationInput, Prisma.ListingDraftUncheckedUpdateManyInput>;
    /**
     * Filter which ListingDrafts to update
     */
    where?: Prisma.ListingDraftWhereInput;
    /**
     * Limit how many ListingDrafts to update.
     */
    limit?: number;
};
/**
 * ListingDraft updateManyAndReturn
 */
export type ListingDraftUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ListingDraft
     */
    select?: Prisma.ListingDraftSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the ListingDraft
     */
    omit?: Prisma.ListingDraftOmit<ExtArgs> | null;
    /**
     * The data used to update ListingDrafts.
     */
    data: Prisma.XOR<Prisma.ListingDraftUpdateManyMutationInput, Prisma.ListingDraftUncheckedUpdateManyInput>;
    /**
     * Filter which ListingDrafts to update
     */
    where?: Prisma.ListingDraftWhereInput;
    /**
     * Limit how many ListingDrafts to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ListingDraftIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * ListingDraft upsert
 */
export type ListingDraftUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ListingDraft
     */
    select?: Prisma.ListingDraftSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ListingDraft
     */
    omit?: Prisma.ListingDraftOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ListingDraftInclude<ExtArgs> | null;
    /**
     * The filter to search for the ListingDraft to update in case it exists.
     */
    where: Prisma.ListingDraftWhereUniqueInput;
    /**
     * In case the ListingDraft found by the `where` argument doesn't exist, create a new ListingDraft with this data.
     */
    create: Prisma.XOR<Prisma.ListingDraftCreateInput, Prisma.ListingDraftUncheckedCreateInput>;
    /**
     * In case the ListingDraft was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.ListingDraftUpdateInput, Prisma.ListingDraftUncheckedUpdateInput>;
};
/**
 * ListingDraft delete
 */
export type ListingDraftDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ListingDraft
     */
    select?: Prisma.ListingDraftSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ListingDraft
     */
    omit?: Prisma.ListingDraftOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ListingDraftInclude<ExtArgs> | null;
    /**
     * Filter which ListingDraft to delete.
     */
    where: Prisma.ListingDraftWhereUniqueInput;
};
/**
 * ListingDraft deleteMany
 */
export type ListingDraftDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which ListingDrafts to delete
     */
    where?: Prisma.ListingDraftWhereInput;
    /**
     * Limit how many ListingDrafts to delete.
     */
    limit?: number;
};
/**
 * ListingDraft.property
 */
export type ListingDraft$propertyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Property
     */
    select?: Prisma.PropertySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Property
     */
    omit?: Prisma.PropertyOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PropertyInclude<ExtArgs> | null;
    where?: Prisma.PropertyWhereInput;
};
/**
 * ListingDraft without action
 */
export type ListingDraftDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ListingDraft
     */
    select?: Prisma.ListingDraftSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ListingDraft
     */
    omit?: Prisma.ListingDraftOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ListingDraftInclude<ExtArgs> | null;
};
export {};
//# sourceMappingURL=ListingDraft.d.ts.map