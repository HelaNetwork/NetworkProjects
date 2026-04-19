/**
 * Standardizes paths for the Repository Architecture Analyzer.
 */
export const normalizePath = (path: string): string => {
  if (!path) return "";
  
  return path
    .trim()
    .replace(/\\/g, "/")       // Convert backslashes to forward slashes
    .replace(/\/+/g, "/")      // Collapse duplicate slashes
    .replace(/^\//, "");       // Ensure path is relative by removing leading slash
};
