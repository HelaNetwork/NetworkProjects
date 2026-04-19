import { GraphNode, GraphEdge } from "../types/graphTypes";
import { getSemanticScore } from "./semanticAnalyzer";

/**
 * Adaptive Priority Engine
 * Uses normalized scores and percentile distribution instead of fixed thresholds.
 */
export function computePriority(nodes: GraphNode[], edges: GraphEdge[]): GraphNode[] {
    const inDegree: Record<string, number> = {};
    const outDegree: Record<string, number> = {};

    // Initialize degrees
    nodes.forEach(n => {
        inDegree[n.id] = 0;
        outDegree[n.id] = 0;
    });

    // Compute metrics
    edges.forEach(e => {
        if (inDegree[e.target] !== undefined) inDegree[e.target]++;
        if (outDegree[e.source] !== undefined) outDegree[e.source]++;
    });

    // 1. Compute Raw Scores
    const scoringNodes = nodes.map(node => {
        const inDeg = inDegree[node.id] || 0;
        const outDeg = outDegree[node.id] || 0;
        const semantic = getSemanticScore(node.label || node.id);

        let score = (inDeg * 2) + outDeg + semantic;

        // Centrality Boost: Nodes serving as both hubs and dependencies
        if (inDeg > 2 && outDeg > 2) {
            score += 2;
        }

        // Overrides
        if (node.id === "SYSTEM" || node.id === "**root**") score = Number.MAX_SAFE_INTEGER;
        
        if (node.id === "package.json" || node.type === "config-root") {
            score = Math.max(score, 10);
        } else if (node.type === "config-sub") {
            score = Math.max(score, 7);
        }


        return { ...node, rawScore: score, inDeg, outDeg, semantic };
    });

    // 2. Normalize Scores (Relative to Max in current graph)
    const validScores = scoringNodes
        .map(n => n.rawScore)
        .filter(s => s < Number.MAX_SAFE_INTEGER);
    
    const maxScore = validScores.length > 0 ? Math.max(...validScores) : 1;

    // 3. Classify via Percentiles
    // Sort DESC for percentile slicing
    const sorted = [...scoringNodes].sort((a, b) => b.rawScore - a.rawScore);
    const N = sorted.length;

    return sorted.map((sn, index) => {
        const normalized = sn.rawScore === Number.MAX_SAFE_INTEGER ? 1 : sn.rawScore / maxScore;
        
        // Percentile slices: Top 20% HIGH, Next 40% MEDIUM, rest LOW
        let priority: "HIGH" | "MEDIUM" | "LOW" = "LOW";
        if (index < 0.2 * N) priority = "HIGH";
        else if (index < 0.6 * N) priority = "MEDIUM";

        // Handle SYSTEM override
        if (sn.rawScore === Number.MAX_SAFE_INTEGER) priority = "HIGH";

        // Hardcoded overrides for config nodes
        if (sn.type === "config-root") priority = "HIGH";
        if (sn.type === "config-sub") priority = "MEDIUM";


        const { rawScore, inDeg, outDeg, semantic, ...rest } = sn;
        
        return {
            ...rest,
            priority,
            priorityScore: rawScore === Number.MAX_SAFE_INTEGER ? maxScore * 1.5 : rawScore,
            normalizedScore: Math.min(normalized, 1.0),
            semanticScore: semantic,
            inDegree: inDeg,
            outDegree: outDeg
        };
    });
}
