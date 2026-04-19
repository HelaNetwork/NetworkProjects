import { GraphNode } from "../types/graphTypes";

/**
 * Logic to identify entry points.
 */
export const isEntryPoint = (node: GraphNode): boolean => {
  const entryNames = ["index.js", "app.js", "main.js", "index.ts", "app.ts", "main.ts"];
  const isNameMatch = entryNames.some((name) => node.name.toLowerCase() === name.toLowerCase());

  // name-based OR zero incoming AND non-zero outgoing
  const isZeroIncoming = node.dependents.length === 0 && node.dependencies.length > 0;

  return isNameMatch || isZeroIncoming;
};
