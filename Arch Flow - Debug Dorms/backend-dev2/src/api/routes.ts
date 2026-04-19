import { Router, Request, Response } from "express";
import { analyzeRepository } from "../ingestion/orchestrator";
import { handleQuery } from "../ai/queryHandler";
import { generateChatResponse, preWarmCache } from "../ai/openaiService";

const router = Router();

// 1. GLOBAL STATE for Rate Limiting
let lastQueryTimestamp = 0;
const RATE_LIMIT_MS = 300;

// ---------------------------------------------------------------------------
// POST /api/analyze
// Returns: AnalysisResult
// ---------------------------------------------------------------------------
router.post("/analyze", async (req: Request, res: Response) => {
  try {
    const { repoUrl, mockId } = req.body;
    console.log("REPO INPUT:", req.body);

    if (!repoUrl && !mockId) {
      return res.status(400).json({ error: "Missing required field: provide repoUrl or mockId" });
    }

    const result = await analyzeRepository({ repoUrl, mockId });

    console.log("FINAL NODE COUNT:", result.metadata.totalFiles);

    // PRE-WARM CACHE (Background)
    preWarmCache(result).catch(() => {});

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("[/analyze] Exception:", error);
    // Task 2: Safe Response Shape
    return res.status(200).json({
      error: true,
      message: error.message || "Failed to analyze repository",
      graph: { nodes: [], edges: [] },
      views: { default: [], highImpact: [], entryPoints: [], byFolder: {} },
      nodeMap: {},
      searchIndex: {},
      queryContext: { topNodes: [], entryPoints: [], nodeMap: {} },
      metadata: { version: "fallback", totalFiles: 0, totalEdges: 0, validEdges: 0, isLargeGraph: false, payloadSize: 0 }
    });
  }
});

// ---------------------------------------------------------------------------
// POST /api/query
// Returns: QueryResponse
// ---------------------------------------------------------------------------
router.post("/query", async (req: Request, res: Response) => {
  const { query, context } = req.body;
  const userQuery = (query || "").trim();
  console.log("QUERY RECEIVED:", userQuery);

  try {
    // 1. Context validation
    if (!context || !context.nodeMap) {
      return res.status(400).json({ error: "Analysis context missing or invalid" });
    }

    // 2. Deterministic Result (Always needed for nodes)
    const deterministicResult = handleQuery({ query: userQuery, context });

    // 3. RATE LIMITING
    const now = Date.now();
    if (now - lastQueryTimestamp < RATE_LIMIT_MS) {
      return res.status(200).json(deterministicResult);
    }
    lastQueryTimestamp = now;

    // 4. QUERY INTELLIGENCE (Upgraded Intent Detection)
    const normalizedQuery = userQuery.toLowerCase();
    const aiKeywords = ["explain", "summary", "summarize", "what", "how", "why", "overview", "describe", "purpose"];
    
    let needsAI = aiKeywords.some(keyword => normalizedQuery.includes(keyword)) || 
                  userQuery.split(" ").length > 2; // Treat 3+ words as AI query
    
    const isShort = userQuery.length < 3;

    if (!needsAI || isShort) {
      return res.status(200).json(deterministicResult);
    }

    // 5. TIMEOUT RACER
    const timeoutPromise = new Promise<null>((_, reject) => 
      setTimeout(() => reject(new Error("timeout")), 2000)
    );

    try {
      const aiAnswer = await Promise.race([
        generateChatResponse(userQuery, context, req.ip || "anon"),
        timeoutPromise
      ]);

      if (aiAnswer) {
        const responseData = {
          ...deterministicResult,
          answer: aiAnswer
        };
        console.log("📦 FINAL RESPONSE SENT:", responseData);
        return res.status(200).json(responseData);
      }
    } catch (error) {
      // Silence internal errors in production, fallback below
    }

    // Final Fallback if AI fails or times out
    return res.status(200).json({
      ...deterministicResult,
      answer: "Here are the key parts of the repository to explore."
    });

  } catch (error) {
    console.error("Query Execution Exception:", error);
    const fallbackNodes = Object.keys(context?.nodeMap || {}).slice(0, 3);
    return res.status(200).json({
      answer: "Here are the key parts of the repository to explore.",
      highlightNodes: fallbackNodes,
      focusNode: fallbackNodes[0] || ""
    });
  }
});

router.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

export default router;
