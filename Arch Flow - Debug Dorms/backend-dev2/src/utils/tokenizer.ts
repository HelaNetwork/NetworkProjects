/**
 * Tokenizes file names and paths into search-ready keywords.
 */
export const tokenize = (path: string): string[] => {
  // 1. Remove file extensions (e.g., .js, .ts, .tsx)
  const baseName = path.split("/").pop() || "";
  const nameWithoutExt = baseName.replace(/\.[^/.]+$/, "");
  
  // 2. Tokenize folders and filename
  const rawSegments = [...path.split("/").slice(0, -1), nameWithoutExt];
  
  const tokens = new Set<string>();

  for (const segment of rawSegments) {
    if (!segment) continue;

    // Split by non-alphanumeric OR camelCase transitions
    // Regex matches case transitions (lower to upper) or special characters
    const parts = segment
      .split(/[^a-zA-Z0-9]+|(?<=[a-z])(?=[A-Z])/)
      .map((p) => p.toLowerCase().trim())
      .filter((p) => p.length >= 2 && !/^\d+$/.test(p));

    for (const part of parts) {
      tokens.add(part);
    }
  }

  return Array.from(tokens);
};
