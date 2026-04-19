import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model Property
 *
 */
export type PropertyModel = runtime.Types.Result.DefaultSelection<Prisma.$PropertyPayload>;
export type AggregateProperty = {
    _count: PropertyCountAggregateOutputType | null;
    _avg: PropertyAvgAggregateOutputType | null;
    _sum: PropertySumAggregateOutputType | null;
    _min: PropertyMinAggregateOutputType | null;
    _max: PropertyMaxAggregateOutputType | null;
};
export type PropertyAvgAggregateOutputType = {
    yearBuilt: number | null;
    areaSqft: number | null;
    totalValuation: number | null;
    pricePerShare: number | null;
    totalShares: number | null;
    availableShares: number | null;
    yieldPercent: runtime.Decimal | null;
    monthlyRental: number | null;
    operatingCosts: number | null;
    managementFeePct: runtime.Decimal | null;
    insuranceCost: number | null;
    capRate: runtime.Decimal | null;
    occupancyPct: number | null;
};
export type PropertySumAggregateOutputType = {
    yearBuilt: number | null;
    areaSqft: number | null;
    totalValuation: bigint | null;
    pricePerShare: number | null;
    totalShares: number | null;
    availableShares: number | null;
    yieldPercent: runtime.Decimal | null;
    monthlyRental: bigint | null;
    operatingCosts: bigint | null;
    managementFeePct: runtime.Decimal | null;
    insuranceCost: bigint | null;
    capRate: runtime.Decimal | null;
    occupancyPct: number | null;
};
export type PropertyMinAggregateOutputType = {
    id: string | null;
    ownerWallet: string | null;
    name: string | null;
    type: $Enums.PropertyType | null;
    tokenModel: $Enums.TokenModel | null;
    country: string | null;
    city: string | null;
    addressFull: string | null;
    description: string | null;
    yearBuilt: number | null;
    areaSqft: number | null;
    totalValuation: bigint | null;
    pricePerShare: number | null;
    totalShares: number | null;
    availableShares: number | null;
    yieldPercent: runtime.Decimal | null;
    monthlyRental: bigint | null;
    operatingCosts: bigint | null;
    managementFeePct: runtime.Decimal | null;
    insuranceCost: bigint | null;
    capRate: runtime.Decimal | null;
    occupancyPct: number | null;
    status: $Enums.PropertyStatus | null;
    mintAddress: string | null;
    metadataUri: string | null;
    collectionAddress: string | null;
    treasuryPda: string | null;
    coverImageUrl: string | null;
    isFeatured: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type PropertyMaxAggregateOutputType = {
    id: string | null;
    ownerWallet: string | null;
    name: string | null;
    type: $Enums.PropertyType | null;
    tokenModel: $Enums.TokenModel | null;
    country: string | null;
    city: string | null;
    addressFull: string | null;
    description: string | null;
    yearBuilt: number | null;
    areaSqft: number | null;
    totalValuation: bigint | null;
    pricePerShare: number | null;
    totalShares: number | null;
    availableShares: number | null;
    yieldPercent: runtime.Decimal | null;
    monthlyRental: bigint | null;
    operatingCosts: bigint | null;
    managementFeePct: runtime.Decimal | null;
    insuranceCost: bigint | null;
    capRate: runtime.Decimal | null;
    occupancyPct: number | null;
    status: $Enums.PropertyStatus | null;
    mintAddress: string | null;
    metadataUri: string | null;
    collectionAddress: string | null;
    treasuryPda: string | null;
    coverImageUrl: string | null;
    isFeatured: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type PropertyCountAggregateOutputType = {
    id: number;
    ownerWallet: number;
    name: number;
    type: number;
    tokenModel: number;
    country: number;
    city: number;
    addressFull: number;
    description: number;
    yearBuilt: number;
    areaSqft: number;
    totalValuation: number;
    pricePerShare: number;
    totalShares: number;
    availableShares: number;
    yieldPercent: number;
    monthlyRental: number;
    operatingCosts: number;
    managementFeePct: number;
    insuranceCost: number;
    capRate: number;
    occupancyPct: number;
    status: number;
    mintAddress: number;
    metadataUri: number;
    collectionAddress: number;
    treasuryPda: number;
    coverImageUrl: number;
    images: number;
    isFeatured: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type PropertyAvgAggregateInputType = {
    yearBuilt?: true;
    areaSqft?: true;
    totalValuation?: true;
    pricePerShare?: true;
    totalShares?: true;
    availableShares?: true;
    yieldPercent?: true;
    monthlyRental?: true;
    operatingCosts?: true;
    managementFeePct?: true;
    insuranceCost?: true;
    capRate?: true;
    occupancyPct?: true;
};
export type PropertySumAggregateInputType = {
    yearBuilt?: true;
    areaSqft?: true;
    totalValuation?: true;
    pricePerShare?: true;
    totalShares?: true;
    availableShares?: true;
    yieldPercent?: true;
    monthlyRental?: true;
    operatingCosts?: true;
    managementFeePct?: true;
    insuranceCost?: true;
    capRate?: true;
    occupancyPct?: true;
};
export type PropertyMinAggregateInputType = {
    id?: true;
    ownerWallet?: true;
    name?: true;
    type?: true;
    tokenModel?: true;
    country?: true;
    city?: true;
    addressFull?: true;
    description?: true;
    yearBuilt?: true;
    areaSqft?: true;
    totalValuation?: true;
    pricePerShare?: true;
    totalShares?: true;
    availableShares?: true;
    yieldPercent?: true;
    monthlyRental?: true;
    operatingCosts?: true;
    managementFeePct?: true;
    insuranceCost?: true;
    capRate?: true;
    occupancyPct?: true;
    status?: true;
    mintAddress?: true;
    metadataUri?: true;
    collectionAddress?: true;
    treasuryPda?: true;
    coverImageUrl?: true;
    isFeatured?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type PropertyMaxAggregateInputType = {
    id?: true;
    ownerWallet?: true;
    name?: true;
    type?: true;
    tokenModel?: true;
    country?: true;
    city?: true;
    addressFull?: true;
    description?: true;
    yearBuilt?: true;
    areaSqft?: true;
    totalValuation?: true;
    pricePerShare?: true;
    totalShares?: true;
    availableShares?: true;
    yieldPercent?: true;
    monthlyRental?: true;
    operatingCosts?: true;
    managementFeePct?: true;
    insuranceCost?: true;
    capRate?: true;
    occupancyPct?: true;
    status?: true;
    mintAddress?: true;
    metadataUri?: true;
    collectionAddress?: true;
    treasuryPda?: true;
    coverImageUrl?: true;
    isFeatured?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type PropertyCountAggregateInputType = {
    id?: true;
    ownerWallet?: true;
    name?: true;
    type?: true;
    tokenModel?: true;
    country?: true;
    city?: true;
    addressFull?: true;
    description?: true;
    yearBuilt?: true;
    areaSqft?: true;
    totalValuation?: true;
    pricePerShare?: true;
    totalShares?: true;
    availableShares?: true;
    yieldPercent?: true;
    monthlyRental?: true;
    operatingCosts?: true;
    managementFeePct?: true;
    insuranceCost?: true;
    capRate?: true;
    occupancyPct?: true;
    status?: true;
    mintAddress?: true;
    metadataUri?: true;
    collectionAddress?: true;
    treasuryPda?: true;
    coverImageUrl?: true;
    images?: true;
    isFeatured?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type PropertyAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which Property to aggregate.
     */
    where?: Prisma.PropertyWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Properties to fetch.
     */
    orderBy?: Prisma.PropertyOrderByWithRelationInput | Prisma.PropertyOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.PropertyWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Properties from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Properties.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Properties
    **/
    _count?: true | PropertyCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: PropertyAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: PropertySumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: PropertyMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: PropertyMaxAggregateInputType;
};
export type GetPropertyAggregateType<T extends PropertyAggregateArgs> = {
    [P in keyof T & keyof AggregateProperty]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateProperty[P]> : Prisma.GetScalarType<T[P], AggregateProperty[P]>;
};
export type PropertyGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PropertyWhereInput;
    orderBy?: Prisma.PropertyOrderByWithAggregationInput | Prisma.PropertyOrderByWithAggregationInput[];
    by: Prisma.PropertyScalarFieldEnum[] | Prisma.PropertyScalarFieldEnum;
    having?: Prisma.PropertyScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: PropertyCountAggregateInputType | true;
    _avg?: PropertyAvgAggregateInputType;
    _sum?: PropertySumAggregateInputType;
    _min?: PropertyMinAggregateInputType;
    _max?: PropertyMaxAggregateInputType;
};
export type PropertyGroupByOutputType = {
    id: string;
    ownerWallet: string;
    name: string;
    type: $Enums.PropertyType;
    tokenModel: $Enums.TokenModel;
    country: string;
    city: string | null;
    addressFull: string | null;
    description: string | null;
    yearBuilt: number | null;
    areaSqft: number | null;
    totalValuation: bigint | null;
    pricePerShare: number | null;
    totalShares: number | null;
    availableShares: number | null;
    yieldPercent: runtime.Decimal | null;
    monthlyRental: bigint | null;
    operatingCosts: bigint | null;
    managementFeePct: runtime.Decimal | null;
    insuranceCost: bigint | null;
    capRate: runtime.Decimal | null;
    occupancyPct: number | null;
    status: $Enums.PropertyStatus;
    mintAddress: string | null;
    metadataUri: string | null;
    collectionAddress: string | null;
    treasuryPda: string | null;
    coverImageUrl: string | null;
    images: string[];
    isFeatured: boolean;
    createdAt: Date;
    updatedAt: Date;
    _count: PropertyCountAggregateOutputType | null;
    _avg: PropertyAvgAggregateOutputType | null;
    _sum: PropertySumAggregateOutputType | null;
    _min: PropertyMinAggregateOutputType | null;
    _max: PropertyMaxAggregateOutputType | null;
};
type GetPropertyGroupByPayload<T extends PropertyGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<PropertyGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof PropertyGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], PropertyGroupByOutputType[P]> : Prisma.GetScalarType<T[P], PropertyGroupByOutputType[P]>;
}>>;
export type PropertyWhereInput = {
    AND?: Prisma.PropertyWhereInput | Prisma.PropertyWhereInput[];
    OR?: Prisma.PropertyWhereInput[];
    NOT?: Prisma.PropertyWhereInput | Prisma.PropertyWhereInput[];
    id?: Prisma.StringFilter<"Property"> | string;
    ownerWallet?: Prisma.StringFilter<"Property"> | string;
    name?: Prisma.StringFilter<"Property"> | string;
    type?: Prisma.EnumPropertyTypeFilter<"Property"> | $Enums.PropertyType;
    tokenModel?: Prisma.EnumTokenModelFilter<"Property"> | $Enums.TokenModel;
    country?: Prisma.StringFilter<"Property"> | string;
    city?: Prisma.StringNullableFilter<"Property"> | string | null;
    addressFull?: Prisma.StringNullableFilter<"Property"> | string | null;
    description?: Prisma.StringNullableFilter<"Property"> | string | null;
    yearBuilt?: Prisma.IntNullableFilter<"Property"> | number | null;
    areaSqft?: Prisma.IntNullableFilter<"Property"> | number | null;
    totalValuation?: Prisma.BigIntNullableFilter<"Property"> | bigint | number | null;
    pricePerShare?: Prisma.IntNullableFilter<"Property"> | number | null;
    totalShares?: Prisma.IntNullableFilter<"Property"> | number | null;
    availableShares?: Prisma.IntNullableFilter<"Property"> | number | null;
    yieldPercent?: Prisma.DecimalNullableFilter<"Property"> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    monthlyRental?: Prisma.BigIntNullableFilter<"Property"> | bigint | number | null;
    operatingCosts?: Prisma.BigIntNullableFilter<"Property"> | bigint | number | null;
    managementFeePct?: Prisma.DecimalNullableFilter<"Property"> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    insuranceCost?: Prisma.BigIntNullableFilter<"Property"> | bigint | number | null;
    capRate?: Prisma.DecimalNullableFilter<"Property"> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    occupancyPct?: Prisma.IntNullableFilter<"Property"> | number | null;
    status?: Prisma.EnumPropertyStatusFilter<"Property"> | $Enums.PropertyStatus;
    mintAddress?: Prisma.StringNullableFilter<"Property"> | string | null;
    metadataUri?: Prisma.StringNullableFilter<"Property"> | string | null;
    collectionAddress?: Prisma.StringNullableFilter<"Property"> | string | null;
    treasuryPda?: Prisma.StringNullableFilter<"Property"> | string | null;
    coverImageUrl?: Prisma.StringNullableFilter<"Property"> | string | null;
    images?: Prisma.StringNullableListFilter<"Property">;
    isFeatured?: Prisma.BoolFilter<"Property"> | boolean;
    createdAt?: Prisma.DateTimeFilter<"Property"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Property"> | Date | string;
    owner?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    investments?: Prisma.InvestmentListRelationFilter;
    transactions?: Prisma.TransactionListRelationFilter;
    yieldDistributions?: Prisma.YieldDistributionListRelationFilter;
    listingDrafts?: Prisma.ListingDraftListRelationFilter;
    yieldClaims?: Prisma.YieldClaimListRelationFilter;
};
export type PropertyOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    ownerWallet?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    tokenModel?: Prisma.SortOrder;
    country?: Prisma.SortOrder;
    city?: Prisma.SortOrderInput | Prisma.SortOrder;
    addressFull?: Prisma.SortOrderInput | Prisma.SortOrder;
    description?: Prisma.SortOrderInput | Prisma.SortOrder;
    yearBuilt?: Prisma.SortOrderInput | Prisma.SortOrder;
    areaSqft?: Prisma.SortOrderInput | Prisma.SortOrder;
    totalValuation?: Prisma.SortOrderInput | Prisma.SortOrder;
    pricePerShare?: Prisma.SortOrderInput | Prisma.SortOrder;
    totalShares?: Prisma.SortOrderInput | Prisma.SortOrder;
    availableShares?: Prisma.SortOrderInput | Prisma.SortOrder;
    yieldPercent?: Prisma.SortOrderInput | Prisma.SortOrder;
    monthlyRental?: Prisma.SortOrderInput | Prisma.SortOrder;
    operatingCosts?: Prisma.SortOrderInput | Prisma.SortOrder;
    managementFeePct?: Prisma.SortOrderInput | Prisma.SortOrder;
    insuranceCost?: Prisma.SortOrderInput | Prisma.SortOrder;
    capRate?: Prisma.SortOrderInput | Prisma.SortOrder;
    occupancyPct?: Prisma.SortOrderInput | Prisma.SortOrder;
    status?: Prisma.SortOrder;
    mintAddress?: Prisma.SortOrderInput | Prisma.SortOrder;
    metadataUri?: Prisma.SortOrderInput | Prisma.SortOrder;
    collectionAddress?: Prisma.SortOrderInput | Prisma.SortOrder;
    treasuryPda?: Prisma.SortOrderInput | Prisma.SortOrder;
    coverImageUrl?: Prisma.SortOrderInput | Prisma.SortOrder;
    images?: Prisma.SortOrder;
    isFeatured?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    owner?: Prisma.UserOrderByWithRelationInput;
    investments?: Prisma.InvestmentOrderByRelationAggregateInput;
    transactions?: Prisma.TransactionOrderByRelationAggregateInput;
    yieldDistributions?: Prisma.YieldDistributionOrderByRelationAggregateInput;
    listingDrafts?: Prisma.ListingDraftOrderByRelationAggregateInput;
    yieldClaims?: Prisma.YieldClaimOrderByRelationAggregateInput;
};
export type PropertyWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.PropertyWhereInput | Prisma.PropertyWhereInput[];
    OR?: Prisma.PropertyWhereInput[];
    NOT?: Prisma.PropertyWhereInput | Prisma.PropertyWhereInput[];
    ownerWallet?: Prisma.StringFilter<"Property"> | string;
    name?: Prisma.StringFilter<"Property"> | string;
    type?: Prisma.EnumPropertyTypeFilter<"Property"> | $Enums.PropertyType;
    tokenModel?: Prisma.EnumTokenModelFilter<"Property"> | $Enums.TokenModel;
    country?: Prisma.StringFilter<"Property"> | string;
    city?: Prisma.StringNullableFilter<"Property"> | string | null;
    addressFull?: Prisma.StringNullableFilter<"Property"> | string | null;
    description?: Prisma.StringNullableFilter<"Property"> | string | null;
    yearBuilt?: Prisma.IntNullableFilter<"Property"> | number | null;
    areaSqft?: Prisma.IntNullableFilter<"Property"> | number | null;
    totalValuation?: Prisma.BigIntNullableFilter<"Property"> | bigint | number | null;
    pricePerShare?: Prisma.IntNullableFilter<"Property"> | number | null;
    totalShares?: Prisma.IntNullableFilter<"Property"> | number | null;
    availableShares?: Prisma.IntNullableFilter<"Property"> | number | null;
    yieldPercent?: Prisma.DecimalNullableFilter<"Property"> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    monthlyRental?: Prisma.BigIntNullableFilter<"Property"> | bigint | number | null;
    operatingCosts?: Prisma.BigIntNullableFilter<"Property"> | bigint | number | null;
    managementFeePct?: Prisma.DecimalNullableFilter<"Property"> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    insuranceCost?: Prisma.BigIntNullableFilter<"Property"> | bigint | number | null;
    capRate?: Prisma.DecimalNullableFilter<"Property"> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    occupancyPct?: Prisma.IntNullableFilter<"Property"> | number | null;
    status?: Prisma.EnumPropertyStatusFilter<"Property"> | $Enums.PropertyStatus;
    mintAddress?: Prisma.StringNullableFilter<"Property"> | string | null;
    metadataUri?: Prisma.StringNullableFilter<"Property"> | string | null;
    collectionAddress?: Prisma.StringNullableFilter<"Property"> | string | null;
    treasuryPda?: Prisma.StringNullableFilter<"Property"> | string | null;
    coverImageUrl?: Prisma.StringNullableFilter<"Property"> | string | null;
    images?: Prisma.StringNullableListFilter<"Property">;
    isFeatured?: Prisma.BoolFilter<"Property"> | boolean;
    createdAt?: Prisma.DateTimeFilter<"Property"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Property"> | Date | string;
    owner?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    investments?: Prisma.InvestmentListRelationFilter;
    transactions?: Prisma.TransactionListRelationFilter;
    yieldDistributions?: Prisma.YieldDistributionListRelationFilter;
    listingDrafts?: Prisma.ListingDraftListRelationFilter;
    yieldClaims?: Prisma.YieldClaimListRelationFilter;
}, "id">;
export type PropertyOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    ownerWallet?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    tokenModel?: Prisma.SortOrder;
    country?: Prisma.SortOrder;
    city?: Prisma.SortOrderInput | Prisma.SortOrder;
    addressFull?: Prisma.SortOrderInput | Prisma.SortOrder;
    description?: Prisma.SortOrderInput | Prisma.SortOrder;
    yearBuilt?: Prisma.SortOrderInput | Prisma.SortOrder;
    areaSqft?: Prisma.SortOrderInput | Prisma.SortOrder;
    totalValuation?: Prisma.SortOrderInput | Prisma.SortOrder;
    pricePerShare?: Prisma.SortOrderInput | Prisma.SortOrder;
    totalShares?: Prisma.SortOrderInput | Prisma.SortOrder;
    availableShares?: Prisma.SortOrderInput | Prisma.SortOrder;
    yieldPercent?: Prisma.SortOrderInput | Prisma.SortOrder;
    monthlyRental?: Prisma.SortOrderInput | Prisma.SortOrder;
    operatingCosts?: Prisma.SortOrderInput | Prisma.SortOrder;
    managementFeePct?: Prisma.SortOrderInput | Prisma.SortOrder;
    insuranceCost?: Prisma.SortOrderInput | Prisma.SortOrder;
    capRate?: Prisma.SortOrderInput | Prisma.SortOrder;
    occupancyPct?: Prisma.SortOrderInput | Prisma.SortOrder;
    status?: Prisma.SortOrder;
    mintAddress?: Prisma.SortOrderInput | Prisma.SortOrder;
    metadataUri?: Prisma.SortOrderInput | Prisma.SortOrder;
    collectionAddress?: Prisma.SortOrderInput | Prisma.SortOrder;
    treasuryPda?: Prisma.SortOrderInput | Prisma.SortOrder;
    coverImageUrl?: Prisma.SortOrderInput | Prisma.SortOrder;
    images?: Prisma.SortOrder;
    isFeatured?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.PropertyCountOrderByAggregateInput;
    _avg?: Prisma.PropertyAvgOrderByAggregateInput;
    _max?: Prisma.PropertyMaxOrderByAggregateInput;
    _min?: Prisma.PropertyMinOrderByAggregateInput;
    _sum?: Prisma.PropertySumOrderByAggregateInput;
};
export type PropertyScalarWhereWithAggregatesInput = {
    AND?: Prisma.PropertyScalarWhereWithAggregatesInput | Prisma.PropertyScalarWhereWithAggregatesInput[];
    OR?: Prisma.PropertyScalarWhereWithAggregatesInput[];
    NOT?: Prisma.PropertyScalarWhereWithAggregatesInput | Prisma.PropertyScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"Property"> | string;
    ownerWallet?: Prisma.StringWithAggregatesFilter<"Property"> | string;
    name?: Prisma.StringWithAggregatesFilter<"Property"> | string;
    type?: Prisma.EnumPropertyTypeWithAggregatesFilter<"Property"> | $Enums.PropertyType;
    tokenModel?: Prisma.EnumTokenModelWithAggregatesFilter<"Property"> | $Enums.TokenModel;
    country?: Prisma.StringWithAggregatesFilter<"Property"> | string;
    city?: Prisma.StringNullableWithAggregatesFilter<"Property"> | string | null;
    addressFull?: Prisma.StringNullableWithAggregatesFilter<"Property"> | string | null;
    description?: Prisma.StringNullableWithAggregatesFilter<"Property"> | string | null;
    yearBuilt?: Prisma.IntNullableWithAggregatesFilter<"Property"> | number | null;
    areaSqft?: Prisma.IntNullableWithAggregatesFilter<"Property"> | number | null;
    totalValuation?: Prisma.BigIntNullableWithAggregatesFilter<"Property"> | bigint | number | null;
    pricePerShare?: Prisma.IntNullableWithAggregatesFilter<"Property"> | number | null;
    totalShares?: Prisma.IntNullableWithAggregatesFilter<"Property"> | number | null;
    availableShares?: Prisma.IntNullableWithAggregatesFilter<"Property"> | number | null;
    yieldPercent?: Prisma.DecimalNullableWithAggregatesFilter<"Property"> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    monthlyRental?: Prisma.BigIntNullableWithAggregatesFilter<"Property"> | bigint | number | null;
    operatingCosts?: Prisma.BigIntNullableWithAggregatesFilter<"Property"> | bigint | number | null;
    managementFeePct?: Prisma.DecimalNullableWithAggregatesFilter<"Property"> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    insuranceCost?: Prisma.BigIntNullableWithAggregatesFilter<"Property"> | bigint | number | null;
    capRate?: Prisma.DecimalNullableWithAggregatesFilter<"Property"> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    occupancyPct?: Prisma.IntNullableWithAggregatesFilter<"Property"> | number | null;
    status?: Prisma.EnumPropertyStatusWithAggregatesFilter<"Property"> | $Enums.PropertyStatus;
    mintAddress?: Prisma.StringNullableWithAggregatesFilter<"Property"> | string | null;
    metadataUri?: Prisma.StringNullableWithAggregatesFilter<"Property"> | string | null;
    collectionAddress?: Prisma.StringNullableWithAggregatesFilter<"Property"> | string | null;
    treasuryPda?: Prisma.StringNullableWithAggregatesFilter<"Property"> | string | null;
    coverImageUrl?: Prisma.StringNullableWithAggregatesFilter<"Property"> | string | null;
    images?: Prisma.StringNullableListFilter<"Property">;
    isFeatured?: Prisma.BoolWithAggregatesFilter<"Property"> | boolean;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Property"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"Property"> | Date | string;
};
export type PropertyCreateInput = {
    id?: string;
    name: string;
    type: $Enums.PropertyType;
    tokenModel: $Enums.TokenModel;
    country: string;
    city?: string | null;
    addressFull?: string | null;
    description?: string | null;
    yearBuilt?: number | null;
    areaSqft?: number | null;
    totalValuation?: bigint | number | null;
    pricePerShare?: number | null;
    totalShares?: number | null;
    availableShares?: number | null;
    yieldPercent?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    monthlyRental?: bigint | number | null;
    operatingCosts?: bigint | number | null;
    managementFeePct?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    insuranceCost?: bigint | number | null;
    capRate?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    occupancyPct?: number | null;
    status: $Enums.PropertyStatus;
    mintAddress?: string | null;
    metadataUri?: string | null;
    collectionAddress?: string | null;
    treasuryPda?: string | null;
    coverImageUrl?: string | null;
    images?: Prisma.PropertyCreateimagesInput | string[];
    isFeatured?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    owner: Prisma.UserCreateNestedOneWithoutPropertiesInput;
    investments?: Prisma.InvestmentCreateNestedManyWithoutPropertyInput;
    transactions?: Prisma.TransactionCreateNestedManyWithoutPropertyInput;
    yieldDistributions?: Prisma.YieldDistributionCreateNestedManyWithoutPropertyInput;
    listingDrafts?: Prisma.ListingDraftCreateNestedManyWithoutPropertyInput;
    yieldClaims?: Prisma.YieldClaimCreateNestedManyWithoutPropertyInput;
};
export type PropertyUncheckedCreateInput = {
    id?: string;
    ownerWallet: string;
    name: string;
    type: $Enums.PropertyType;
    tokenModel: $Enums.TokenModel;
    country: string;
    city?: string | null;
    addressFull?: string | null;
    description?: string | null;
    yearBuilt?: number | null;
    areaSqft?: number | null;
    totalValuation?: bigint | number | null;
    pricePerShare?: number | null;
    totalShares?: number | null;
    availableShares?: number | null;
    yieldPercent?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    monthlyRental?: bigint | number | null;
    operatingCosts?: bigint | number | null;
    managementFeePct?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    insuranceCost?: bigint | number | null;
    capRate?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    occupancyPct?: number | null;
    status: $Enums.PropertyStatus;
    mintAddress?: string | null;
    metadataUri?: string | null;
    collectionAddress?: string | null;
    treasuryPda?: string | null;
    coverImageUrl?: string | null;
    images?: Prisma.PropertyCreateimagesInput | string[];
    isFeatured?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    investments?: Prisma.InvestmentUncheckedCreateNestedManyWithoutPropertyInput;
    transactions?: Prisma.TransactionUncheckedCreateNestedManyWithoutPropertyInput;
    yieldDistributions?: Prisma.YieldDistributionUncheckedCreateNestedManyWithoutPropertyInput;
    listingDrafts?: Prisma.ListingDraftUncheckedCreateNestedManyWithoutPropertyInput;
    yieldClaims?: Prisma.YieldClaimUncheckedCreateNestedManyWithoutPropertyInput;
};
export type PropertyUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumPropertyTypeFieldUpdateOperationsInput | $Enums.PropertyType;
    tokenModel?: Prisma.EnumTokenModelFieldUpdateOperationsInput | $Enums.TokenModel;
    country?: Prisma.StringFieldUpdateOperationsInput | string;
    city?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    addressFull?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    yearBuilt?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    areaSqft?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    totalValuation?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    pricePerShare?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    totalShares?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    availableShares?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    yieldPercent?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    monthlyRental?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    operatingCosts?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    managementFeePct?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    insuranceCost?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    capRate?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    occupancyPct?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    status?: Prisma.EnumPropertyStatusFieldUpdateOperationsInput | $Enums.PropertyStatus;
    mintAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    metadataUri?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    collectionAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    treasuryPda?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    coverImageUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    images?: Prisma.PropertyUpdateimagesInput | string[];
    isFeatured?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    owner?: Prisma.UserUpdateOneRequiredWithoutPropertiesNestedInput;
    investments?: Prisma.InvestmentUpdateManyWithoutPropertyNestedInput;
    transactions?: Prisma.TransactionUpdateManyWithoutPropertyNestedInput;
    yieldDistributions?: Prisma.YieldDistributionUpdateManyWithoutPropertyNestedInput;
    listingDrafts?: Prisma.ListingDraftUpdateManyWithoutPropertyNestedInput;
    yieldClaims?: Prisma.YieldClaimUpdateManyWithoutPropertyNestedInput;
};
export type PropertyUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    ownerWallet?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumPropertyTypeFieldUpdateOperationsInput | $Enums.PropertyType;
    tokenModel?: Prisma.EnumTokenModelFieldUpdateOperationsInput | $Enums.TokenModel;
    country?: Prisma.StringFieldUpdateOperationsInput | string;
    city?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    addressFull?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    yearBuilt?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    areaSqft?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    totalValuation?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    pricePerShare?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    totalShares?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    availableShares?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    yieldPercent?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    monthlyRental?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    operatingCosts?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    managementFeePct?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    insuranceCost?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    capRate?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    occupancyPct?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    status?: Prisma.EnumPropertyStatusFieldUpdateOperationsInput | $Enums.PropertyStatus;
    mintAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    metadataUri?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    collectionAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    treasuryPda?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    coverImageUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    images?: Prisma.PropertyUpdateimagesInput | string[];
    isFeatured?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    investments?: Prisma.InvestmentUncheckedUpdateManyWithoutPropertyNestedInput;
    transactions?: Prisma.TransactionUncheckedUpdateManyWithoutPropertyNestedInput;
    yieldDistributions?: Prisma.YieldDistributionUncheckedUpdateManyWithoutPropertyNestedInput;
    listingDrafts?: Prisma.ListingDraftUncheckedUpdateManyWithoutPropertyNestedInput;
    yieldClaims?: Prisma.YieldClaimUncheckedUpdateManyWithoutPropertyNestedInput;
};
export type PropertyCreateManyInput = {
    id?: string;
    ownerWallet: string;
    name: string;
    type: $Enums.PropertyType;
    tokenModel: $Enums.TokenModel;
    country: string;
    city?: string | null;
    addressFull?: string | null;
    description?: string | null;
    yearBuilt?: number | null;
    areaSqft?: number | null;
    totalValuation?: bigint | number | null;
    pricePerShare?: number | null;
    totalShares?: number | null;
    availableShares?: number | null;
    yieldPercent?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    monthlyRental?: bigint | number | null;
    operatingCosts?: bigint | number | null;
    managementFeePct?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    insuranceCost?: bigint | number | null;
    capRate?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    occupancyPct?: number | null;
    status: $Enums.PropertyStatus;
    mintAddress?: string | null;
    metadataUri?: string | null;
    collectionAddress?: string | null;
    treasuryPda?: string | null;
    coverImageUrl?: string | null;
    images?: Prisma.PropertyCreateimagesInput | string[];
    isFeatured?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type PropertyUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumPropertyTypeFieldUpdateOperationsInput | $Enums.PropertyType;
    tokenModel?: Prisma.EnumTokenModelFieldUpdateOperationsInput | $Enums.TokenModel;
    country?: Prisma.StringFieldUpdateOperationsInput | string;
    city?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    addressFull?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    yearBuilt?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    areaSqft?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    totalValuation?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    pricePerShare?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    totalShares?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    availableShares?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    yieldPercent?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    monthlyRental?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    operatingCosts?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    managementFeePct?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    insuranceCost?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    capRate?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    occupancyPct?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    status?: Prisma.EnumPropertyStatusFieldUpdateOperationsInput | $Enums.PropertyStatus;
    mintAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    metadataUri?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    collectionAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    treasuryPda?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    coverImageUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    images?: Prisma.PropertyUpdateimagesInput | string[];
    isFeatured?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PropertyUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    ownerWallet?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumPropertyTypeFieldUpdateOperationsInput | $Enums.PropertyType;
    tokenModel?: Prisma.EnumTokenModelFieldUpdateOperationsInput | $Enums.TokenModel;
    country?: Prisma.StringFieldUpdateOperationsInput | string;
    city?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    addressFull?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    yearBuilt?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    areaSqft?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    totalValuation?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    pricePerShare?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    totalShares?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    availableShares?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    yieldPercent?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    monthlyRental?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    operatingCosts?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    managementFeePct?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    insuranceCost?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    capRate?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    occupancyPct?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    status?: Prisma.EnumPropertyStatusFieldUpdateOperationsInput | $Enums.PropertyStatus;
    mintAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    metadataUri?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    collectionAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    treasuryPda?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    coverImageUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    images?: Prisma.PropertyUpdateimagesInput | string[];
    isFeatured?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PropertyListRelationFilter = {
    every?: Prisma.PropertyWhereInput;
    some?: Prisma.PropertyWhereInput;
    none?: Prisma.PropertyWhereInput;
};
export type PropertyOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    has?: string | Prisma.StringFieldRefInput<$PrismaModel> | null;
    hasEvery?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    hasSome?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    isEmpty?: boolean;
};
export type PropertyCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    ownerWallet?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    tokenModel?: Prisma.SortOrder;
    country?: Prisma.SortOrder;
    city?: Prisma.SortOrder;
    addressFull?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    yearBuilt?: Prisma.SortOrder;
    areaSqft?: Prisma.SortOrder;
    totalValuation?: Prisma.SortOrder;
    pricePerShare?: Prisma.SortOrder;
    totalShares?: Prisma.SortOrder;
    availableShares?: Prisma.SortOrder;
    yieldPercent?: Prisma.SortOrder;
    monthlyRental?: Prisma.SortOrder;
    operatingCosts?: Prisma.SortOrder;
    managementFeePct?: Prisma.SortOrder;
    insuranceCost?: Prisma.SortOrder;
    capRate?: Prisma.SortOrder;
    occupancyPct?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    mintAddress?: Prisma.SortOrder;
    metadataUri?: Prisma.SortOrder;
    collectionAddress?: Prisma.SortOrder;
    treasuryPda?: Prisma.SortOrder;
    coverImageUrl?: Prisma.SortOrder;
    images?: Prisma.SortOrder;
    isFeatured?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type PropertyAvgOrderByAggregateInput = {
    yearBuilt?: Prisma.SortOrder;
    areaSqft?: Prisma.SortOrder;
    totalValuation?: Prisma.SortOrder;
    pricePerShare?: Prisma.SortOrder;
    totalShares?: Prisma.SortOrder;
    availableShares?: Prisma.SortOrder;
    yieldPercent?: Prisma.SortOrder;
    monthlyRental?: Prisma.SortOrder;
    operatingCosts?: Prisma.SortOrder;
    managementFeePct?: Prisma.SortOrder;
    insuranceCost?: Prisma.SortOrder;
    capRate?: Prisma.SortOrder;
    occupancyPct?: Prisma.SortOrder;
};
export type PropertyMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    ownerWallet?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    tokenModel?: Prisma.SortOrder;
    country?: Prisma.SortOrder;
    city?: Prisma.SortOrder;
    addressFull?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    yearBuilt?: Prisma.SortOrder;
    areaSqft?: Prisma.SortOrder;
    totalValuation?: Prisma.SortOrder;
    pricePerShare?: Prisma.SortOrder;
    totalShares?: Prisma.SortOrder;
    availableShares?: Prisma.SortOrder;
    yieldPercent?: Prisma.SortOrder;
    monthlyRental?: Prisma.SortOrder;
    operatingCosts?: Prisma.SortOrder;
    managementFeePct?: Prisma.SortOrder;
    insuranceCost?: Prisma.SortOrder;
    capRate?: Prisma.SortOrder;
    occupancyPct?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    mintAddress?: Prisma.SortOrder;
    metadataUri?: Prisma.SortOrder;
    collectionAddress?: Prisma.SortOrder;
    treasuryPda?: Prisma.SortOrder;
    coverImageUrl?: Prisma.SortOrder;
    isFeatured?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type PropertyMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    ownerWallet?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    tokenModel?: Prisma.SortOrder;
    country?: Prisma.SortOrder;
    city?: Prisma.SortOrder;
    addressFull?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    yearBuilt?: Prisma.SortOrder;
    areaSqft?: Prisma.SortOrder;
    totalValuation?: Prisma.SortOrder;
    pricePerShare?: Prisma.SortOrder;
    totalShares?: Prisma.SortOrder;
    availableShares?: Prisma.SortOrder;
    yieldPercent?: Prisma.SortOrder;
    monthlyRental?: Prisma.SortOrder;
    operatingCosts?: Prisma.SortOrder;
    managementFeePct?: Prisma.SortOrder;
    insuranceCost?: Prisma.SortOrder;
    capRate?: Prisma.SortOrder;
    occupancyPct?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    mintAddress?: Prisma.SortOrder;
    metadataUri?: Prisma.SortOrder;
    collectionAddress?: Prisma.SortOrder;
    treasuryPda?: Prisma.SortOrder;
    coverImageUrl?: Prisma.SortOrder;
    isFeatured?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type PropertySumOrderByAggregateInput = {
    yearBuilt?: Prisma.SortOrder;
    areaSqft?: Prisma.SortOrder;
    totalValuation?: Prisma.SortOrder;
    pricePerShare?: Prisma.SortOrder;
    totalShares?: Prisma.SortOrder;
    availableShares?: Prisma.SortOrder;
    yieldPercent?: Prisma.SortOrder;
    monthlyRental?: Prisma.SortOrder;
    operatingCosts?: Prisma.SortOrder;
    managementFeePct?: Prisma.SortOrder;
    insuranceCost?: Prisma.SortOrder;
    capRate?: Prisma.SortOrder;
    occupancyPct?: Prisma.SortOrder;
};
export type PropertyScalarRelationFilter = {
    is?: Prisma.PropertyWhereInput;
    isNot?: Prisma.PropertyWhereInput;
};
export type PropertyNullableScalarRelationFilter = {
    is?: Prisma.PropertyWhereInput | null;
    isNot?: Prisma.PropertyWhereInput | null;
};
export type PropertyCreateNestedManyWithoutOwnerInput = {
    create?: Prisma.XOR<Prisma.PropertyCreateWithoutOwnerInput, Prisma.PropertyUncheckedCreateWithoutOwnerInput> | Prisma.PropertyCreateWithoutOwnerInput[] | Prisma.PropertyUncheckedCreateWithoutOwnerInput[];
    connectOrCreate?: Prisma.PropertyCreateOrConnectWithoutOwnerInput | Prisma.PropertyCreateOrConnectWithoutOwnerInput[];
    createMany?: Prisma.PropertyCreateManyOwnerInputEnvelope;
    connect?: Prisma.PropertyWhereUniqueInput | Prisma.PropertyWhereUniqueInput[];
};
export type PropertyUncheckedCreateNestedManyWithoutOwnerInput = {
    create?: Prisma.XOR<Prisma.PropertyCreateWithoutOwnerInput, Prisma.PropertyUncheckedCreateWithoutOwnerInput> | Prisma.PropertyCreateWithoutOwnerInput[] | Prisma.PropertyUncheckedCreateWithoutOwnerInput[];
    connectOrCreate?: Prisma.PropertyCreateOrConnectWithoutOwnerInput | Prisma.PropertyCreateOrConnectWithoutOwnerInput[];
    createMany?: Prisma.PropertyCreateManyOwnerInputEnvelope;
    connect?: Prisma.PropertyWhereUniqueInput | Prisma.PropertyWhereUniqueInput[];
};
export type PropertyUpdateManyWithoutOwnerNestedInput = {
    create?: Prisma.XOR<Prisma.PropertyCreateWithoutOwnerInput, Prisma.PropertyUncheckedCreateWithoutOwnerInput> | Prisma.PropertyCreateWithoutOwnerInput[] | Prisma.PropertyUncheckedCreateWithoutOwnerInput[];
    connectOrCreate?: Prisma.PropertyCreateOrConnectWithoutOwnerInput | Prisma.PropertyCreateOrConnectWithoutOwnerInput[];
    upsert?: Prisma.PropertyUpsertWithWhereUniqueWithoutOwnerInput | Prisma.PropertyUpsertWithWhereUniqueWithoutOwnerInput[];
    createMany?: Prisma.PropertyCreateManyOwnerInputEnvelope;
    set?: Prisma.PropertyWhereUniqueInput | Prisma.PropertyWhereUniqueInput[];
    disconnect?: Prisma.PropertyWhereUniqueInput | Prisma.PropertyWhereUniqueInput[];
    delete?: Prisma.PropertyWhereUniqueInput | Prisma.PropertyWhereUniqueInput[];
    connect?: Prisma.PropertyWhereUniqueInput | Prisma.PropertyWhereUniqueInput[];
    update?: Prisma.PropertyUpdateWithWhereUniqueWithoutOwnerInput | Prisma.PropertyUpdateWithWhereUniqueWithoutOwnerInput[];
    updateMany?: Prisma.PropertyUpdateManyWithWhereWithoutOwnerInput | Prisma.PropertyUpdateManyWithWhereWithoutOwnerInput[];
    deleteMany?: Prisma.PropertyScalarWhereInput | Prisma.PropertyScalarWhereInput[];
};
export type PropertyUncheckedUpdateManyWithoutOwnerNestedInput = {
    create?: Prisma.XOR<Prisma.PropertyCreateWithoutOwnerInput, Prisma.PropertyUncheckedCreateWithoutOwnerInput> | Prisma.PropertyCreateWithoutOwnerInput[] | Prisma.PropertyUncheckedCreateWithoutOwnerInput[];
    connectOrCreate?: Prisma.PropertyCreateOrConnectWithoutOwnerInput | Prisma.PropertyCreateOrConnectWithoutOwnerInput[];
    upsert?: Prisma.PropertyUpsertWithWhereUniqueWithoutOwnerInput | Prisma.PropertyUpsertWithWhereUniqueWithoutOwnerInput[];
    createMany?: Prisma.PropertyCreateManyOwnerInputEnvelope;
    set?: Prisma.PropertyWhereUniqueInput | Prisma.PropertyWhereUniqueInput[];
    disconnect?: Prisma.PropertyWhereUniqueInput | Prisma.PropertyWhereUniqueInput[];
    delete?: Prisma.PropertyWhereUniqueInput | Prisma.PropertyWhereUniqueInput[];
    connect?: Prisma.PropertyWhereUniqueInput | Prisma.PropertyWhereUniqueInput[];
    update?: Prisma.PropertyUpdateWithWhereUniqueWithoutOwnerInput | Prisma.PropertyUpdateWithWhereUniqueWithoutOwnerInput[];
    updateMany?: Prisma.PropertyUpdateManyWithWhereWithoutOwnerInput | Prisma.PropertyUpdateManyWithWhereWithoutOwnerInput[];
    deleteMany?: Prisma.PropertyScalarWhereInput | Prisma.PropertyScalarWhereInput[];
};
export type PropertyCreateimagesInput = {
    set: string[];
};
export type EnumPropertyTypeFieldUpdateOperationsInput = {
    set?: $Enums.PropertyType;
};
export type EnumTokenModelFieldUpdateOperationsInput = {
    set?: $Enums.TokenModel;
};
export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
};
export type NullableBigIntFieldUpdateOperationsInput = {
    set?: bigint | number | null;
    increment?: bigint | number;
    decrement?: bigint | number;
    multiply?: bigint | number;
    divide?: bigint | number;
};
export type NullableDecimalFieldUpdateOperationsInput = {
    set?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    increment?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    decrement?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    multiply?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    divide?: runtime.Decimal | runtime.DecimalJsLike | number | string;
};
export type EnumPropertyStatusFieldUpdateOperationsInput = {
    set?: $Enums.PropertyStatus;
};
export type PropertyUpdateimagesInput = {
    set?: string[];
    push?: string | string[];
};
export type PropertyCreateNestedOneWithoutInvestmentsInput = {
    create?: Prisma.XOR<Prisma.PropertyCreateWithoutInvestmentsInput, Prisma.PropertyUncheckedCreateWithoutInvestmentsInput>;
    connectOrCreate?: Prisma.PropertyCreateOrConnectWithoutInvestmentsInput;
    connect?: Prisma.PropertyWhereUniqueInput;
};
export type PropertyUpdateOneRequiredWithoutInvestmentsNestedInput = {
    create?: Prisma.XOR<Prisma.PropertyCreateWithoutInvestmentsInput, Prisma.PropertyUncheckedCreateWithoutInvestmentsInput>;
    connectOrCreate?: Prisma.PropertyCreateOrConnectWithoutInvestmentsInput;
    upsert?: Prisma.PropertyUpsertWithoutInvestmentsInput;
    connect?: Prisma.PropertyWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.PropertyUpdateToOneWithWhereWithoutInvestmentsInput, Prisma.PropertyUpdateWithoutInvestmentsInput>, Prisma.PropertyUncheckedUpdateWithoutInvestmentsInput>;
};
export type PropertyCreateNestedOneWithoutTransactionsInput = {
    create?: Prisma.XOR<Prisma.PropertyCreateWithoutTransactionsInput, Prisma.PropertyUncheckedCreateWithoutTransactionsInput>;
    connectOrCreate?: Prisma.PropertyCreateOrConnectWithoutTransactionsInput;
    connect?: Prisma.PropertyWhereUniqueInput;
};
export type PropertyUpdateOneRequiredWithoutTransactionsNestedInput = {
    create?: Prisma.XOR<Prisma.PropertyCreateWithoutTransactionsInput, Prisma.PropertyUncheckedCreateWithoutTransactionsInput>;
    connectOrCreate?: Prisma.PropertyCreateOrConnectWithoutTransactionsInput;
    upsert?: Prisma.PropertyUpsertWithoutTransactionsInput;
    connect?: Prisma.PropertyWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.PropertyUpdateToOneWithWhereWithoutTransactionsInput, Prisma.PropertyUpdateWithoutTransactionsInput>, Prisma.PropertyUncheckedUpdateWithoutTransactionsInput>;
};
export type PropertyCreateNestedOneWithoutYieldDistributionsInput = {
    create?: Prisma.XOR<Prisma.PropertyCreateWithoutYieldDistributionsInput, Prisma.PropertyUncheckedCreateWithoutYieldDistributionsInput>;
    connectOrCreate?: Prisma.PropertyCreateOrConnectWithoutYieldDistributionsInput;
    connect?: Prisma.PropertyWhereUniqueInput;
};
export type PropertyUpdateOneRequiredWithoutYieldDistributionsNestedInput = {
    create?: Prisma.XOR<Prisma.PropertyCreateWithoutYieldDistributionsInput, Prisma.PropertyUncheckedCreateWithoutYieldDistributionsInput>;
    connectOrCreate?: Prisma.PropertyCreateOrConnectWithoutYieldDistributionsInput;
    upsert?: Prisma.PropertyUpsertWithoutYieldDistributionsInput;
    connect?: Prisma.PropertyWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.PropertyUpdateToOneWithWhereWithoutYieldDistributionsInput, Prisma.PropertyUpdateWithoutYieldDistributionsInput>, Prisma.PropertyUncheckedUpdateWithoutYieldDistributionsInput>;
};
export type PropertyCreateNestedOneWithoutYieldClaimsInput = {
    create?: Prisma.XOR<Prisma.PropertyCreateWithoutYieldClaimsInput, Prisma.PropertyUncheckedCreateWithoutYieldClaimsInput>;
    connectOrCreate?: Prisma.PropertyCreateOrConnectWithoutYieldClaimsInput;
    connect?: Prisma.PropertyWhereUniqueInput;
};
export type PropertyUpdateOneRequiredWithoutYieldClaimsNestedInput = {
    create?: Prisma.XOR<Prisma.PropertyCreateWithoutYieldClaimsInput, Prisma.PropertyUncheckedCreateWithoutYieldClaimsInput>;
    connectOrCreate?: Prisma.PropertyCreateOrConnectWithoutYieldClaimsInput;
    upsert?: Prisma.PropertyUpsertWithoutYieldClaimsInput;
    connect?: Prisma.PropertyWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.PropertyUpdateToOneWithWhereWithoutYieldClaimsInput, Prisma.PropertyUpdateWithoutYieldClaimsInput>, Prisma.PropertyUncheckedUpdateWithoutYieldClaimsInput>;
};
export type PropertyCreateNestedOneWithoutListingDraftsInput = {
    create?: Prisma.XOR<Prisma.PropertyCreateWithoutListingDraftsInput, Prisma.PropertyUncheckedCreateWithoutListingDraftsInput>;
    connectOrCreate?: Prisma.PropertyCreateOrConnectWithoutListingDraftsInput;
    connect?: Prisma.PropertyWhereUniqueInput;
};
export type PropertyUpdateOneWithoutListingDraftsNestedInput = {
    create?: Prisma.XOR<Prisma.PropertyCreateWithoutListingDraftsInput, Prisma.PropertyUncheckedCreateWithoutListingDraftsInput>;
    connectOrCreate?: Prisma.PropertyCreateOrConnectWithoutListingDraftsInput;
    upsert?: Prisma.PropertyUpsertWithoutListingDraftsInput;
    disconnect?: Prisma.PropertyWhereInput | boolean;
    delete?: Prisma.PropertyWhereInput | boolean;
    connect?: Prisma.PropertyWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.PropertyUpdateToOneWithWhereWithoutListingDraftsInput, Prisma.PropertyUpdateWithoutListingDraftsInput>, Prisma.PropertyUncheckedUpdateWithoutListingDraftsInput>;
};
export type PropertyCreateWithoutOwnerInput = {
    id?: string;
    name: string;
    type: $Enums.PropertyType;
    tokenModel: $Enums.TokenModel;
    country: string;
    city?: string | null;
    addressFull?: string | null;
    description?: string | null;
    yearBuilt?: number | null;
    areaSqft?: number | null;
    totalValuation?: bigint | number | null;
    pricePerShare?: number | null;
    totalShares?: number | null;
    availableShares?: number | null;
    yieldPercent?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    monthlyRental?: bigint | number | null;
    operatingCosts?: bigint | number | null;
    managementFeePct?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    insuranceCost?: bigint | number | null;
    capRate?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    occupancyPct?: number | null;
    status: $Enums.PropertyStatus;
    mintAddress?: string | null;
    metadataUri?: string | null;
    collectionAddress?: string | null;
    treasuryPda?: string | null;
    coverImageUrl?: string | null;
    images?: Prisma.PropertyCreateimagesInput | string[];
    isFeatured?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    investments?: Prisma.InvestmentCreateNestedManyWithoutPropertyInput;
    transactions?: Prisma.TransactionCreateNestedManyWithoutPropertyInput;
    yieldDistributions?: Prisma.YieldDistributionCreateNestedManyWithoutPropertyInput;
    listingDrafts?: Prisma.ListingDraftCreateNestedManyWithoutPropertyInput;
    yieldClaims?: Prisma.YieldClaimCreateNestedManyWithoutPropertyInput;
};
export type PropertyUncheckedCreateWithoutOwnerInput = {
    id?: string;
    name: string;
    type: $Enums.PropertyType;
    tokenModel: $Enums.TokenModel;
    country: string;
    city?: string | null;
    addressFull?: string | null;
    description?: string | null;
    yearBuilt?: number | null;
    areaSqft?: number | null;
    totalValuation?: bigint | number | null;
    pricePerShare?: number | null;
    totalShares?: number | null;
    availableShares?: number | null;
    yieldPercent?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    monthlyRental?: bigint | number | null;
    operatingCosts?: bigint | number | null;
    managementFeePct?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    insuranceCost?: bigint | number | null;
    capRate?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    occupancyPct?: number | null;
    status: $Enums.PropertyStatus;
    mintAddress?: string | null;
    metadataUri?: string | null;
    collectionAddress?: string | null;
    treasuryPda?: string | null;
    coverImageUrl?: string | null;
    images?: Prisma.PropertyCreateimagesInput | string[];
    isFeatured?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    investments?: Prisma.InvestmentUncheckedCreateNestedManyWithoutPropertyInput;
    transactions?: Prisma.TransactionUncheckedCreateNestedManyWithoutPropertyInput;
    yieldDistributions?: Prisma.YieldDistributionUncheckedCreateNestedManyWithoutPropertyInput;
    listingDrafts?: Prisma.ListingDraftUncheckedCreateNestedManyWithoutPropertyInput;
    yieldClaims?: Prisma.YieldClaimUncheckedCreateNestedManyWithoutPropertyInput;
};
export type PropertyCreateOrConnectWithoutOwnerInput = {
    where: Prisma.PropertyWhereUniqueInput;
    create: Prisma.XOR<Prisma.PropertyCreateWithoutOwnerInput, Prisma.PropertyUncheckedCreateWithoutOwnerInput>;
};
export type PropertyCreateManyOwnerInputEnvelope = {
    data: Prisma.PropertyCreateManyOwnerInput | Prisma.PropertyCreateManyOwnerInput[];
    skipDuplicates?: boolean;
};
export type PropertyUpsertWithWhereUniqueWithoutOwnerInput = {
    where: Prisma.PropertyWhereUniqueInput;
    update: Prisma.XOR<Prisma.PropertyUpdateWithoutOwnerInput, Prisma.PropertyUncheckedUpdateWithoutOwnerInput>;
    create: Prisma.XOR<Prisma.PropertyCreateWithoutOwnerInput, Prisma.PropertyUncheckedCreateWithoutOwnerInput>;
};
export type PropertyUpdateWithWhereUniqueWithoutOwnerInput = {
    where: Prisma.PropertyWhereUniqueInput;
    data: Prisma.XOR<Prisma.PropertyUpdateWithoutOwnerInput, Prisma.PropertyUncheckedUpdateWithoutOwnerInput>;
};
export type PropertyUpdateManyWithWhereWithoutOwnerInput = {
    where: Prisma.PropertyScalarWhereInput;
    data: Prisma.XOR<Prisma.PropertyUpdateManyMutationInput, Prisma.PropertyUncheckedUpdateManyWithoutOwnerInput>;
};
export type PropertyScalarWhereInput = {
    AND?: Prisma.PropertyScalarWhereInput | Prisma.PropertyScalarWhereInput[];
    OR?: Prisma.PropertyScalarWhereInput[];
    NOT?: Prisma.PropertyScalarWhereInput | Prisma.PropertyScalarWhereInput[];
    id?: Prisma.StringFilter<"Property"> | string;
    ownerWallet?: Prisma.StringFilter<"Property"> | string;
    name?: Prisma.StringFilter<"Property"> | string;
    type?: Prisma.EnumPropertyTypeFilter<"Property"> | $Enums.PropertyType;
    tokenModel?: Prisma.EnumTokenModelFilter<"Property"> | $Enums.TokenModel;
    country?: Prisma.StringFilter<"Property"> | string;
    city?: Prisma.StringNullableFilter<"Property"> | string | null;
    addressFull?: Prisma.StringNullableFilter<"Property"> | string | null;
    description?: Prisma.StringNullableFilter<"Property"> | string | null;
    yearBuilt?: Prisma.IntNullableFilter<"Property"> | number | null;
    areaSqft?: Prisma.IntNullableFilter<"Property"> | number | null;
    totalValuation?: Prisma.BigIntNullableFilter<"Property"> | bigint | number | null;
    pricePerShare?: Prisma.IntNullableFilter<"Property"> | number | null;
    totalShares?: Prisma.IntNullableFilter<"Property"> | number | null;
    availableShares?: Prisma.IntNullableFilter<"Property"> | number | null;
    yieldPercent?: Prisma.DecimalNullableFilter<"Property"> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    monthlyRental?: Prisma.BigIntNullableFilter<"Property"> | bigint | number | null;
    operatingCosts?: Prisma.BigIntNullableFilter<"Property"> | bigint | number | null;
    managementFeePct?: Prisma.DecimalNullableFilter<"Property"> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    insuranceCost?: Prisma.BigIntNullableFilter<"Property"> | bigint | number | null;
    capRate?: Prisma.DecimalNullableFilter<"Property"> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    occupancyPct?: Prisma.IntNullableFilter<"Property"> | number | null;
    status?: Prisma.EnumPropertyStatusFilter<"Property"> | $Enums.PropertyStatus;
    mintAddress?: Prisma.StringNullableFilter<"Property"> | string | null;
    metadataUri?: Prisma.StringNullableFilter<"Property"> | string | null;
    collectionAddress?: Prisma.StringNullableFilter<"Property"> | string | null;
    treasuryPda?: Prisma.StringNullableFilter<"Property"> | string | null;
    coverImageUrl?: Prisma.StringNullableFilter<"Property"> | string | null;
    images?: Prisma.StringNullableListFilter<"Property">;
    isFeatured?: Prisma.BoolFilter<"Property"> | boolean;
    createdAt?: Prisma.DateTimeFilter<"Property"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Property"> | Date | string;
};
export type PropertyCreateWithoutInvestmentsInput = {
    id?: string;
    name: string;
    type: $Enums.PropertyType;
    tokenModel: $Enums.TokenModel;
    country: string;
    city?: string | null;
    addressFull?: string | null;
    description?: string | null;
    yearBuilt?: number | null;
    areaSqft?: number | null;
    totalValuation?: bigint | number | null;
    pricePerShare?: number | null;
    totalShares?: number | null;
    availableShares?: number | null;
    yieldPercent?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    monthlyRental?: bigint | number | null;
    operatingCosts?: bigint | number | null;
    managementFeePct?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    insuranceCost?: bigint | number | null;
    capRate?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    occupancyPct?: number | null;
    status: $Enums.PropertyStatus;
    mintAddress?: string | null;
    metadataUri?: string | null;
    collectionAddress?: string | null;
    treasuryPda?: string | null;
    coverImageUrl?: string | null;
    images?: Prisma.PropertyCreateimagesInput | string[];
    isFeatured?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    owner: Prisma.UserCreateNestedOneWithoutPropertiesInput;
    transactions?: Prisma.TransactionCreateNestedManyWithoutPropertyInput;
    yieldDistributions?: Prisma.YieldDistributionCreateNestedManyWithoutPropertyInput;
    listingDrafts?: Prisma.ListingDraftCreateNestedManyWithoutPropertyInput;
    yieldClaims?: Prisma.YieldClaimCreateNestedManyWithoutPropertyInput;
};
export type PropertyUncheckedCreateWithoutInvestmentsInput = {
    id?: string;
    ownerWallet: string;
    name: string;
    type: $Enums.PropertyType;
    tokenModel: $Enums.TokenModel;
    country: string;
    city?: string | null;
    addressFull?: string | null;
    description?: string | null;
    yearBuilt?: number | null;
    areaSqft?: number | null;
    totalValuation?: bigint | number | null;
    pricePerShare?: number | null;
    totalShares?: number | null;
    availableShares?: number | null;
    yieldPercent?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    monthlyRental?: bigint | number | null;
    operatingCosts?: bigint | number | null;
    managementFeePct?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    insuranceCost?: bigint | number | null;
    capRate?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    occupancyPct?: number | null;
    status: $Enums.PropertyStatus;
    mintAddress?: string | null;
    metadataUri?: string | null;
    collectionAddress?: string | null;
    treasuryPda?: string | null;
    coverImageUrl?: string | null;
    images?: Prisma.PropertyCreateimagesInput | string[];
    isFeatured?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    transactions?: Prisma.TransactionUncheckedCreateNestedManyWithoutPropertyInput;
    yieldDistributions?: Prisma.YieldDistributionUncheckedCreateNestedManyWithoutPropertyInput;
    listingDrafts?: Prisma.ListingDraftUncheckedCreateNestedManyWithoutPropertyInput;
    yieldClaims?: Prisma.YieldClaimUncheckedCreateNestedManyWithoutPropertyInput;
};
export type PropertyCreateOrConnectWithoutInvestmentsInput = {
    where: Prisma.PropertyWhereUniqueInput;
    create: Prisma.XOR<Prisma.PropertyCreateWithoutInvestmentsInput, Prisma.PropertyUncheckedCreateWithoutInvestmentsInput>;
};
export type PropertyUpsertWithoutInvestmentsInput = {
    update: Prisma.XOR<Prisma.PropertyUpdateWithoutInvestmentsInput, Prisma.PropertyUncheckedUpdateWithoutInvestmentsInput>;
    create: Prisma.XOR<Prisma.PropertyCreateWithoutInvestmentsInput, Prisma.PropertyUncheckedCreateWithoutInvestmentsInput>;
    where?: Prisma.PropertyWhereInput;
};
export type PropertyUpdateToOneWithWhereWithoutInvestmentsInput = {
    where?: Prisma.PropertyWhereInput;
    data: Prisma.XOR<Prisma.PropertyUpdateWithoutInvestmentsInput, Prisma.PropertyUncheckedUpdateWithoutInvestmentsInput>;
};
export type PropertyUpdateWithoutInvestmentsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumPropertyTypeFieldUpdateOperationsInput | $Enums.PropertyType;
    tokenModel?: Prisma.EnumTokenModelFieldUpdateOperationsInput | $Enums.TokenModel;
    country?: Prisma.StringFieldUpdateOperationsInput | string;
    city?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    addressFull?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    yearBuilt?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    areaSqft?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    totalValuation?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    pricePerShare?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    totalShares?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    availableShares?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    yieldPercent?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    monthlyRental?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    operatingCosts?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    managementFeePct?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    insuranceCost?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    capRate?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    occupancyPct?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    status?: Prisma.EnumPropertyStatusFieldUpdateOperationsInput | $Enums.PropertyStatus;
    mintAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    metadataUri?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    collectionAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    treasuryPda?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    coverImageUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    images?: Prisma.PropertyUpdateimagesInput | string[];
    isFeatured?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    owner?: Prisma.UserUpdateOneRequiredWithoutPropertiesNestedInput;
    transactions?: Prisma.TransactionUpdateManyWithoutPropertyNestedInput;
    yieldDistributions?: Prisma.YieldDistributionUpdateManyWithoutPropertyNestedInput;
    listingDrafts?: Prisma.ListingDraftUpdateManyWithoutPropertyNestedInput;
    yieldClaims?: Prisma.YieldClaimUpdateManyWithoutPropertyNestedInput;
};
export type PropertyUncheckedUpdateWithoutInvestmentsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    ownerWallet?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumPropertyTypeFieldUpdateOperationsInput | $Enums.PropertyType;
    tokenModel?: Prisma.EnumTokenModelFieldUpdateOperationsInput | $Enums.TokenModel;
    country?: Prisma.StringFieldUpdateOperationsInput | string;
    city?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    addressFull?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    yearBuilt?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    areaSqft?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    totalValuation?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    pricePerShare?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    totalShares?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    availableShares?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    yieldPercent?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    monthlyRental?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    operatingCosts?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    managementFeePct?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    insuranceCost?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    capRate?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    occupancyPct?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    status?: Prisma.EnumPropertyStatusFieldUpdateOperationsInput | $Enums.PropertyStatus;
    mintAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    metadataUri?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    collectionAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    treasuryPda?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    coverImageUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    images?: Prisma.PropertyUpdateimagesInput | string[];
    isFeatured?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    transactions?: Prisma.TransactionUncheckedUpdateManyWithoutPropertyNestedInput;
    yieldDistributions?: Prisma.YieldDistributionUncheckedUpdateManyWithoutPropertyNestedInput;
    listingDrafts?: Prisma.ListingDraftUncheckedUpdateManyWithoutPropertyNestedInput;
    yieldClaims?: Prisma.YieldClaimUncheckedUpdateManyWithoutPropertyNestedInput;
};
export type PropertyCreateWithoutTransactionsInput = {
    id?: string;
    name: string;
    type: $Enums.PropertyType;
    tokenModel: $Enums.TokenModel;
    country: string;
    city?: string | null;
    addressFull?: string | null;
    description?: string | null;
    yearBuilt?: number | null;
    areaSqft?: number | null;
    totalValuation?: bigint | number | null;
    pricePerShare?: number | null;
    totalShares?: number | null;
    availableShares?: number | null;
    yieldPercent?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    monthlyRental?: bigint | number | null;
    operatingCosts?: bigint | number | null;
    managementFeePct?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    insuranceCost?: bigint | number | null;
    capRate?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    occupancyPct?: number | null;
    status: $Enums.PropertyStatus;
    mintAddress?: string | null;
    metadataUri?: string | null;
    collectionAddress?: string | null;
    treasuryPda?: string | null;
    coverImageUrl?: string | null;
    images?: Prisma.PropertyCreateimagesInput | string[];
    isFeatured?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    owner: Prisma.UserCreateNestedOneWithoutPropertiesInput;
    investments?: Prisma.InvestmentCreateNestedManyWithoutPropertyInput;
    yieldDistributions?: Prisma.YieldDistributionCreateNestedManyWithoutPropertyInput;
    listingDrafts?: Prisma.ListingDraftCreateNestedManyWithoutPropertyInput;
    yieldClaims?: Prisma.YieldClaimCreateNestedManyWithoutPropertyInput;
};
export type PropertyUncheckedCreateWithoutTransactionsInput = {
    id?: string;
    ownerWallet: string;
    name: string;
    type: $Enums.PropertyType;
    tokenModel: $Enums.TokenModel;
    country: string;
    city?: string | null;
    addressFull?: string | null;
    description?: string | null;
    yearBuilt?: number | null;
    areaSqft?: number | null;
    totalValuation?: bigint | number | null;
    pricePerShare?: number | null;
    totalShares?: number | null;
    availableShares?: number | null;
    yieldPercent?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    monthlyRental?: bigint | number | null;
    operatingCosts?: bigint | number | null;
    managementFeePct?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    insuranceCost?: bigint | number | null;
    capRate?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    occupancyPct?: number | null;
    status: $Enums.PropertyStatus;
    mintAddress?: string | null;
    metadataUri?: string | null;
    collectionAddress?: string | null;
    treasuryPda?: string | null;
    coverImageUrl?: string | null;
    images?: Prisma.PropertyCreateimagesInput | string[];
    isFeatured?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    investments?: Prisma.InvestmentUncheckedCreateNestedManyWithoutPropertyInput;
    yieldDistributions?: Prisma.YieldDistributionUncheckedCreateNestedManyWithoutPropertyInput;
    listingDrafts?: Prisma.ListingDraftUncheckedCreateNestedManyWithoutPropertyInput;
    yieldClaims?: Prisma.YieldClaimUncheckedCreateNestedManyWithoutPropertyInput;
};
export type PropertyCreateOrConnectWithoutTransactionsInput = {
    where: Prisma.PropertyWhereUniqueInput;
    create: Prisma.XOR<Prisma.PropertyCreateWithoutTransactionsInput, Prisma.PropertyUncheckedCreateWithoutTransactionsInput>;
};
export type PropertyUpsertWithoutTransactionsInput = {
    update: Prisma.XOR<Prisma.PropertyUpdateWithoutTransactionsInput, Prisma.PropertyUncheckedUpdateWithoutTransactionsInput>;
    create: Prisma.XOR<Prisma.PropertyCreateWithoutTransactionsInput, Prisma.PropertyUncheckedCreateWithoutTransactionsInput>;
    where?: Prisma.PropertyWhereInput;
};
export type PropertyUpdateToOneWithWhereWithoutTransactionsInput = {
    where?: Prisma.PropertyWhereInput;
    data: Prisma.XOR<Prisma.PropertyUpdateWithoutTransactionsInput, Prisma.PropertyUncheckedUpdateWithoutTransactionsInput>;
};
export type PropertyUpdateWithoutTransactionsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumPropertyTypeFieldUpdateOperationsInput | $Enums.PropertyType;
    tokenModel?: Prisma.EnumTokenModelFieldUpdateOperationsInput | $Enums.TokenModel;
    country?: Prisma.StringFieldUpdateOperationsInput | string;
    city?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    addressFull?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    yearBuilt?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    areaSqft?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    totalValuation?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    pricePerShare?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    totalShares?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    availableShares?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    yieldPercent?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    monthlyRental?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    operatingCosts?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    managementFeePct?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    insuranceCost?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    capRate?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    occupancyPct?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    status?: Prisma.EnumPropertyStatusFieldUpdateOperationsInput | $Enums.PropertyStatus;
    mintAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    metadataUri?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    collectionAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    treasuryPda?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    coverImageUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    images?: Prisma.PropertyUpdateimagesInput | string[];
    isFeatured?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    owner?: Prisma.UserUpdateOneRequiredWithoutPropertiesNestedInput;
    investments?: Prisma.InvestmentUpdateManyWithoutPropertyNestedInput;
    yieldDistributions?: Prisma.YieldDistributionUpdateManyWithoutPropertyNestedInput;
    listingDrafts?: Prisma.ListingDraftUpdateManyWithoutPropertyNestedInput;
    yieldClaims?: Prisma.YieldClaimUpdateManyWithoutPropertyNestedInput;
};
export type PropertyUncheckedUpdateWithoutTransactionsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    ownerWallet?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumPropertyTypeFieldUpdateOperationsInput | $Enums.PropertyType;
    tokenModel?: Prisma.EnumTokenModelFieldUpdateOperationsInput | $Enums.TokenModel;
    country?: Prisma.StringFieldUpdateOperationsInput | string;
    city?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    addressFull?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    yearBuilt?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    areaSqft?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    totalValuation?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    pricePerShare?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    totalShares?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    availableShares?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    yieldPercent?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    monthlyRental?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    operatingCosts?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    managementFeePct?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    insuranceCost?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    capRate?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    occupancyPct?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    status?: Prisma.EnumPropertyStatusFieldUpdateOperationsInput | $Enums.PropertyStatus;
    mintAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    metadataUri?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    collectionAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    treasuryPda?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    coverImageUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    images?: Prisma.PropertyUpdateimagesInput | string[];
    isFeatured?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    investments?: Prisma.InvestmentUncheckedUpdateManyWithoutPropertyNestedInput;
    yieldDistributions?: Prisma.YieldDistributionUncheckedUpdateManyWithoutPropertyNestedInput;
    listingDrafts?: Prisma.ListingDraftUncheckedUpdateManyWithoutPropertyNestedInput;
    yieldClaims?: Prisma.YieldClaimUncheckedUpdateManyWithoutPropertyNestedInput;
};
export type PropertyCreateWithoutYieldDistributionsInput = {
    id?: string;
    name: string;
    type: $Enums.PropertyType;
    tokenModel: $Enums.TokenModel;
    country: string;
    city?: string | null;
    addressFull?: string | null;
    description?: string | null;
    yearBuilt?: number | null;
    areaSqft?: number | null;
    totalValuation?: bigint | number | null;
    pricePerShare?: number | null;
    totalShares?: number | null;
    availableShares?: number | null;
    yieldPercent?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    monthlyRental?: bigint | number | null;
    operatingCosts?: bigint | number | null;
    managementFeePct?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    insuranceCost?: bigint | number | null;
    capRate?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    occupancyPct?: number | null;
    status: $Enums.PropertyStatus;
    mintAddress?: string | null;
    metadataUri?: string | null;
    collectionAddress?: string | null;
    treasuryPda?: string | null;
    coverImageUrl?: string | null;
    images?: Prisma.PropertyCreateimagesInput | string[];
    isFeatured?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    owner: Prisma.UserCreateNestedOneWithoutPropertiesInput;
    investments?: Prisma.InvestmentCreateNestedManyWithoutPropertyInput;
    transactions?: Prisma.TransactionCreateNestedManyWithoutPropertyInput;
    listingDrafts?: Prisma.ListingDraftCreateNestedManyWithoutPropertyInput;
    yieldClaims?: Prisma.YieldClaimCreateNestedManyWithoutPropertyInput;
};
export type PropertyUncheckedCreateWithoutYieldDistributionsInput = {
    id?: string;
    ownerWallet: string;
    name: string;
    type: $Enums.PropertyType;
    tokenModel: $Enums.TokenModel;
    country: string;
    city?: string | null;
    addressFull?: string | null;
    description?: string | null;
    yearBuilt?: number | null;
    areaSqft?: number | null;
    totalValuation?: bigint | number | null;
    pricePerShare?: number | null;
    totalShares?: number | null;
    availableShares?: number | null;
    yieldPercent?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    monthlyRental?: bigint | number | null;
    operatingCosts?: bigint | number | null;
    managementFeePct?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    insuranceCost?: bigint | number | null;
    capRate?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    occupancyPct?: number | null;
    status: $Enums.PropertyStatus;
    mintAddress?: string | null;
    metadataUri?: string | null;
    collectionAddress?: string | null;
    treasuryPda?: string | null;
    coverImageUrl?: string | null;
    images?: Prisma.PropertyCreateimagesInput | string[];
    isFeatured?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    investments?: Prisma.InvestmentUncheckedCreateNestedManyWithoutPropertyInput;
    transactions?: Prisma.TransactionUncheckedCreateNestedManyWithoutPropertyInput;
    listingDrafts?: Prisma.ListingDraftUncheckedCreateNestedManyWithoutPropertyInput;
    yieldClaims?: Prisma.YieldClaimUncheckedCreateNestedManyWithoutPropertyInput;
};
export type PropertyCreateOrConnectWithoutYieldDistributionsInput = {
    where: Prisma.PropertyWhereUniqueInput;
    create: Prisma.XOR<Prisma.PropertyCreateWithoutYieldDistributionsInput, Prisma.PropertyUncheckedCreateWithoutYieldDistributionsInput>;
};
export type PropertyUpsertWithoutYieldDistributionsInput = {
    update: Prisma.XOR<Prisma.PropertyUpdateWithoutYieldDistributionsInput, Prisma.PropertyUncheckedUpdateWithoutYieldDistributionsInput>;
    create: Prisma.XOR<Prisma.PropertyCreateWithoutYieldDistributionsInput, Prisma.PropertyUncheckedCreateWithoutYieldDistributionsInput>;
    where?: Prisma.PropertyWhereInput;
};
export type PropertyUpdateToOneWithWhereWithoutYieldDistributionsInput = {
    where?: Prisma.PropertyWhereInput;
    data: Prisma.XOR<Prisma.PropertyUpdateWithoutYieldDistributionsInput, Prisma.PropertyUncheckedUpdateWithoutYieldDistributionsInput>;
};
export type PropertyUpdateWithoutYieldDistributionsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumPropertyTypeFieldUpdateOperationsInput | $Enums.PropertyType;
    tokenModel?: Prisma.EnumTokenModelFieldUpdateOperationsInput | $Enums.TokenModel;
    country?: Prisma.StringFieldUpdateOperationsInput | string;
    city?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    addressFull?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    yearBuilt?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    areaSqft?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    totalValuation?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    pricePerShare?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    totalShares?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    availableShares?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    yieldPercent?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    monthlyRental?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    operatingCosts?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    managementFeePct?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    insuranceCost?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    capRate?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    occupancyPct?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    status?: Prisma.EnumPropertyStatusFieldUpdateOperationsInput | $Enums.PropertyStatus;
    mintAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    metadataUri?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    collectionAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    treasuryPda?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    coverImageUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    images?: Prisma.PropertyUpdateimagesInput | string[];
    isFeatured?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    owner?: Prisma.UserUpdateOneRequiredWithoutPropertiesNestedInput;
    investments?: Prisma.InvestmentUpdateManyWithoutPropertyNestedInput;
    transactions?: Prisma.TransactionUpdateManyWithoutPropertyNestedInput;
    listingDrafts?: Prisma.ListingDraftUpdateManyWithoutPropertyNestedInput;
    yieldClaims?: Prisma.YieldClaimUpdateManyWithoutPropertyNestedInput;
};
export type PropertyUncheckedUpdateWithoutYieldDistributionsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    ownerWallet?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumPropertyTypeFieldUpdateOperationsInput | $Enums.PropertyType;
    tokenModel?: Prisma.EnumTokenModelFieldUpdateOperationsInput | $Enums.TokenModel;
    country?: Prisma.StringFieldUpdateOperationsInput | string;
    city?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    addressFull?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    yearBuilt?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    areaSqft?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    totalValuation?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    pricePerShare?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    totalShares?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    availableShares?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    yieldPercent?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    monthlyRental?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    operatingCosts?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    managementFeePct?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    insuranceCost?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    capRate?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    occupancyPct?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    status?: Prisma.EnumPropertyStatusFieldUpdateOperationsInput | $Enums.PropertyStatus;
    mintAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    metadataUri?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    collectionAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    treasuryPda?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    coverImageUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    images?: Prisma.PropertyUpdateimagesInput | string[];
    isFeatured?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    investments?: Prisma.InvestmentUncheckedUpdateManyWithoutPropertyNestedInput;
    transactions?: Prisma.TransactionUncheckedUpdateManyWithoutPropertyNestedInput;
    listingDrafts?: Prisma.ListingDraftUncheckedUpdateManyWithoutPropertyNestedInput;
    yieldClaims?: Prisma.YieldClaimUncheckedUpdateManyWithoutPropertyNestedInput;
};
export type PropertyCreateWithoutYieldClaimsInput = {
    id?: string;
    name: string;
    type: $Enums.PropertyType;
    tokenModel: $Enums.TokenModel;
    country: string;
    city?: string | null;
    addressFull?: string | null;
    description?: string | null;
    yearBuilt?: number | null;
    areaSqft?: number | null;
    totalValuation?: bigint | number | null;
    pricePerShare?: number | null;
    totalShares?: number | null;
    availableShares?: number | null;
    yieldPercent?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    monthlyRental?: bigint | number | null;
    operatingCosts?: bigint | number | null;
    managementFeePct?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    insuranceCost?: bigint | number | null;
    capRate?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    occupancyPct?: number | null;
    status: $Enums.PropertyStatus;
    mintAddress?: string | null;
    metadataUri?: string | null;
    collectionAddress?: string | null;
    treasuryPda?: string | null;
    coverImageUrl?: string | null;
    images?: Prisma.PropertyCreateimagesInput | string[];
    isFeatured?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    owner: Prisma.UserCreateNestedOneWithoutPropertiesInput;
    investments?: Prisma.InvestmentCreateNestedManyWithoutPropertyInput;
    transactions?: Prisma.TransactionCreateNestedManyWithoutPropertyInput;
    yieldDistributions?: Prisma.YieldDistributionCreateNestedManyWithoutPropertyInput;
    listingDrafts?: Prisma.ListingDraftCreateNestedManyWithoutPropertyInput;
};
export type PropertyUncheckedCreateWithoutYieldClaimsInput = {
    id?: string;
    ownerWallet: string;
    name: string;
    type: $Enums.PropertyType;
    tokenModel: $Enums.TokenModel;
    country: string;
    city?: string | null;
    addressFull?: string | null;
    description?: string | null;
    yearBuilt?: number | null;
    areaSqft?: number | null;
    totalValuation?: bigint | number | null;
    pricePerShare?: number | null;
    totalShares?: number | null;
    availableShares?: number | null;
    yieldPercent?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    monthlyRental?: bigint | number | null;
    operatingCosts?: bigint | number | null;
    managementFeePct?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    insuranceCost?: bigint | number | null;
    capRate?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    occupancyPct?: number | null;
    status: $Enums.PropertyStatus;
    mintAddress?: string | null;
    metadataUri?: string | null;
    collectionAddress?: string | null;
    treasuryPda?: string | null;
    coverImageUrl?: string | null;
    images?: Prisma.PropertyCreateimagesInput | string[];
    isFeatured?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    investments?: Prisma.InvestmentUncheckedCreateNestedManyWithoutPropertyInput;
    transactions?: Prisma.TransactionUncheckedCreateNestedManyWithoutPropertyInput;
    yieldDistributions?: Prisma.YieldDistributionUncheckedCreateNestedManyWithoutPropertyInput;
    listingDrafts?: Prisma.ListingDraftUncheckedCreateNestedManyWithoutPropertyInput;
};
export type PropertyCreateOrConnectWithoutYieldClaimsInput = {
    where: Prisma.PropertyWhereUniqueInput;
    create: Prisma.XOR<Prisma.PropertyCreateWithoutYieldClaimsInput, Prisma.PropertyUncheckedCreateWithoutYieldClaimsInput>;
};
export type PropertyUpsertWithoutYieldClaimsInput = {
    update: Prisma.XOR<Prisma.PropertyUpdateWithoutYieldClaimsInput, Prisma.PropertyUncheckedUpdateWithoutYieldClaimsInput>;
    create: Prisma.XOR<Prisma.PropertyCreateWithoutYieldClaimsInput, Prisma.PropertyUncheckedCreateWithoutYieldClaimsInput>;
    where?: Prisma.PropertyWhereInput;
};
export type PropertyUpdateToOneWithWhereWithoutYieldClaimsInput = {
    where?: Prisma.PropertyWhereInput;
    data: Prisma.XOR<Prisma.PropertyUpdateWithoutYieldClaimsInput, Prisma.PropertyUncheckedUpdateWithoutYieldClaimsInput>;
};
export type PropertyUpdateWithoutYieldClaimsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumPropertyTypeFieldUpdateOperationsInput | $Enums.PropertyType;
    tokenModel?: Prisma.EnumTokenModelFieldUpdateOperationsInput | $Enums.TokenModel;
    country?: Prisma.StringFieldUpdateOperationsInput | string;
    city?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    addressFull?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    yearBuilt?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    areaSqft?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    totalValuation?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    pricePerShare?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    totalShares?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    availableShares?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    yieldPercent?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    monthlyRental?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    operatingCosts?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    managementFeePct?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    insuranceCost?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    capRate?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    occupancyPct?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    status?: Prisma.EnumPropertyStatusFieldUpdateOperationsInput | $Enums.PropertyStatus;
    mintAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    metadataUri?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    collectionAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    treasuryPda?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    coverImageUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    images?: Prisma.PropertyUpdateimagesInput | string[];
    isFeatured?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    owner?: Prisma.UserUpdateOneRequiredWithoutPropertiesNestedInput;
    investments?: Prisma.InvestmentUpdateManyWithoutPropertyNestedInput;
    transactions?: Prisma.TransactionUpdateManyWithoutPropertyNestedInput;
    yieldDistributions?: Prisma.YieldDistributionUpdateManyWithoutPropertyNestedInput;
    listingDrafts?: Prisma.ListingDraftUpdateManyWithoutPropertyNestedInput;
};
export type PropertyUncheckedUpdateWithoutYieldClaimsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    ownerWallet?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumPropertyTypeFieldUpdateOperationsInput | $Enums.PropertyType;
    tokenModel?: Prisma.EnumTokenModelFieldUpdateOperationsInput | $Enums.TokenModel;
    country?: Prisma.StringFieldUpdateOperationsInput | string;
    city?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    addressFull?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    yearBuilt?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    areaSqft?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    totalValuation?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    pricePerShare?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    totalShares?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    availableShares?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    yieldPercent?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    monthlyRental?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    operatingCosts?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    managementFeePct?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    insuranceCost?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    capRate?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    occupancyPct?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    status?: Prisma.EnumPropertyStatusFieldUpdateOperationsInput | $Enums.PropertyStatus;
    mintAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    metadataUri?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    collectionAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    treasuryPda?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    coverImageUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    images?: Prisma.PropertyUpdateimagesInput | string[];
    isFeatured?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    investments?: Prisma.InvestmentUncheckedUpdateManyWithoutPropertyNestedInput;
    transactions?: Prisma.TransactionUncheckedUpdateManyWithoutPropertyNestedInput;
    yieldDistributions?: Prisma.YieldDistributionUncheckedUpdateManyWithoutPropertyNestedInput;
    listingDrafts?: Prisma.ListingDraftUncheckedUpdateManyWithoutPropertyNestedInput;
};
export type PropertyCreateWithoutListingDraftsInput = {
    id?: string;
    name: string;
    type: $Enums.PropertyType;
    tokenModel: $Enums.TokenModel;
    country: string;
    city?: string | null;
    addressFull?: string | null;
    description?: string | null;
    yearBuilt?: number | null;
    areaSqft?: number | null;
    totalValuation?: bigint | number | null;
    pricePerShare?: number | null;
    totalShares?: number | null;
    availableShares?: number | null;
    yieldPercent?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    monthlyRental?: bigint | number | null;
    operatingCosts?: bigint | number | null;
    managementFeePct?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    insuranceCost?: bigint | number | null;
    capRate?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    occupancyPct?: number | null;
    status: $Enums.PropertyStatus;
    mintAddress?: string | null;
    metadataUri?: string | null;
    collectionAddress?: string | null;
    treasuryPda?: string | null;
    coverImageUrl?: string | null;
    images?: Prisma.PropertyCreateimagesInput | string[];
    isFeatured?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    owner: Prisma.UserCreateNestedOneWithoutPropertiesInput;
    investments?: Prisma.InvestmentCreateNestedManyWithoutPropertyInput;
    transactions?: Prisma.TransactionCreateNestedManyWithoutPropertyInput;
    yieldDistributions?: Prisma.YieldDistributionCreateNestedManyWithoutPropertyInput;
    yieldClaims?: Prisma.YieldClaimCreateNestedManyWithoutPropertyInput;
};
export type PropertyUncheckedCreateWithoutListingDraftsInput = {
    id?: string;
    ownerWallet: string;
    name: string;
    type: $Enums.PropertyType;
    tokenModel: $Enums.TokenModel;
    country: string;
    city?: string | null;
    addressFull?: string | null;
    description?: string | null;
    yearBuilt?: number | null;
    areaSqft?: number | null;
    totalValuation?: bigint | number | null;
    pricePerShare?: number | null;
    totalShares?: number | null;
    availableShares?: number | null;
    yieldPercent?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    monthlyRental?: bigint | number | null;
    operatingCosts?: bigint | number | null;
    managementFeePct?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    insuranceCost?: bigint | number | null;
    capRate?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    occupancyPct?: number | null;
    status: $Enums.PropertyStatus;
    mintAddress?: string | null;
    metadataUri?: string | null;
    collectionAddress?: string | null;
    treasuryPda?: string | null;
    coverImageUrl?: string | null;
    images?: Prisma.PropertyCreateimagesInput | string[];
    isFeatured?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    investments?: Prisma.InvestmentUncheckedCreateNestedManyWithoutPropertyInput;
    transactions?: Prisma.TransactionUncheckedCreateNestedManyWithoutPropertyInput;
    yieldDistributions?: Prisma.YieldDistributionUncheckedCreateNestedManyWithoutPropertyInput;
    yieldClaims?: Prisma.YieldClaimUncheckedCreateNestedManyWithoutPropertyInput;
};
export type PropertyCreateOrConnectWithoutListingDraftsInput = {
    where: Prisma.PropertyWhereUniqueInput;
    create: Prisma.XOR<Prisma.PropertyCreateWithoutListingDraftsInput, Prisma.PropertyUncheckedCreateWithoutListingDraftsInput>;
};
export type PropertyUpsertWithoutListingDraftsInput = {
    update: Prisma.XOR<Prisma.PropertyUpdateWithoutListingDraftsInput, Prisma.PropertyUncheckedUpdateWithoutListingDraftsInput>;
    create: Prisma.XOR<Prisma.PropertyCreateWithoutListingDraftsInput, Prisma.PropertyUncheckedCreateWithoutListingDraftsInput>;
    where?: Prisma.PropertyWhereInput;
};
export type PropertyUpdateToOneWithWhereWithoutListingDraftsInput = {
    where?: Prisma.PropertyWhereInput;
    data: Prisma.XOR<Prisma.PropertyUpdateWithoutListingDraftsInput, Prisma.PropertyUncheckedUpdateWithoutListingDraftsInput>;
};
export type PropertyUpdateWithoutListingDraftsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumPropertyTypeFieldUpdateOperationsInput | $Enums.PropertyType;
    tokenModel?: Prisma.EnumTokenModelFieldUpdateOperationsInput | $Enums.TokenModel;
    country?: Prisma.StringFieldUpdateOperationsInput | string;
    city?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    addressFull?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    yearBuilt?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    areaSqft?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    totalValuation?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    pricePerShare?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    totalShares?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    availableShares?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    yieldPercent?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    monthlyRental?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    operatingCosts?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    managementFeePct?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    insuranceCost?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    capRate?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    occupancyPct?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    status?: Prisma.EnumPropertyStatusFieldUpdateOperationsInput | $Enums.PropertyStatus;
    mintAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    metadataUri?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    collectionAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    treasuryPda?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    coverImageUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    images?: Prisma.PropertyUpdateimagesInput | string[];
    isFeatured?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    owner?: Prisma.UserUpdateOneRequiredWithoutPropertiesNestedInput;
    investments?: Prisma.InvestmentUpdateManyWithoutPropertyNestedInput;
    transactions?: Prisma.TransactionUpdateManyWithoutPropertyNestedInput;
    yieldDistributions?: Prisma.YieldDistributionUpdateManyWithoutPropertyNestedInput;
    yieldClaims?: Prisma.YieldClaimUpdateManyWithoutPropertyNestedInput;
};
export type PropertyUncheckedUpdateWithoutListingDraftsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    ownerWallet?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumPropertyTypeFieldUpdateOperationsInput | $Enums.PropertyType;
    tokenModel?: Prisma.EnumTokenModelFieldUpdateOperationsInput | $Enums.TokenModel;
    country?: Prisma.StringFieldUpdateOperationsInput | string;
    city?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    addressFull?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    yearBuilt?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    areaSqft?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    totalValuation?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    pricePerShare?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    totalShares?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    availableShares?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    yieldPercent?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    monthlyRental?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    operatingCosts?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    managementFeePct?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    insuranceCost?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    capRate?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    occupancyPct?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    status?: Prisma.EnumPropertyStatusFieldUpdateOperationsInput | $Enums.PropertyStatus;
    mintAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    metadataUri?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    collectionAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    treasuryPda?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    coverImageUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    images?: Prisma.PropertyUpdateimagesInput | string[];
    isFeatured?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    investments?: Prisma.InvestmentUncheckedUpdateManyWithoutPropertyNestedInput;
    transactions?: Prisma.TransactionUncheckedUpdateManyWithoutPropertyNestedInput;
    yieldDistributions?: Prisma.YieldDistributionUncheckedUpdateManyWithoutPropertyNestedInput;
    yieldClaims?: Prisma.YieldClaimUncheckedUpdateManyWithoutPropertyNestedInput;
};
export type PropertyCreateManyOwnerInput = {
    id?: string;
    name: string;
    type: $Enums.PropertyType;
    tokenModel: $Enums.TokenModel;
    country: string;
    city?: string | null;
    addressFull?: string | null;
    description?: string | null;
    yearBuilt?: number | null;
    areaSqft?: number | null;
    totalValuation?: bigint | number | null;
    pricePerShare?: number | null;
    totalShares?: number | null;
    availableShares?: number | null;
    yieldPercent?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    monthlyRental?: bigint | number | null;
    operatingCosts?: bigint | number | null;
    managementFeePct?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    insuranceCost?: bigint | number | null;
    capRate?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    occupancyPct?: number | null;
    status: $Enums.PropertyStatus;
    mintAddress?: string | null;
    metadataUri?: string | null;
    collectionAddress?: string | null;
    treasuryPda?: string | null;
    coverImageUrl?: string | null;
    images?: Prisma.PropertyCreateimagesInput | string[];
    isFeatured?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type PropertyUpdateWithoutOwnerInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumPropertyTypeFieldUpdateOperationsInput | $Enums.PropertyType;
    tokenModel?: Prisma.EnumTokenModelFieldUpdateOperationsInput | $Enums.TokenModel;
    country?: Prisma.StringFieldUpdateOperationsInput | string;
    city?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    addressFull?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    yearBuilt?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    areaSqft?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    totalValuation?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    pricePerShare?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    totalShares?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    availableShares?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    yieldPercent?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    monthlyRental?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    operatingCosts?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    managementFeePct?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    insuranceCost?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    capRate?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    occupancyPct?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    status?: Prisma.EnumPropertyStatusFieldUpdateOperationsInput | $Enums.PropertyStatus;
    mintAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    metadataUri?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    collectionAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    treasuryPda?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    coverImageUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    images?: Prisma.PropertyUpdateimagesInput | string[];
    isFeatured?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    investments?: Prisma.InvestmentUpdateManyWithoutPropertyNestedInput;
    transactions?: Prisma.TransactionUpdateManyWithoutPropertyNestedInput;
    yieldDistributions?: Prisma.YieldDistributionUpdateManyWithoutPropertyNestedInput;
    listingDrafts?: Prisma.ListingDraftUpdateManyWithoutPropertyNestedInput;
    yieldClaims?: Prisma.YieldClaimUpdateManyWithoutPropertyNestedInput;
};
export type PropertyUncheckedUpdateWithoutOwnerInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumPropertyTypeFieldUpdateOperationsInput | $Enums.PropertyType;
    tokenModel?: Prisma.EnumTokenModelFieldUpdateOperationsInput | $Enums.TokenModel;
    country?: Prisma.StringFieldUpdateOperationsInput | string;
    city?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    addressFull?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    yearBuilt?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    areaSqft?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    totalValuation?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    pricePerShare?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    totalShares?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    availableShares?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    yieldPercent?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    monthlyRental?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    operatingCosts?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    managementFeePct?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    insuranceCost?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    capRate?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    occupancyPct?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    status?: Prisma.EnumPropertyStatusFieldUpdateOperationsInput | $Enums.PropertyStatus;
    mintAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    metadataUri?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    collectionAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    treasuryPda?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    coverImageUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    images?: Prisma.PropertyUpdateimagesInput | string[];
    isFeatured?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    investments?: Prisma.InvestmentUncheckedUpdateManyWithoutPropertyNestedInput;
    transactions?: Prisma.TransactionUncheckedUpdateManyWithoutPropertyNestedInput;
    yieldDistributions?: Prisma.YieldDistributionUncheckedUpdateManyWithoutPropertyNestedInput;
    listingDrafts?: Prisma.ListingDraftUncheckedUpdateManyWithoutPropertyNestedInput;
    yieldClaims?: Prisma.YieldClaimUncheckedUpdateManyWithoutPropertyNestedInput;
};
export type PropertyUncheckedUpdateManyWithoutOwnerInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumPropertyTypeFieldUpdateOperationsInput | $Enums.PropertyType;
    tokenModel?: Prisma.EnumTokenModelFieldUpdateOperationsInput | $Enums.TokenModel;
    country?: Prisma.StringFieldUpdateOperationsInput | string;
    city?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    addressFull?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    yearBuilt?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    areaSqft?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    totalValuation?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    pricePerShare?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    totalShares?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    availableShares?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    yieldPercent?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    monthlyRental?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    operatingCosts?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    managementFeePct?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    insuranceCost?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    capRate?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    occupancyPct?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    status?: Prisma.EnumPropertyStatusFieldUpdateOperationsInput | $Enums.PropertyStatus;
    mintAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    metadataUri?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    collectionAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    treasuryPda?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    coverImageUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    images?: Prisma.PropertyUpdateimagesInput | string[];
    isFeatured?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
/**
 * Count Type PropertyCountOutputType
 */
export type PropertyCountOutputType = {
    investments: number;
    transactions: number;
    yieldDistributions: number;
    listingDrafts: number;
    yieldClaims: number;
};
export type PropertyCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    investments?: boolean | PropertyCountOutputTypeCountInvestmentsArgs;
    transactions?: boolean | PropertyCountOutputTypeCountTransactionsArgs;
    yieldDistributions?: boolean | PropertyCountOutputTypeCountYieldDistributionsArgs;
    listingDrafts?: boolean | PropertyCountOutputTypeCountListingDraftsArgs;
    yieldClaims?: boolean | PropertyCountOutputTypeCountYieldClaimsArgs;
};
/**
 * PropertyCountOutputType without action
 */
export type PropertyCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PropertyCountOutputType
     */
    select?: Prisma.PropertyCountOutputTypeSelect<ExtArgs> | null;
};
/**
 * PropertyCountOutputType without action
 */
export type PropertyCountOutputTypeCountInvestmentsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.InvestmentWhereInput;
};
/**
 * PropertyCountOutputType without action
 */
export type PropertyCountOutputTypeCountTransactionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TransactionWhereInput;
};
/**
 * PropertyCountOutputType without action
 */
export type PropertyCountOutputTypeCountYieldDistributionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.YieldDistributionWhereInput;
};
/**
 * PropertyCountOutputType without action
 */
export type PropertyCountOutputTypeCountListingDraftsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ListingDraftWhereInput;
};
/**
 * PropertyCountOutputType without action
 */
export type PropertyCountOutputTypeCountYieldClaimsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.YieldClaimWhereInput;
};
export type PropertySelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    ownerWallet?: boolean;
    name?: boolean;
    type?: boolean;
    tokenModel?: boolean;
    country?: boolean;
    city?: boolean;
    addressFull?: boolean;
    description?: boolean;
    yearBuilt?: boolean;
    areaSqft?: boolean;
    totalValuation?: boolean;
    pricePerShare?: boolean;
    totalShares?: boolean;
    availableShares?: boolean;
    yieldPercent?: boolean;
    monthlyRental?: boolean;
    operatingCosts?: boolean;
    managementFeePct?: boolean;
    insuranceCost?: boolean;
    capRate?: boolean;
    occupancyPct?: boolean;
    status?: boolean;
    mintAddress?: boolean;
    metadataUri?: boolean;
    collectionAddress?: boolean;
    treasuryPda?: boolean;
    coverImageUrl?: boolean;
    images?: boolean;
    isFeatured?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    owner?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    investments?: boolean | Prisma.Property$investmentsArgs<ExtArgs>;
    transactions?: boolean | Prisma.Property$transactionsArgs<ExtArgs>;
    yieldDistributions?: boolean | Prisma.Property$yieldDistributionsArgs<ExtArgs>;
    listingDrafts?: boolean | Prisma.Property$listingDraftsArgs<ExtArgs>;
    yieldClaims?: boolean | Prisma.Property$yieldClaimsArgs<ExtArgs>;
    _count?: boolean | Prisma.PropertyCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["property"]>;
export type PropertySelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    ownerWallet?: boolean;
    name?: boolean;
    type?: boolean;
    tokenModel?: boolean;
    country?: boolean;
    city?: boolean;
    addressFull?: boolean;
    description?: boolean;
    yearBuilt?: boolean;
    areaSqft?: boolean;
    totalValuation?: boolean;
    pricePerShare?: boolean;
    totalShares?: boolean;
    availableShares?: boolean;
    yieldPercent?: boolean;
    monthlyRental?: boolean;
    operatingCosts?: boolean;
    managementFeePct?: boolean;
    insuranceCost?: boolean;
    capRate?: boolean;
    occupancyPct?: boolean;
    status?: boolean;
    mintAddress?: boolean;
    metadataUri?: boolean;
    collectionAddress?: boolean;
    treasuryPda?: boolean;
    coverImageUrl?: boolean;
    images?: boolean;
    isFeatured?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    owner?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["property"]>;
export type PropertySelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    ownerWallet?: boolean;
    name?: boolean;
    type?: boolean;
    tokenModel?: boolean;
    country?: boolean;
    city?: boolean;
    addressFull?: boolean;
    description?: boolean;
    yearBuilt?: boolean;
    areaSqft?: boolean;
    totalValuation?: boolean;
    pricePerShare?: boolean;
    totalShares?: boolean;
    availableShares?: boolean;
    yieldPercent?: boolean;
    monthlyRental?: boolean;
    operatingCosts?: boolean;
    managementFeePct?: boolean;
    insuranceCost?: boolean;
    capRate?: boolean;
    occupancyPct?: boolean;
    status?: boolean;
    mintAddress?: boolean;
    metadataUri?: boolean;
    collectionAddress?: boolean;
    treasuryPda?: boolean;
    coverImageUrl?: boolean;
    images?: boolean;
    isFeatured?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    owner?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["property"]>;
export type PropertySelectScalar = {
    id?: boolean;
    ownerWallet?: boolean;
    name?: boolean;
    type?: boolean;
    tokenModel?: boolean;
    country?: boolean;
    city?: boolean;
    addressFull?: boolean;
    description?: boolean;
    yearBuilt?: boolean;
    areaSqft?: boolean;
    totalValuation?: boolean;
    pricePerShare?: boolean;
    totalShares?: boolean;
    availableShares?: boolean;
    yieldPercent?: boolean;
    monthlyRental?: boolean;
    operatingCosts?: boolean;
    managementFeePct?: boolean;
    insuranceCost?: boolean;
    capRate?: boolean;
    occupancyPct?: boolean;
    status?: boolean;
    mintAddress?: boolean;
    metadataUri?: boolean;
    collectionAddress?: boolean;
    treasuryPda?: boolean;
    coverImageUrl?: boolean;
    images?: boolean;
    isFeatured?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type PropertyOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "ownerWallet" | "name" | "type" | "tokenModel" | "country" | "city" | "addressFull" | "description" | "yearBuilt" | "areaSqft" | "totalValuation" | "pricePerShare" | "totalShares" | "availableShares" | "yieldPercent" | "monthlyRental" | "operatingCosts" | "managementFeePct" | "insuranceCost" | "capRate" | "occupancyPct" | "status" | "mintAddress" | "metadataUri" | "collectionAddress" | "treasuryPda" | "coverImageUrl" | "images" | "isFeatured" | "createdAt" | "updatedAt", ExtArgs["result"]["property"]>;
export type PropertyInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    owner?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    investments?: boolean | Prisma.Property$investmentsArgs<ExtArgs>;
    transactions?: boolean | Prisma.Property$transactionsArgs<ExtArgs>;
    yieldDistributions?: boolean | Prisma.Property$yieldDistributionsArgs<ExtArgs>;
    listingDrafts?: boolean | Prisma.Property$listingDraftsArgs<ExtArgs>;
    yieldClaims?: boolean | Prisma.Property$yieldClaimsArgs<ExtArgs>;
    _count?: boolean | Prisma.PropertyCountOutputTypeDefaultArgs<ExtArgs>;
};
export type PropertyIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    owner?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type PropertyIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    owner?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type $PropertyPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Property";
    objects: {
        owner: Prisma.$UserPayload<ExtArgs>;
        investments: Prisma.$InvestmentPayload<ExtArgs>[];
        transactions: Prisma.$TransactionPayload<ExtArgs>[];
        yieldDistributions: Prisma.$YieldDistributionPayload<ExtArgs>[];
        listingDrafts: Prisma.$ListingDraftPayload<ExtArgs>[];
        yieldClaims: Prisma.$YieldClaimPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        ownerWallet: string;
        name: string;
        type: $Enums.PropertyType;
        tokenModel: $Enums.TokenModel;
        country: string;
        city: string | null;
        addressFull: string | null;
        description: string | null;
        yearBuilt: number | null;
        areaSqft: number | null;
        totalValuation: bigint | null;
        pricePerShare: number | null;
        totalShares: number | null;
        availableShares: number | null;
        yieldPercent: runtime.Decimal | null;
        monthlyRental: bigint | null;
        operatingCosts: bigint | null;
        managementFeePct: runtime.Decimal | null;
        insuranceCost: bigint | null;
        capRate: runtime.Decimal | null;
        occupancyPct: number | null;
        status: $Enums.PropertyStatus;
        mintAddress: string | null;
        metadataUri: string | null;
        collectionAddress: string | null;
        treasuryPda: string | null;
        coverImageUrl: string | null;
        images: string[];
        isFeatured: boolean;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["property"]>;
    composites: {};
};
export type PropertyGetPayload<S extends boolean | null | undefined | PropertyDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$PropertyPayload, S>;
export type PropertyCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<PropertyFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: PropertyCountAggregateInputType | true;
};
export interface PropertyDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Property'];
        meta: {
            name: 'Property';
        };
    };
    /**
     * Find zero or one Property that matches the filter.
     * @param {PropertyFindUniqueArgs} args - Arguments to find a Property
     * @example
     * // Get one Property
     * const property = await prisma.property.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PropertyFindUniqueArgs>(args: Prisma.SelectSubset<T, PropertyFindUniqueArgs<ExtArgs>>): Prisma.Prisma__PropertyClient<runtime.Types.Result.GetResult<Prisma.$PropertyPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one Property that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PropertyFindUniqueOrThrowArgs} args - Arguments to find a Property
     * @example
     * // Get one Property
     * const property = await prisma.property.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PropertyFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, PropertyFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__PropertyClient<runtime.Types.Result.GetResult<Prisma.$PropertyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first Property that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PropertyFindFirstArgs} args - Arguments to find a Property
     * @example
     * // Get one Property
     * const property = await prisma.property.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PropertyFindFirstArgs>(args?: Prisma.SelectSubset<T, PropertyFindFirstArgs<ExtArgs>>): Prisma.Prisma__PropertyClient<runtime.Types.Result.GetResult<Prisma.$PropertyPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first Property that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PropertyFindFirstOrThrowArgs} args - Arguments to find a Property
     * @example
     * // Get one Property
     * const property = await prisma.property.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PropertyFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, PropertyFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__PropertyClient<runtime.Types.Result.GetResult<Prisma.$PropertyPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more Properties that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PropertyFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Properties
     * const properties = await prisma.property.findMany()
     *
     * // Get first 10 Properties
     * const properties = await prisma.property.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const propertyWithIdOnly = await prisma.property.findMany({ select: { id: true } })
     *
     */
    findMany<T extends PropertyFindManyArgs>(args?: Prisma.SelectSubset<T, PropertyFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PropertyPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a Property.
     * @param {PropertyCreateArgs} args - Arguments to create a Property.
     * @example
     * // Create one Property
     * const Property = await prisma.property.create({
     *   data: {
     *     // ... data to create a Property
     *   }
     * })
     *
     */
    create<T extends PropertyCreateArgs>(args: Prisma.SelectSubset<T, PropertyCreateArgs<ExtArgs>>): Prisma.Prisma__PropertyClient<runtime.Types.Result.GetResult<Prisma.$PropertyPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many Properties.
     * @param {PropertyCreateManyArgs} args - Arguments to create many Properties.
     * @example
     * // Create many Properties
     * const property = await prisma.property.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends PropertyCreateManyArgs>(args?: Prisma.SelectSubset<T, PropertyCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many Properties and returns the data saved in the database.
     * @param {PropertyCreateManyAndReturnArgs} args - Arguments to create many Properties.
     * @example
     * // Create many Properties
     * const property = await prisma.property.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Properties and only return the `id`
     * const propertyWithIdOnly = await prisma.property.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends PropertyCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, PropertyCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PropertyPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a Property.
     * @param {PropertyDeleteArgs} args - Arguments to delete one Property.
     * @example
     * // Delete one Property
     * const Property = await prisma.property.delete({
     *   where: {
     *     // ... filter to delete one Property
     *   }
     * })
     *
     */
    delete<T extends PropertyDeleteArgs>(args: Prisma.SelectSubset<T, PropertyDeleteArgs<ExtArgs>>): Prisma.Prisma__PropertyClient<runtime.Types.Result.GetResult<Prisma.$PropertyPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one Property.
     * @param {PropertyUpdateArgs} args - Arguments to update one Property.
     * @example
     * // Update one Property
     * const property = await prisma.property.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends PropertyUpdateArgs>(args: Prisma.SelectSubset<T, PropertyUpdateArgs<ExtArgs>>): Prisma.Prisma__PropertyClient<runtime.Types.Result.GetResult<Prisma.$PropertyPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more Properties.
     * @param {PropertyDeleteManyArgs} args - Arguments to filter Properties to delete.
     * @example
     * // Delete a few Properties
     * const { count } = await prisma.property.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends PropertyDeleteManyArgs>(args?: Prisma.SelectSubset<T, PropertyDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more Properties.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PropertyUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Properties
     * const property = await prisma.property.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends PropertyUpdateManyArgs>(args: Prisma.SelectSubset<T, PropertyUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more Properties and returns the data updated in the database.
     * @param {PropertyUpdateManyAndReturnArgs} args - Arguments to update many Properties.
     * @example
     * // Update many Properties
     * const property = await prisma.property.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more Properties and only return the `id`
     * const propertyWithIdOnly = await prisma.property.updateManyAndReturn({
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
    updateManyAndReturn<T extends PropertyUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, PropertyUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PropertyPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one Property.
     * @param {PropertyUpsertArgs} args - Arguments to update or create a Property.
     * @example
     * // Update or create a Property
     * const property = await prisma.property.upsert({
     *   create: {
     *     // ... data to create a Property
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Property we want to update
     *   }
     * })
     */
    upsert<T extends PropertyUpsertArgs>(args: Prisma.SelectSubset<T, PropertyUpsertArgs<ExtArgs>>): Prisma.Prisma__PropertyClient<runtime.Types.Result.GetResult<Prisma.$PropertyPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of Properties.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PropertyCountArgs} args - Arguments to filter Properties to count.
     * @example
     * // Count the number of Properties
     * const count = await prisma.property.count({
     *   where: {
     *     // ... the filter for the Properties we want to count
     *   }
     * })
    **/
    count<T extends PropertyCountArgs>(args?: Prisma.Subset<T, PropertyCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], PropertyCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a Property.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PropertyAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends PropertyAggregateArgs>(args: Prisma.Subset<T, PropertyAggregateArgs>): Prisma.PrismaPromise<GetPropertyAggregateType<T>>;
    /**
     * Group by Property.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PropertyGroupByArgs} args - Group by arguments.
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
    groupBy<T extends PropertyGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: PropertyGroupByArgs['orderBy'];
    } : {
        orderBy?: PropertyGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, PropertyGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPropertyGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the Property model
     */
    readonly fields: PropertyFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for Property.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__PropertyClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    owner<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    investments<T extends Prisma.Property$investmentsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Property$investmentsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$InvestmentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    transactions<T extends Prisma.Property$transactionsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Property$transactionsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    yieldDistributions<T extends Prisma.Property$yieldDistributionsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Property$yieldDistributionsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$YieldDistributionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    listingDrafts<T extends Prisma.Property$listingDraftsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Property$listingDraftsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ListingDraftPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    yieldClaims<T extends Prisma.Property$yieldClaimsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Property$yieldClaimsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$YieldClaimPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
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
 * Fields of the Property model
 */
export interface PropertyFieldRefs {
    readonly id: Prisma.FieldRef<"Property", 'String'>;
    readonly ownerWallet: Prisma.FieldRef<"Property", 'String'>;
    readonly name: Prisma.FieldRef<"Property", 'String'>;
    readonly type: Prisma.FieldRef<"Property", 'PropertyType'>;
    readonly tokenModel: Prisma.FieldRef<"Property", 'TokenModel'>;
    readonly country: Prisma.FieldRef<"Property", 'String'>;
    readonly city: Prisma.FieldRef<"Property", 'String'>;
    readonly addressFull: Prisma.FieldRef<"Property", 'String'>;
    readonly description: Prisma.FieldRef<"Property", 'String'>;
    readonly yearBuilt: Prisma.FieldRef<"Property", 'Int'>;
    readonly areaSqft: Prisma.FieldRef<"Property", 'Int'>;
    readonly totalValuation: Prisma.FieldRef<"Property", 'BigInt'>;
    readonly pricePerShare: Prisma.FieldRef<"Property", 'Int'>;
    readonly totalShares: Prisma.FieldRef<"Property", 'Int'>;
    readonly availableShares: Prisma.FieldRef<"Property", 'Int'>;
    readonly yieldPercent: Prisma.FieldRef<"Property", 'Decimal'>;
    readonly monthlyRental: Prisma.FieldRef<"Property", 'BigInt'>;
    readonly operatingCosts: Prisma.FieldRef<"Property", 'BigInt'>;
    readonly managementFeePct: Prisma.FieldRef<"Property", 'Decimal'>;
    readonly insuranceCost: Prisma.FieldRef<"Property", 'BigInt'>;
    readonly capRate: Prisma.FieldRef<"Property", 'Decimal'>;
    readonly occupancyPct: Prisma.FieldRef<"Property", 'Int'>;
    readonly status: Prisma.FieldRef<"Property", 'PropertyStatus'>;
    readonly mintAddress: Prisma.FieldRef<"Property", 'String'>;
    readonly metadataUri: Prisma.FieldRef<"Property", 'String'>;
    readonly collectionAddress: Prisma.FieldRef<"Property", 'String'>;
    readonly treasuryPda: Prisma.FieldRef<"Property", 'String'>;
    readonly coverImageUrl: Prisma.FieldRef<"Property", 'String'>;
    readonly images: Prisma.FieldRef<"Property", 'String[]'>;
    readonly isFeatured: Prisma.FieldRef<"Property", 'Boolean'>;
    readonly createdAt: Prisma.FieldRef<"Property", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"Property", 'DateTime'>;
}
/**
 * Property findUnique
 */
export type PropertyFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which Property to fetch.
     */
    where: Prisma.PropertyWhereUniqueInput;
};
/**
 * Property findUniqueOrThrow
 */
export type PropertyFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which Property to fetch.
     */
    where: Prisma.PropertyWhereUniqueInput;
};
/**
 * Property findFirst
 */
export type PropertyFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which Property to fetch.
     */
    where?: Prisma.PropertyWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Properties to fetch.
     */
    orderBy?: Prisma.PropertyOrderByWithRelationInput | Prisma.PropertyOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Properties.
     */
    cursor?: Prisma.PropertyWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Properties from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Properties.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Properties.
     */
    distinct?: Prisma.PropertyScalarFieldEnum | Prisma.PropertyScalarFieldEnum[];
};
/**
 * Property findFirstOrThrow
 */
export type PropertyFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which Property to fetch.
     */
    where?: Prisma.PropertyWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Properties to fetch.
     */
    orderBy?: Prisma.PropertyOrderByWithRelationInput | Prisma.PropertyOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Properties.
     */
    cursor?: Prisma.PropertyWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Properties from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Properties.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Properties.
     */
    distinct?: Prisma.PropertyScalarFieldEnum | Prisma.PropertyScalarFieldEnum[];
};
/**
 * Property findMany
 */
export type PropertyFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which Properties to fetch.
     */
    where?: Prisma.PropertyWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Properties to fetch.
     */
    orderBy?: Prisma.PropertyOrderByWithRelationInput | Prisma.PropertyOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Properties.
     */
    cursor?: Prisma.PropertyWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Properties from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Properties.
     */
    skip?: number;
    distinct?: Prisma.PropertyScalarFieldEnum | Prisma.PropertyScalarFieldEnum[];
};
/**
 * Property create
 */
export type PropertyCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * The data needed to create a Property.
     */
    data: Prisma.XOR<Prisma.PropertyCreateInput, Prisma.PropertyUncheckedCreateInput>;
};
/**
 * Property createMany
 */
export type PropertyCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many Properties.
     */
    data: Prisma.PropertyCreateManyInput | Prisma.PropertyCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * Property createManyAndReturn
 */
export type PropertyCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Property
     */
    select?: Prisma.PropertySelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Property
     */
    omit?: Prisma.PropertyOmit<ExtArgs> | null;
    /**
     * The data used to create many Properties.
     */
    data: Prisma.PropertyCreateManyInput | Prisma.PropertyCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PropertyIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * Property update
 */
export type PropertyUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * The data needed to update a Property.
     */
    data: Prisma.XOR<Prisma.PropertyUpdateInput, Prisma.PropertyUncheckedUpdateInput>;
    /**
     * Choose, which Property to update.
     */
    where: Prisma.PropertyWhereUniqueInput;
};
/**
 * Property updateMany
 */
export type PropertyUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update Properties.
     */
    data: Prisma.XOR<Prisma.PropertyUpdateManyMutationInput, Prisma.PropertyUncheckedUpdateManyInput>;
    /**
     * Filter which Properties to update
     */
    where?: Prisma.PropertyWhereInput;
    /**
     * Limit how many Properties to update.
     */
    limit?: number;
};
/**
 * Property updateManyAndReturn
 */
export type PropertyUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Property
     */
    select?: Prisma.PropertySelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Property
     */
    omit?: Prisma.PropertyOmit<ExtArgs> | null;
    /**
     * The data used to update Properties.
     */
    data: Prisma.XOR<Prisma.PropertyUpdateManyMutationInput, Prisma.PropertyUncheckedUpdateManyInput>;
    /**
     * Filter which Properties to update
     */
    where?: Prisma.PropertyWhereInput;
    /**
     * Limit how many Properties to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PropertyIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * Property upsert
 */
export type PropertyUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * The filter to search for the Property to update in case it exists.
     */
    where: Prisma.PropertyWhereUniqueInput;
    /**
     * In case the Property found by the `where` argument doesn't exist, create a new Property with this data.
     */
    create: Prisma.XOR<Prisma.PropertyCreateInput, Prisma.PropertyUncheckedCreateInput>;
    /**
     * In case the Property was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.PropertyUpdateInput, Prisma.PropertyUncheckedUpdateInput>;
};
/**
 * Property delete
 */
export type PropertyDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter which Property to delete.
     */
    where: Prisma.PropertyWhereUniqueInput;
};
/**
 * Property deleteMany
 */
export type PropertyDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which Properties to delete
     */
    where?: Prisma.PropertyWhereInput;
    /**
     * Limit how many Properties to delete.
     */
    limit?: number;
};
/**
 * Property.investments
 */
export type Property$investmentsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    where?: Prisma.InvestmentWhereInput;
    orderBy?: Prisma.InvestmentOrderByWithRelationInput | Prisma.InvestmentOrderByWithRelationInput[];
    cursor?: Prisma.InvestmentWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.InvestmentScalarFieldEnum | Prisma.InvestmentScalarFieldEnum[];
};
/**
 * Property.transactions
 */
export type Property$transactionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: Prisma.TransactionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Transaction
     */
    omit?: Prisma.TransactionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.TransactionInclude<ExtArgs> | null;
    where?: Prisma.TransactionWhereInput;
    orderBy?: Prisma.TransactionOrderByWithRelationInput | Prisma.TransactionOrderByWithRelationInput[];
    cursor?: Prisma.TransactionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TransactionScalarFieldEnum | Prisma.TransactionScalarFieldEnum[];
};
/**
 * Property.yieldDistributions
 */
export type Property$yieldDistributionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    where?: Prisma.YieldDistributionWhereInput;
    orderBy?: Prisma.YieldDistributionOrderByWithRelationInput | Prisma.YieldDistributionOrderByWithRelationInput[];
    cursor?: Prisma.YieldDistributionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.YieldDistributionScalarFieldEnum | Prisma.YieldDistributionScalarFieldEnum[];
};
/**
 * Property.listingDrafts
 */
export type Property$listingDraftsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    where?: Prisma.ListingDraftWhereInput;
    orderBy?: Prisma.ListingDraftOrderByWithRelationInput | Prisma.ListingDraftOrderByWithRelationInput[];
    cursor?: Prisma.ListingDraftWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ListingDraftScalarFieldEnum | Prisma.ListingDraftScalarFieldEnum[];
};
/**
 * Property.yieldClaims
 */
export type Property$yieldClaimsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
 * Property without action
 */
export type PropertyDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
};
export {};
//# sourceMappingURL=Property.d.ts.map