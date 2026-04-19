import * as dagre from "dagre";
import { GraphNode, GraphEdge } from "../types/graphTypes";

/**
 * Computes deterministic node positions using Dagre.
 */
export const computeLayout = (nodes: GraphNode[], edges: GraphEdge[]) => {
  if (nodes.length === 0) return;
  
  if (nodes.length === 1) {
    nodes[0].position = { x: 0, y: 0 };
    return;
  }

  const g = new dagre.graphlib.Graph();
  
  // Set fixed configuration
  g.setGraph({
    rankdir: "TB",
    nodesep: 150,
    ranksep: 200,
    marginx: 50,
    marginy: 50
  });
  
  g.setDefaultEdgeLabel(() => ({}));

  // Add nodes
  for (const node of nodes) {
    g.setNode(node.id, { width: 220, height: 60 });
  }

  // Add edges (Only hierarchy edges for layout)
  for (const edge of edges) {
    if (edge.relation === 'hierarchy') {
      g.setEdge(edge.source, edge.target);
    }
  }

  // Compute layout
  dagre.layout(g);

  // Assign positions with finite check
  for (const node of nodes) {
    const pos = g.node(node.id);
    const x = pos && Number.isFinite(pos.x) ? pos.x : 0;
    const y = pos && Number.isFinite(pos.y) ? pos.y : 0;
    
    node.position = { x, y };
  }
};
