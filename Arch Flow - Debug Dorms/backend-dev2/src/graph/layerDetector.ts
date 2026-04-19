/**
 * Detects the architectural layer based on file path heuristics.
 */
export const detectLayer = (path: string): string => {
  const lowerPath = path.toLowerCase();

  if (lowerPath.includes("controller")) return "controller";
  if (lowerPath.includes("service")) return "service";
  if (lowerPath.includes("util") || lowerPath.includes("helper")) return "utility";

  return "unknown";
};
