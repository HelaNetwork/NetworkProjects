import { GraphNode, GraphViews, QueryContext } from "../types/graphTypes";
import { isEntryPoint } from "../graph/entryDetector";
import { isDeadFile } from "../graph/deadFileDetector";

/**
 * Builds deterministic views and AI query context from graph data.
 */
export const buildViews = (
  nodes: GraphNode[],
  nodeMap: Record<string, GraphNode>
): { views: GraphViews; queryContext: QueryContext } => {
  const MAX_DEFAULT = 15;

  // 1. Sort by Impact DESC -> Name ASC
  const sortedNodes = [...nodes].sort((a, b) => {
    if (b.impact !== a.impact) return b.impact - a.impact;
    return a.name.localeCompare(b.name);
  });

  // 2. Identify and Limit Entry Points and High Impact Nodes
  const entryPointIds = sortedNodes
    .filter((n) => isEntryPoint(n) && !isDeadFile(n))
    .slice(0, 10)
    .map((n) => n.id);

  const highImpactIds = sortedNodes.slice(0, 15).map((n) => n.id);

  // 3. Build Default View (Requirement 4)
  const defaultSet = new Set([...entryPointIds, ...highImpactIds]);
  let defaultView = Array.from(defaultSet).slice(0, MAX_DEFAULT);

  // 4. Default View Fallback (Requirement 5 - MANDATORY)
  if (defaultView.length === 0 && nodes.length > 0) {
    defaultView = [nodes[0].id];
  }

  // 5. By Folder Grouping
  const byFolder: Record<string, string[]> = {};
  for (const node of nodes) {
    const folder = node.folder || "root";
    if (!byFolder[folder]) byFolder[folder] = [];
    byFolder[folder].push(node.id);
  }

  const views: GraphViews = {
    default: defaultView,
    highImpact: highImpactIds,
    entryPoints: entryPointIds,
    byFolder
  };

  // 6. Query Context for AI
  const queryContext: QueryContext = {
    topNodes: highImpactIds,
    entryPoints: entryPointIds,
    nodeMap
  };

  return { views, queryContext };
};
