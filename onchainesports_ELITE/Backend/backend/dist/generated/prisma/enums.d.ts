export declare const AssetType: {
    readonly TEAM: "TEAM";
    readonly LAND: "LAND";
    readonly PLAYER: "PLAYER";
};
export type AssetType = (typeof AssetType)[keyof typeof AssetType];
export declare const MatchStatus: {
    readonly SCHEDULED: "SCHEDULED";
    readonly LIVE: "LIVE";
    readonly FINISHED: "FINISHED";
};
export type MatchStatus = (typeof MatchStatus)[keyof typeof MatchStatus];
export declare const MatchResult: {
    readonly TEAM_A: "TEAM_A";
    readonly TEAM_B: "TEAM_B";
};
export type MatchResult = (typeof MatchResult)[keyof typeof MatchResult];
export declare const PredictionSide: {
    readonly TEAM_A: "TEAM_A";
    readonly TEAM_B: "TEAM_B";
};
export type PredictionSide = (typeof PredictionSide)[keyof typeof PredictionSide];
export declare const MarketStatus: {
    readonly OPEN: "OPEN";
    readonly CLOSED: "CLOSED";
    readonly SETTLED: "SETTLED";
};
export type MarketStatus = (typeof MarketStatus)[keyof typeof MarketStatus];
export declare const TransactionType: {
    readonly BUY_ASSET: "BUY_ASSET";
    readonly SELL_ASSET: "SELL_ASSET";
    readonly BUY_PREDICTION: "BUY_PREDICTION";
    readonly SELL_PREDICTION: "SELL_PREDICTION";
    readonly CLAIM_REWARD: "CLAIM_REWARD";
};
export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];
//# sourceMappingURL=enums.d.ts.map