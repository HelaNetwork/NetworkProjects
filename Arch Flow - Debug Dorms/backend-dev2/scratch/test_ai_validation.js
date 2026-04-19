async function runTests() {
    const URL = 'http://localhost:3001/api/query';

    // Mock context for testing
    const mockContext = {
        graph: {
            nodes: [
                { id: 'App.tsx', name: 'App.tsx', folder: 'src', priority: 'HIGH', type: 'file', inDegree: 2, outDegree: 5 },
                { id: 'api.ts', name: 'api.ts', folder: 'src', priority: 'MEDIUM', type: 'file', inDegree: 1, outDegree: 3 },
                { id: 'utils.ts', name: 'utils.ts', folder: 'src', priority: 'LOW', type: 'file', inDegree: 0, outDegree: 2 }
            ],
            edges: []
        },
        nodeMap: {
            'App.tsx': { id: 'App.tsx', name: 'App.tsx', folder: 'src', impact: 10, priority: 'HIGH' },
            'api.ts': { id: 'api.ts', name: 'api.ts', folder: 'src', impact: 5, priority: 'MEDIUM' },
            'utils.ts': { id: 'utils.ts', name: 'utils.ts', folder: 'src', impact: 2, priority: 'LOW' }
        },
        views: {
            default: ['App.tsx', 'api.ts'],
            highImpact: ['App.tsx'],
            entryPoints: ['App.tsx'],
            byFolder: { 'src': ['App.tsx', 'api.ts', 'utils.ts'] }
        },
        searchIndex: {},
        queryContext: { topNodes: ['App.tsx', 'api.ts'] },
        metadata: { totalFiles: 3 }
    };

    console.log("--- STARTING STRICT VALIDATION ---");

    const post = async (query) => {
        try {
            const response = await fetch(URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, context: mockContext })
            });
            return await response.json();
        } catch (e) {
            return { answer: "Fetch Error: " + e.message };
        }
    };

    // STEP 1: SINGLE GROQ CALL
    console.log("\n[TEST 1] Initial call (Should use Groq)");
    let res = await post("Give me an overview of this project");
    console.log("Response Answer (Success):", res.answer?.substring(0, 150) + "...");

    // STEP 2: CACHE VALIDATION
    console.log("\n[TEST 2] Cache hit call (Should be instant)");
    res = await post("Give me an overview of this project");
    console.log("Response Answer (Cached):", res.answer?.substring(0, 150) + "...");

    // STEP 3: RATE LIMIT TEST
    console.log("\n[TEST 3] Rate limit test (Spamming)");
    res = await post("Explain the architecture");
    console.log("Response Answer (Rate Limited Fallback):", res.answer);

    // Wait for rate limit to clear
    console.log("\nWaiting 2.5s for rate limit to clear...");
    await new Promise(r => setTimeout(r, 2500));

    // STEP 4: FALLBACK VALIDATION (Trivial)
    console.log("\n[TEST 4] Trivial query (Should bypass Groq)");
    res = await post("hi");
    console.log("Response Answer (Fallback):", res.answer);

    // STEP 5: LIMIT TEST
    console.log("\n[TEST 5] Reaching limits (Session limit is 3)");
    console.log("Query 2 (Architectural):");
    await post("What is the primary module?");
    
    console.log("\nQuery 3 (Architectural):");
    await post("How do components interact?");

    console.log("\nQuery 4 (Should exceed limit):");
    res = await post("Summarize everything");
    console.log("Response Answer (Post-limit Fallback):", res.answer);

    console.log("\n--- VALIDATION COMPLETE ---");
}

runTests().catch(err => {
    console.error("Test failed:", err.message);
});
