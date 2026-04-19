import dagre from '@dagrejs/dagre';

const NODE_WIDTH  = 200;
const NODE_HEIGHT = 60;

/**
 * Applies a Dagre TB (top→bottom) hierarchical layout.
 *
 * Tuned for architecture graphs:
 *  - nodesep 55:  keeps siblings close → compact width
 *  - ranksep 200: clear vertical separation between dependency levels
 *  - align DR:    distribute subtrees evenly (Down-Right → balanced tree)
 *
 * Returns new node objects with updated `position` — does not mutate originals.
 */
export function applyDagreLayout(nodes, edges) {
    if (!nodes || nodes.length === 0) return nodes;

    const g = new dagre.graphlib.Graph({ multigraph: false, compound: false });
    g.setDefaultEdgeLabel(() => ({}));

    g.setGraph({
        rankdir:  'TB',   // Top → Bottom
        align:    'DR',   // balanced subtree distribution
        nodesep:  55,     // ← REDUCED: horizontal gap on same level
        ranksep:  200,    // ← INCREASED: clear vertical depth between levels
        edgesep:  30,
        marginx:  60,
        marginy:  60,
        acyclicer: 'greedy',  // handle cycles gracefully
        ranker:   'tight-tree', // produces the most compact balanced tree
    });

    // Register all nodes
    nodes.forEach(n => g.setNode(n.id, { width: NODE_WIDTH, height: NODE_HEIGHT }));

    // Register edges (only valid pairs; skip self-loops)
    const nodeIds = new Set(nodes.map(n => n.id));
    edges.forEach(e => {
        if (nodeIds.has(e.source) && nodeIds.has(e.target) && e.source !== e.target) {
            g.setEdge(e.source, e.target);
        }
    });

    dagre.layout(g);

    return nodes.map(node => {
        const p = g.node(node.id);
        if (!p) return node;
        return {
            ...node,
            position: {
                x: p.x - NODE_WIDTH  / 2,   // Dagre → center; RF → top-left
                y: p.y - NODE_HEIGHT / 2,
            },
        };
    });
}
