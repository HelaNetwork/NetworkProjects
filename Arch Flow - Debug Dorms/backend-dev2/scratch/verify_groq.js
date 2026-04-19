async function verifyGroq() {
    const URL = 'http://localhost:3001/api/query';
    const mockContext = {
        graph: {
            nodes: [
                { id: 'App.tsx', name: 'App.tsx', folder: 'src', priority: 'HIGH', type: 'file', inDegree: 2, outDegree: 5 },
                { id: 'api.ts', name: 'api.ts', folder: 'src', priority: 'MEDIUM', type: 'file', inDegree: 1, outDegree: 3 },
            ],
            edges: []
        },
        nodeMap: {
            'App.tsx': { id: 'App.tsx', name: 'App.tsx', folder: 'src', impact: 10, priority: 'HIGH' },
            'api.ts': { id: 'api.ts', name: 'api.ts', folder: 'src', impact: 5, priority: 'MEDIUM' },
        },
        views: {
            default: ['App.tsx', 'api.ts'],
            highImpact: ['App.tsx'],
            entryPoints: ['App.tsx'],
            byFolder: { 'src': ['App.tsx', 'api.ts'] }
        },
        searchIndex: {},
        queryContext: { topNodes: ['App.tsx', 'api.ts'] },
        metadata: { totalFiles: 2 }
    };

    console.log("--- Sending FINAL DEBUG Query ---");
    try {
        const response = await fetch(URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: "overview of this project", context: mockContext })
        });
        const data = await response.json();
        console.log("\nResponse Received:");
        console.log("Answer:", data.answer?.substring(0, 100) + "...");
    } catch (e) {
        console.log("ERROR:", e.message);
    }
}

verifyGroq();
