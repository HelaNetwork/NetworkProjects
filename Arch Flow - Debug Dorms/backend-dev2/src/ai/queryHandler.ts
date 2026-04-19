import { QueryRequest, QueryResponse, AnalysisResult } from "../types/graphTypes";
import { tokenize } from "../utils/tokenizer";

const WEAK_TOKENS = new Set(["where", "is", "the", "what", "how", "a", "an", "of", "and", "or", "to", "in"]);

/**
 * Handles natural language queries and maps them to graph nodes with intelligent scoring.
 * Deterministic, type-safe, and standalone.
 */
export function handleQuery(request: QueryRequest): QueryResponse {
  const { query, context } = request;

  // 1. TOP-LEVEL VALIDATION
  if (!context || !context.nodeMap || Object.keys(context.nodeMap).length === 0) {
    return getSafeFallbackResponse("Invalid exploration context. Showing base repository structure.", context);
  }

  const nodeMap = context.nodeMap;
  const searchIndex = context.searchIndex || {};
  const views = context.views;

  // 2. Normalization & Pre-processing
  const cleanQuery = query.toLowerCase().trim().replace(/[?.!,]/g, "");
  
  // 3. Empty Query Handling
  if (!cleanQuery) {
    return getSafeFallbackResponse("Showing key files in the repository.", context);
  }

  // 4. Keyword Extraction
  const rawTokens = tokenize(cleanQuery);
  const strongTokens = rawTokens.filter(t => t.length >= 3 && !WEAK_TOKENS.has(t));

  if (strongTokens.length === 0) {
    return getSafeFallbackResponse("Explore the repository by selecting key components below.", context);
  }

  // 5. Scoring Engine (Strictly using nodeMap)
  const candidateScores = new Map<string, number>();
  const searchTokens = strongTokens.slice(0, 3);

  for (const nodeId in nodeMap) {
    const node = nodeMap[nodeId];
    const nodeNameLow = node.name.toLowerCase();
    const nodeFolderLow = node.folder.toLowerCase();
    let score = 0;
    let matchFound = false;

    for (const token of searchTokens) {
      let tokenMatched = false;

      // Exact name match or starts-with boost (+4)
      if (nodeNameLow === token || nodeNameLow.startsWith(token + ".")) {
        score += 4;
        tokenMatched = true;
      } 
      // Substring filename match (+3)
      else if (nodeNameLow.includes(token)) {
        score += 3;
        tokenMatched = true;
      }

      // Folder match (+2)
      if (nodeFolderLow.includes(token)) {
        score += 2;
        if (tokenMatched) score += 3; // Focus boost
        tokenMatched = true;
      }

      if (tokenMatched) {
        matchFound = true;
        score += 2; // Multi-token boost
      }
    }

    if (matchFound) {
      // Impact weight
      score += (node.impact || 0) * 0.2;
      candidateScores.set(nodeId, score);
    }
  }

  // 6. Result Sorting
  let sortedIds = Array.from(candidateScores.keys()).sort((a, b) => {
    const scoreA = candidateScores.get(a) || 0;
    const scoreB = candidateScores.get(b) || 0;
    if (Math.abs(scoreB - scoreA) > 0.001) return scoreB - scoreA;
    return (nodeMap[b]?.impact || 0) - (nodeMap[a]?.impact || 0);
  });

  // 7. VALIDATE highlightNodes (Patch Hardware)
  let highlightNodes = sortedIds.slice(0, 5).filter(id => nodeMap[id]);

  if (highlightNodes.length === 0) {
    return getSafeFallbackResponse(`No direct matches for '${searchTokens.join(", ")}'.`, context);
  }

  // 8. FINAL CONSISTENCY CHECK & RESPONSE
  const focusNode = highlightNodes[0];
  
  // Guarantee focusNode existence
  if (!nodeMap[focusNode]) {
    return getSafeFallbackResponse("Aligning view to repository entry points.", context);
  }

  const relevantFiles = highlightNodes
    .slice(0, 4)
    .map(id => nodeMap[id].name)
    .join(", ");

  return {
    answer: `Relevant files for your query: ${relevantFiles}.`,
    highlightNodes,
    focusNode
  };
}

/**
 * UPGRADED SAFE FALLBACK CHAIN (MANDATORY)
 */
function getSafeFallbackResponse(answer: string, context: AnalysisResult): QueryResponse {
  const nodeMap = context?.nodeMap || {};
  const views = context?.views || { entryPoints: [], highImpact: [], default: [], byFolder: {} };

  const checkValidity = (ids: string[]) => ids.filter(id => nodeMap[id]);

  // 1. Entry Points
  let fallback = checkValidity(views.entryPoints || []);
  
  // 2. High Impact
  if (fallback.length === 0) {
    fallback = checkValidity(views.highImpact || []);
  }

  // 3. Default View
  if (fallback.length === 0) {
    fallback = checkValidity(views.default || []);
  }

  // 4. Object.keys(nodeMap)
  if (fallback.length === 0) {
    fallback = Object.keys(nodeMap).slice(0, 3);
  }

  const highlightNodes = fallback.length > 0 ? fallback.slice(0, 5) : [];
  const focusNode = highlightNodes[0] || Object.keys(nodeMap)[0] || "";

  // Validate one last time for the response guarantee
  if (highlightNodes.length === 0 || !focusNode || !nodeMap[focusNode]) {
    // This should theoretically be impossible if nodeMap has keys
    const firstKey = Object.keys(nodeMap)[0] || "";
    return {
      answer: answer || "Exploring codebase architecture.",
      highlightNodes: firstKey ? [firstKey] : [],
      focusNode: firstKey
    };
  }

  return {
    answer: answer || "Showing base repository exploration.",
    highlightNodes,
    focusNode
  };
}
