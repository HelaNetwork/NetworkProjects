import { GraphNode } from "../types/graphTypes";

/**
 * Logic to identify dead files (no edges).
 */
export const isDeadFile = (node: GraphNode): boolean => {
  return node.dependencies.length === 0 && node.dependents.length === 0;
};
