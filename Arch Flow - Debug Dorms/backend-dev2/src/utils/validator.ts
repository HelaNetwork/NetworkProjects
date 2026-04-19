import { FileInput, DependencyInput } from "../types/graphTypes";
import { normalizePath } from "./normalizer";

/**
 * Validates and cleans up the input files and dependencies.
 */
export const validateInput = (
  files: FileInput[],
  dependencies: DependencyInput[]
) => {
  const seenIds = new Set<string>();
  const validFiles: FileInput[] = [];

  // 1. Normalize and deduplicate files (keep first occurrence)
  for (const file of files) {
    const normalizedId = normalizePath(file.id);
    if (!normalizedId || seenIds.has(normalizedId)) continue;
    
    seenIds.add(normalizedId);
    validFiles.push({
      ...file,
      id: normalizedId
    });
  }

  const fileIdSet = new Set(validFiles.map(f => f.id));
  const seenEdges = new Set<string>();
  const validDependencies: DependencyInput[] = [];

  // 2. Normalize and deduplicate dependencies
  for (const dep of dependencies) {
    const from = normalizePath(dep.from);
    const to = normalizePath(dep.to);

    // Skip if empty IDs
    if (!from || !to) continue;

    // Remove self-loops
    if (from === to) continue;

    // Ensure BOTH nodes exist in the file list
    if (!fileIdSet.has(from) || !fileIdSet.has(to)) continue;

    // Deduplicate edges
    const edgeKey = `${from}|${to}`;
    if (seenEdges.has(edgeKey)) continue;

    seenEdges.add(edgeKey);
    validDependencies.push({ from, to });
  }

  return {
    files: validFiles,
    dependencies: validDependencies
  };
};
