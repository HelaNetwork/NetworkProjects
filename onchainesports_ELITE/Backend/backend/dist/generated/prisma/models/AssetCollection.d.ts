import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model AssetCollection
 *
 */
export type AssetCollectionModel = runtime.Types.Result.DefaultSelection<Prisma.$AssetCollectionPayload>;
export type AggregateAssetCollection = {
    _count: AssetCollectionCountAggregateOutputType | null;
    _min: AssetCollectionMinAggregateOutputType | null;
    _max: AssetCollectionMaxAggregateOutputType | null;
};
export type AssetCollectionMinAggregateOutputType = {
    id: string | null;
    name: string | null;
    description: string | null;
    collectionMint: string | null;
    metadataUri: string | null;
    createdAt: Date | null;
};
export type AssetCollectionMaxAggregateOutputType = {
    id: string | null;
    name: string | null;
    description: string | null;
    collectionMint: string | null;
    metadataUri: string | null;
    createdAt: Date | null;
};
export type AssetCollectionCountAggregateOutputType = {
    id: number;
    name: number;
    description: number;
    collectionMint: number;
    metadataUri: number;
    createdAt: number;
    _all: number;
};
export type AssetCollectionMinAggregateInputType = {
    id?: true;
    name?: true;
    description?: true;
    collectionMint?: true;
    metadataUri?: true;
    createdAt?: true;
};
export type AssetCollectionMaxAggregateInputType = {
    id?: true;
    name?: true;
    description?: true;
    collectionMint?: true;
    metadataUri?: true;
    createdAt?: true;
};
export type AssetCollectionCountAggregateInputType = {
    id?: true;
    name?: true;
    description?: true;
    collectionMint?: true;
    metadataUri?: true;
    createdAt?: true;
    _all?: true;
};
export type AssetCollectionAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which AssetCollection to aggregate.
     */
    where?: Prisma.AssetCollectionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of AssetCollections to fetch.
     */
    orderBy?: Prisma.AssetCollectionOrderByWithRelationInput | Prisma.AssetCollectionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.AssetCollectionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` AssetCollections from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` AssetCollections.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned AssetCollections
    **/
    _count?: true | AssetCollectionCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: AssetCollectionMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: AssetCollectionMaxAggregateInputType;
};
export type GetAssetCollectionAggregateType<T extends AssetCollectionAggregateArgs> = {
    [P in keyof T & keyof AggregateAssetCollection]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateAssetCollection[P]> : Prisma.GetScalarType<T[P], AggregateAssetCollection[P]>;
};
export type AssetCollectionGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AssetCollectionWhereInput;
    orderBy?: Prisma.AssetCollectionOrderByWithAggregationInput | Prisma.AssetCollectionOrderByWithAggregationInput[];
    by: Prisma.AssetCollectionScalarFieldEnum[] | Prisma.AssetCollectionScalarFieldEnum;
    having?: Prisma.AssetCollectionScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: AssetCollectionCountAggregateInputType | true;
    _min?: AssetCollectionMinAggregateInputType;
    _max?: AssetCollectionMaxAggregateInputType;
};
export type AssetCollectionGroupByOutputType = {
    id: string;
    name: string;
    description: string | null;
    collectionMint: string | null;
    metadataUri: string | null;
    createdAt: Date;
    _count: AssetCollectionCountAggregateOutputType | null;
    _min: AssetCollectionMinAggregateOutputType | null;
    _max: AssetCollectionMaxAggregateOutputType | null;
};
type GetAssetCollectionGroupByPayload<T extends AssetCollectionGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<AssetCollectionGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof AssetCollectionGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], AssetCollectionGroupByOutputType[P]> : Prisma.GetScalarType<T[P], AssetCollectionGroupByOutputType[P]>;
}>>;
export type AssetCollectionWhereInput = {
    AND?: Prisma.AssetCollectionWhereInput | Prisma.AssetCollectionWhereInput[];
    OR?: Prisma.AssetCollectionWhereInput[];
    NOT?: Prisma.AssetCollectionWhereInput | Prisma.AssetCollectionWhereInput[];
    id?: Prisma.StringFilter<"AssetCollection"> | string;
    name?: Prisma.StringFilter<"AssetCollection"> | string;
    description?: Prisma.StringNullableFilter<"AssetCollection"> | string | null;
    collectionMint?: Prisma.StringNullableFilter<"AssetCollection"> | string | null;
    metadataUri?: Prisma.StringNullableFilter<"AssetCollection"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"AssetCollection"> | Date | string;
    assets?: Prisma.AssetListRelationFilter;
};
export type AssetCollectionOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrderInput | Prisma.SortOrder;
    collectionMint?: Prisma.SortOrderInput | Prisma.SortOrder;
    metadataUri?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    assets?: Prisma.AssetOrderByRelationAggregateInput;
};
export type AssetCollectionWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.AssetCollectionWhereInput | Prisma.AssetCollectionWhereInput[];
    OR?: Prisma.AssetCollectionWhereInput[];
    NOT?: Prisma.AssetCollectionWhereInput | Prisma.AssetCollectionWhereInput[];
    name?: Prisma.StringFilter<"AssetCollection"> | string;
    description?: Prisma.StringNullableFilter<"AssetCollection"> | string | null;
    collectionMint?: Prisma.StringNullableFilter<"AssetCollection"> | string | null;
    metadataUri?: Prisma.StringNullableFilter<"AssetCollection"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"AssetCollection"> | Date | string;
    assets?: Prisma.AssetListRelationFilter;
}, "id">;
export type AssetCollectionOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrderInput | Prisma.SortOrder;
    collectionMint?: Prisma.SortOrderInput | Prisma.SortOrder;
    metadataUri?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    _count?: Prisma.AssetCollectionCountOrderByAggregateInput;
    _max?: Prisma.AssetCollectionMaxOrderByAggregateInput;
    _min?: Prisma.AssetCollectionMinOrderByAggregateInput;
};
export type AssetCollectionScalarWhereWithAggregatesInput = {
    AND?: Prisma.AssetCollectionScalarWhereWithAggregatesInput | Prisma.AssetCollectionScalarWhereWithAggregatesInput[];
    OR?: Prisma.AssetCollectionScalarWhereWithAggregatesInput[];
    NOT?: Prisma.AssetCollectionScalarWhereWithAggregatesInput | Prisma.AssetCollectionScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"AssetCollection"> | string;
    name?: Prisma.StringWithAggregatesFilter<"AssetCollection"> | string;
    description?: Prisma.StringNullableWithAggregatesFilter<"AssetCollection"> | string | null;
    collectionMint?: Prisma.StringNullableWithAggregatesFilter<"AssetCollection"> | string | null;
    metadataUri?: Prisma.StringNullableWithAggregatesFilter<"AssetCollection"> | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"AssetCollection"> | Date | string;
};
export type AssetCollectionCreateInput = {
    id?: string;
    name: string;
    description?: string | null;
    collectionMint?: string | null;
    metadataUri?: string | null;
    createdAt?: Date | string;
    assets?: Prisma.AssetCreateNestedManyWithoutCollectionInput;
};
export type AssetCollectionUncheckedCreateInput = {
    id?: string;
    name: string;
    description?: string | null;
    collectionMint?: string | null;
    metadataUri?: string | null;
    createdAt?: Date | string;
    assets?: Prisma.AssetUncheckedCreateNestedManyWithoutCollectionInput;
};
export type AssetCollectionUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    collectionMint?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    metadataUri?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    assets?: Prisma.AssetUpdateManyWithoutCollectionNestedInput;
};
export type AssetCollectionUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    collectionMint?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    metadataUri?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    assets?: Prisma.AssetUncheckedUpdateManyWithoutCollectionNestedInput;
};
export type AssetCollectionCreateManyInput = {
    id?: string;
    name: string;
    description?: string | null;
    collectionMint?: string | null;
    metadataUri?: string | null;
    createdAt?: Date | string;
};
export type AssetCollectionUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    collectionMint?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    metadataUri?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type AssetCollectionUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    collectionMint?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    metadataUri?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type AssetCollectionCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    collectionMint?: Prisma.SortOrder;
    metadataUri?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type AssetCollectionMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    collectionMint?: Prisma.SortOrder;
    metadataUri?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type AssetCollectionMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    collectionMint?: Prisma.SortOrder;
    metadataUri?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type AssetCollectionNullableScalarRelationFilter = {
    is?: Prisma.AssetCollectionWhereInput | null;
    isNot?: Prisma.AssetCollectionWhereInput | null;
};
export type AssetCollectionCreateNestedOneWithoutAssetsInput = {
    create?: Prisma.XOR<Prisma.AssetCollectionCreateWithoutAssetsInput, Prisma.AssetCollectionUncheckedCreateWithoutAssetsInput>;
    connectOrCreate?: Prisma.AssetCollectionCreateOrConnectWithoutAssetsInput;
    connect?: Prisma.AssetCollectionWhereUniqueInput;
};
export type AssetCollectionUpdateOneWithoutAssetsNestedInput = {
    create?: Prisma.XOR<Prisma.AssetCollectionCreateWithoutAssetsInput, Prisma.AssetCollectionUncheckedCreateWithoutAssetsInput>;
    connectOrCreate?: Prisma.AssetCollectionCreateOrConnectWithoutAssetsInput;
    upsert?: Prisma.AssetCollectionUpsertWithoutAssetsInput;
    disconnect?: Prisma.AssetCollectionWhereInput | boolean;
    delete?: Prisma.AssetCollectionWhereInput | boolean;
    connect?: Prisma.AssetCollectionWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.AssetCollectionUpdateToOneWithWhereWithoutAssetsInput, Prisma.AssetCollectionUpdateWithoutAssetsInput>, Prisma.AssetCollectionUncheckedUpdateWithoutAssetsInput>;
};
export type AssetCollectionCreateWithoutAssetsInput = {
    id?: string;
    name: string;
    description?: string | null;
    collectionMint?: string | null;
    metadataUri?: string | null;
    createdAt?: Date | string;
};
export type AssetCollectionUncheckedCreateWithoutAssetsInput = {
    id?: string;
    name: string;
    description?: string | null;
    collectionMint?: string | null;
    metadataUri?: string | null;
    createdAt?: Date | string;
};
export type AssetCollectionCreateOrConnectWithoutAssetsInput = {
    where: Prisma.AssetCollectionWhereUniqueInput;
    create: Prisma.XOR<Prisma.AssetCollectionCreateWithoutAssetsInput, Prisma.AssetCollectionUncheckedCreateWithoutAssetsInput>;
};
export type AssetCollectionUpsertWithoutAssetsInput = {
    update: Prisma.XOR<Prisma.AssetCollectionUpdateWithoutAssetsInput, Prisma.AssetCollectionUncheckedUpdateWithoutAssetsInput>;
    create: Prisma.XOR<Prisma.AssetCollectionCreateWithoutAssetsInput, Prisma.AssetCollectionUncheckedCreateWithoutAssetsInput>;
    where?: Prisma.AssetCollectionWhereInput;
};
export type AssetCollectionUpdateToOneWithWhereWithoutAssetsInput = {
    where?: Prisma.AssetCollectionWhereInput;
    data: Prisma.XOR<Prisma.AssetCollectionUpdateWithoutAssetsInput, Prisma.AssetCollectionUncheckedUpdateWithoutAssetsInput>;
};
export type AssetCollectionUpdateWithoutAssetsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    collectionMint?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    metadataUri?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type AssetCollectionUncheckedUpdateWithoutAssetsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    collectionMint?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    metadataUri?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
/**
 * Count Type AssetCollectionCountOutputType
 */
export type AssetCollectionCountOutputType = {
    assets: number;
};
export type AssetCollectionCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    assets?: boolean | AssetCollectionCountOutputTypeCountAssetsArgs;
};
/**
 * AssetCollectionCountOutputType without action
 */
export type AssetCollectionCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetCollectionCountOutputType
     */
    select?: Prisma.AssetCollectionCountOutputTypeSelect<ExtArgs> | null;
};
/**
 * AssetCollectionCountOutputType without action
 */
export type AssetCollectionCountOutputTypeCountAssetsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AssetWhereInput;
};
export type AssetCollectionSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    description?: boolean;
    collectionMint?: boolean;
    metadataUri?: boolean;
    createdAt?: boolean;
    assets?: boolean | Prisma.AssetCollection$assetsArgs<ExtArgs>;
    _count?: boolean | Prisma.AssetCollectionCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["assetCollection"]>;
export type AssetCollectionSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    description?: boolean;
    collectionMint?: boolean;
    metadataUri?: boolean;
    createdAt?: boolean;
}, ExtArgs["result"]["assetCollection"]>;
export type AssetCollectionSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    description?: boolean;
    collectionMint?: boolean;
    metadataUri?: boolean;
    createdAt?: boolean;
}, ExtArgs["result"]["assetCollection"]>;
export type AssetCollectionSelectScalar = {
    id?: boolean;
    name?: boolean;
    description?: boolean;
    collectionMint?: boolean;
    metadataUri?: boolean;
    createdAt?: boolean;
};
export type AssetCollectionOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "name" | "description" | "collectionMint" | "metadataUri" | "createdAt", ExtArgs["result"]["assetCollection"]>;
export type AssetCollectionInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    assets?: boolean | Prisma.AssetCollection$assetsArgs<ExtArgs>;
    _count?: boolean | Prisma.AssetCollectionCountOutputTypeDefaultArgs<ExtArgs>;
};
export type AssetCollectionIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type AssetCollectionIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $AssetCollectionPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "AssetCollection";
    objects: {
        assets: Prisma.$AssetPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        name: string;
        description: string | null;
        collectionMint: string | null;
        metadataUri: string | null;
        createdAt: Date;
    }, ExtArgs["result"]["assetCollection"]>;
    composites: {};
};
export type AssetCollectionGetPayload<S extends boolean | null | undefined | AssetCollectionDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$AssetCollectionPayload, S>;
export type AssetCollectionCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<AssetCollectionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: AssetCollectionCountAggregateInputType | true;
};
export interface AssetCollectionDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['AssetCollection'];
        meta: {
            name: 'AssetCollection';
        };
    };
    /**
     * Find zero or one AssetCollection that matches the filter.
     * @param {AssetCollectionFindUniqueArgs} args - Arguments to find a AssetCollection
     * @example
     * // Get one AssetCollection
     * const assetCollection = await prisma.assetCollection.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AssetCollectionFindUniqueArgs>(args: Prisma.SelectSubset<T, AssetCollectionFindUniqueArgs<ExtArgs>>): Prisma.Prisma__AssetCollectionClient<runtime.Types.Result.GetResult<Prisma.$AssetCollectionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one AssetCollection that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AssetCollectionFindUniqueOrThrowArgs} args - Arguments to find a AssetCollection
     * @example
     * // Get one AssetCollection
     * const assetCollection = await prisma.assetCollection.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AssetCollectionFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, AssetCollectionFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__AssetCollectionClient<runtime.Types.Result.GetResult<Prisma.$AssetCollectionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first AssetCollection that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetCollectionFindFirstArgs} args - Arguments to find a AssetCollection
     * @example
     * // Get one AssetCollection
     * const assetCollection = await prisma.assetCollection.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AssetCollectionFindFirstArgs>(args?: Prisma.SelectSubset<T, AssetCollectionFindFirstArgs<ExtArgs>>): Prisma.Prisma__AssetCollectionClient<runtime.Types.Result.GetResult<Prisma.$AssetCollectionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first AssetCollection that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetCollectionFindFirstOrThrowArgs} args - Arguments to find a AssetCollection
     * @example
     * // Get one AssetCollection
     * const assetCollection = await prisma.assetCollection.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AssetCollectionFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, AssetCollectionFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__AssetCollectionClient<runtime.Types.Result.GetResult<Prisma.$AssetCollectionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more AssetCollections that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetCollectionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AssetCollections
     * const assetCollections = await prisma.assetCollection.findMany()
     *
     * // Get first 10 AssetCollections
     * const assetCollections = await prisma.assetCollection.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const assetCollectionWithIdOnly = await prisma.assetCollection.findMany({ select: { id: true } })
     *
     */
    findMany<T extends AssetCollectionFindManyArgs>(args?: Prisma.SelectSubset<T, AssetCollectionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AssetCollectionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a AssetCollection.
     * @param {AssetCollectionCreateArgs} args - Arguments to create a AssetCollection.
     * @example
     * // Create one AssetCollection
     * const AssetCollection = await prisma.assetCollection.create({
     *   data: {
     *     // ... data to create a AssetCollection
     *   }
     * })
     *
     */
    create<T extends AssetCollectionCreateArgs>(args: Prisma.SelectSubset<T, AssetCollectionCreateArgs<ExtArgs>>): Prisma.Prisma__AssetCollectionClient<runtime.Types.Result.GetResult<Prisma.$AssetCollectionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many AssetCollections.
     * @param {AssetCollectionCreateManyArgs} args - Arguments to create many AssetCollections.
     * @example
     * // Create many AssetCollections
     * const assetCollection = await prisma.assetCollection.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends AssetCollectionCreateManyArgs>(args?: Prisma.SelectSubset<T, AssetCollectionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many AssetCollections and returns the data saved in the database.
     * @param {AssetCollectionCreateManyAndReturnArgs} args - Arguments to create many AssetCollections.
     * @example
     * // Create many AssetCollections
     * const assetCollection = await prisma.assetCollection.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many AssetCollections and only return the `id`
     * const assetCollectionWithIdOnly = await prisma.assetCollection.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends AssetCollectionCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, AssetCollectionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AssetCollectionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a AssetCollection.
     * @param {AssetCollectionDeleteArgs} args - Arguments to delete one AssetCollection.
     * @example
     * // Delete one AssetCollection
     * const AssetCollection = await prisma.assetCollection.delete({
     *   where: {
     *     // ... filter to delete one AssetCollection
     *   }
     * })
     *
     */
    delete<T extends AssetCollectionDeleteArgs>(args: Prisma.SelectSubset<T, AssetCollectionDeleteArgs<ExtArgs>>): Prisma.Prisma__AssetCollectionClient<runtime.Types.Result.GetResult<Prisma.$AssetCollectionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one AssetCollection.
     * @param {AssetCollectionUpdateArgs} args - Arguments to update one AssetCollection.
     * @example
     * // Update one AssetCollection
     * const assetCollection = await prisma.assetCollection.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends AssetCollectionUpdateArgs>(args: Prisma.SelectSubset<T, AssetCollectionUpdateArgs<ExtArgs>>): Prisma.Prisma__AssetCollectionClient<runtime.Types.Result.GetResult<Prisma.$AssetCollectionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more AssetCollections.
     * @param {AssetCollectionDeleteManyArgs} args - Arguments to filter AssetCollections to delete.
     * @example
     * // Delete a few AssetCollections
     * const { count } = await prisma.assetCollection.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends AssetCollectionDeleteManyArgs>(args?: Prisma.SelectSubset<T, AssetCollectionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more AssetCollections.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetCollectionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AssetCollections
     * const assetCollection = await prisma.assetCollection.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends AssetCollectionUpdateManyArgs>(args: Prisma.SelectSubset<T, AssetCollectionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more AssetCollections and returns the data updated in the database.
     * @param {AssetCollectionUpdateManyAndReturnArgs} args - Arguments to update many AssetCollections.
     * @example
     * // Update many AssetCollections
     * const assetCollection = await prisma.assetCollection.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more AssetCollections and only return the `id`
     * const assetCollectionWithIdOnly = await prisma.assetCollection.updateManyAndReturn({
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
    updateManyAndReturn<T extends AssetCollectionUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, AssetCollectionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AssetCollectionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one AssetCollection.
     * @param {AssetCollectionUpsertArgs} args - Arguments to update or create a AssetCollection.
     * @example
     * // Update or create a AssetCollection
     * const assetCollection = await prisma.assetCollection.upsert({
     *   create: {
     *     // ... data to create a AssetCollection
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AssetCollection we want to update
     *   }
     * })
     */
    upsert<T extends AssetCollectionUpsertArgs>(args: Prisma.SelectSubset<T, AssetCollectionUpsertArgs<ExtArgs>>): Prisma.Prisma__AssetCollectionClient<runtime.Types.Result.GetResult<Prisma.$AssetCollectionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of AssetCollections.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetCollectionCountArgs} args - Arguments to filter AssetCollections to count.
     * @example
     * // Count the number of AssetCollections
     * const count = await prisma.assetCollection.count({
     *   where: {
     *     // ... the filter for the AssetCollections we want to count
     *   }
     * })
    **/
    count<T extends AssetCollectionCountArgs>(args?: Prisma.Subset<T, AssetCollectionCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], AssetCollectionCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a AssetCollection.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetCollectionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends AssetCollectionAggregateArgs>(args: Prisma.Subset<T, AssetCollectionAggregateArgs>): Prisma.PrismaPromise<GetAssetCollectionAggregateType<T>>;
    /**
     * Group by AssetCollection.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetCollectionGroupByArgs} args - Group by arguments.
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
    groupBy<T extends AssetCollectionGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: AssetCollectionGroupByArgs['orderBy'];
    } : {
        orderBy?: AssetCollectionGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, AssetCollectionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAssetCollectionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the AssetCollection model
     */
    readonly fields: AssetCollectionFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for AssetCollection.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__AssetCollectionClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    assets<T extends Prisma.AssetCollection$assetsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.AssetCollection$assetsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
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
 * Fields of the AssetCollection model
 */
export interface AssetCollectionFieldRefs {
    readonly id: Prisma.FieldRef<"AssetCollection", 'String'>;
    readonly name: Prisma.FieldRef<"AssetCollection", 'String'>;
    readonly description: Prisma.FieldRef<"AssetCollection", 'String'>;
    readonly collectionMint: Prisma.FieldRef<"AssetCollection", 'String'>;
    readonly metadataUri: Prisma.FieldRef<"AssetCollection", 'String'>;
    readonly createdAt: Prisma.FieldRef<"AssetCollection", 'DateTime'>;
}
/**
 * AssetCollection findUnique
 */
export type AssetCollectionFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which AssetCollection to fetch.
     */
    where: Prisma.AssetCollectionWhereUniqueInput;
};
/**
 * AssetCollection findUniqueOrThrow
 */
export type AssetCollectionFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which AssetCollection to fetch.
     */
    where: Prisma.AssetCollectionWhereUniqueInput;
};
/**
 * AssetCollection findFirst
 */
export type AssetCollectionFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which AssetCollection to fetch.
     */
    where?: Prisma.AssetCollectionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of AssetCollections to fetch.
     */
    orderBy?: Prisma.AssetCollectionOrderByWithRelationInput | Prisma.AssetCollectionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for AssetCollections.
     */
    cursor?: Prisma.AssetCollectionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` AssetCollections from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` AssetCollections.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of AssetCollections.
     */
    distinct?: Prisma.AssetCollectionScalarFieldEnum | Prisma.AssetCollectionScalarFieldEnum[];
};
/**
 * AssetCollection findFirstOrThrow
 */
export type AssetCollectionFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which AssetCollection to fetch.
     */
    where?: Prisma.AssetCollectionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of AssetCollections to fetch.
     */
    orderBy?: Prisma.AssetCollectionOrderByWithRelationInput | Prisma.AssetCollectionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for AssetCollections.
     */
    cursor?: Prisma.AssetCollectionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` AssetCollections from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` AssetCollections.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of AssetCollections.
     */
    distinct?: Prisma.AssetCollectionScalarFieldEnum | Prisma.AssetCollectionScalarFieldEnum[];
};
/**
 * AssetCollection findMany
 */
export type AssetCollectionFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which AssetCollections to fetch.
     */
    where?: Prisma.AssetCollectionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of AssetCollections to fetch.
     */
    orderBy?: Prisma.AssetCollectionOrderByWithRelationInput | Prisma.AssetCollectionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing AssetCollections.
     */
    cursor?: Prisma.AssetCollectionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` AssetCollections from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` AssetCollections.
     */
    skip?: number;
    distinct?: Prisma.AssetCollectionScalarFieldEnum | Prisma.AssetCollectionScalarFieldEnum[];
};
/**
 * AssetCollection create
 */
export type AssetCollectionCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * The data needed to create a AssetCollection.
     */
    data: Prisma.XOR<Prisma.AssetCollectionCreateInput, Prisma.AssetCollectionUncheckedCreateInput>;
};
/**
 * AssetCollection createMany
 */
export type AssetCollectionCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many AssetCollections.
     */
    data: Prisma.AssetCollectionCreateManyInput | Prisma.AssetCollectionCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * AssetCollection createManyAndReturn
 */
export type AssetCollectionCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetCollection
     */
    select?: Prisma.AssetCollectionSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the AssetCollection
     */
    omit?: Prisma.AssetCollectionOmit<ExtArgs> | null;
    /**
     * The data used to create many AssetCollections.
     */
    data: Prisma.AssetCollectionCreateManyInput | Prisma.AssetCollectionCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * AssetCollection update
 */
export type AssetCollectionUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * The data needed to update a AssetCollection.
     */
    data: Prisma.XOR<Prisma.AssetCollectionUpdateInput, Prisma.AssetCollectionUncheckedUpdateInput>;
    /**
     * Choose, which AssetCollection to update.
     */
    where: Prisma.AssetCollectionWhereUniqueInput;
};
/**
 * AssetCollection updateMany
 */
export type AssetCollectionUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update AssetCollections.
     */
    data: Prisma.XOR<Prisma.AssetCollectionUpdateManyMutationInput, Prisma.AssetCollectionUncheckedUpdateManyInput>;
    /**
     * Filter which AssetCollections to update
     */
    where?: Prisma.AssetCollectionWhereInput;
    /**
     * Limit how many AssetCollections to update.
     */
    limit?: number;
};
/**
 * AssetCollection updateManyAndReturn
 */
export type AssetCollectionUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetCollection
     */
    select?: Prisma.AssetCollectionSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the AssetCollection
     */
    omit?: Prisma.AssetCollectionOmit<ExtArgs> | null;
    /**
     * The data used to update AssetCollections.
     */
    data: Prisma.XOR<Prisma.AssetCollectionUpdateManyMutationInput, Prisma.AssetCollectionUncheckedUpdateManyInput>;
    /**
     * Filter which AssetCollections to update
     */
    where?: Prisma.AssetCollectionWhereInput;
    /**
     * Limit how many AssetCollections to update.
     */
    limit?: number;
};
/**
 * AssetCollection upsert
 */
export type AssetCollectionUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * The filter to search for the AssetCollection to update in case it exists.
     */
    where: Prisma.AssetCollectionWhereUniqueInput;
    /**
     * In case the AssetCollection found by the `where` argument doesn't exist, create a new AssetCollection with this data.
     */
    create: Prisma.XOR<Prisma.AssetCollectionCreateInput, Prisma.AssetCollectionUncheckedCreateInput>;
    /**
     * In case the AssetCollection was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.AssetCollectionUpdateInput, Prisma.AssetCollectionUncheckedUpdateInput>;
};
/**
 * AssetCollection delete
 */
export type AssetCollectionDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter which AssetCollection to delete.
     */
    where: Prisma.AssetCollectionWhereUniqueInput;
};
/**
 * AssetCollection deleteMany
 */
export type AssetCollectionDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which AssetCollections to delete
     */
    where?: Prisma.AssetCollectionWhereInput;
    /**
     * Limit how many AssetCollections to delete.
     */
    limit?: number;
};
/**
 * AssetCollection.assets
 */
export type AssetCollection$assetsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
 * AssetCollection without action
 */
export type AssetCollectionDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
};
export {};
//# sourceMappingURL=AssetCollection.d.ts.map