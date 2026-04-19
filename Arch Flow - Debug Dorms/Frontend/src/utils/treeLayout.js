/**
 * Tree Layout Engine (Hierarchical)
 * Positions nodes in a top-down tree based on import dependencies.
 */
export function applyTreeLayout(nodes, edges, width, height) {
    if (nodes.length === 0) return [];

    const centerX = 1200; // Large virtual canvas
    const VERTICAL_GAP = 220;
    const HORIZONTAL_GAP = 280;

    // 1. Build Adjacency List
    const adj = {};
    const reverseAdj = {};
    nodes.forEach(n => {
        adj[n.id] = [];
        reverseAdj[n.id] = [];
    });
    edges.forEach(e => {
        if (adj[e.source]) adj[e.source].push(e.target);
        if (reverseAdj[e.target]) reverseAdj[e.target].push(e.source);
    });

    // 2. Identify Roots (nodes with no incoming edges)
    const roots = nodes.filter(n => (reverseAdj[n.id] || []).length === 0);
    const startCandidate = roots.length > 0 ? roots : [nodes[0]];
    const startNodes = startCandidate.filter(n => n && n.id);

    if (startNodes.length === 0 && nodes.length > 0) {
        // Emergency: if we can't find a root but have nodes, just use the first node
        startNodes.push(nodes[0]);
    }

    // 3. BFS for Depth Calculation
    const depths = {};
    const levels = {};
    const queue = startNodes.map(n => ({ id: n.id, depth: 0 }));
    const visited = new Set();

    while (queue.length > 0) {
        const { id, depth } = queue.shift();
        if (visited.has(id)) continue;
        visited.add(id);

        depths[id] = depth;
        if (!levels[depth]) levels[depth] = [];
        levels[depth].push(nodes.find(n => n.id === id));

        (adj[id] || []).forEach(childId => {
            if (!visited.has(childId)) {
                queue.push({ id: childId, depth: depth + 1 });
            }
        });
    }

    // 4. Handle Disconnected (Fallback)
    nodes.forEach(n => {
        if (!depths.hasOwnProperty(n.id)) {
            depths[n.id] = 0;
            if (!levels[0]) levels[0] = [];
            levels[0].push(n);
        }
    });

    // 5. Position Calculation
    Object.entries(levels).forEach(([depthStr, levelNodes]) => {
        const depth = parseInt(depthStr);
        
        // Depth Compression for tall graphs
        let yOffset = depth * VERTICAL_GAP;
        if (depth > 5) {
            yOffset = 5 * VERTICAL_GAP + Math.log2(depth - 4) * (VERTICAL_GAP * 1.5);
        }

        const levelWidth = (levelNodes.length - 1) * HORIZONTAL_GAP;
        const startX = centerX - levelWidth / 2;

        levelNodes.forEach((node, i) => {
            node.position = {
                x: startX + (i * HORIZONTAL_GAP),
                y: yOffset
            };
        });
    });

    return nodes;
}
