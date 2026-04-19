import { FileInput, DependencyInput } from "../types/graphTypes";

export type IngestionInput = {
  repoUrl?: string;
  mockId?: string;
};

export type IngestionOutput = {
  files: FileInput[];
  dependencies: DependencyInput[];
};

// ---------------------------------------------------------------------------
// Resilience & Security Hardening
// ---------------------------------------------------------------------------

let rateLimited = false;

console.log("GitHub Auth:", process.env.GITHUB_TOKEN ? "ENABLED" : "DISABLED");

/**
 * Returns authenticated headers with a graceful fallback for unauthenticated requests.
 */
function getGitHubHeaders() {
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    return {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/vnd.github+json"
    };
  }
  console.warn("⚠️ No GitHub token found — using unauthenticated requests (Strict rate limits apply)");
  return {
    "Accept": "application/vnd.github+json"
  };
}

/**
 * Perform a fetch with automatic retry logic and circuit-breaker rate limit protection.
 */
async function fetchWithRetry(url: string, options: any, retries = 2): Promise<Response> {
  if (rateLimited) {
    throw new Error("Temporarily rate-limited. Try again shortly.");
  }

  try {
    const res = await fetch(url, options);

    if (res.status === 403 || res.status === 429) {
      rateLimited = true;
      console.warn("⚠️ GitHub rate limit hit");

      if (retries > 0) {
        console.warn(`Rate limited — retrying in 500ms... (${retries} retries left)`);
        await new Promise(r => setTimeout(r, 500));
        return fetchWithRetry(url, options, retries - 1);
      }
      throw new Error("GitHub rate limit exceeded. Try again later.");
    }

    if (!res.ok) {
      console.error(`❌ GITHUB API ERROR: ${res.status} ${res.statusText} | URL: ${url}`);
      throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
    }

    console.log(`✅ GITHUB API SUCCESS: ${res.status} | URL: ${url}`);

    // Success — reset rate limit flag
    rateLimited = false;
    return res;
  } catch (err: any) {
    if (retries > 0 && !err.message.includes("rate limit")) {
      console.warn(`Retrying fetch due to error: ${err.message}...`);
      await new Promise(r => setTimeout(r, 300));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw err;
  }
}

/**
 * Extracts owner and repo from a GitHub URL.
 */
function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  try {
    const clean = url.trim().replace(/\.git$/, "").replace(/\/$/, "");
    const match = clean.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) return null;
    return { owner: match[1], repo: match[2] };
  } catch {
    return null;
  }
}

/**
 * Fetches the default branch for a repository.
 */
async function getRepoMetadata(owner: string, repo: string): Promise<string> {
  const url = `https://api.github.com/repos/${owner}/${repo}`;
  const response = await fetchWithRetry(url, { headers: getGitHubHeaders() });
  const data: any = await response.json();
  return data.default_branch || "main";
}

/**
 * Assigns priority score to files to ensure architectural importance is preserved during sampling.
 */
function getPriority(path: string): number {
  if (!path.includes("/")) return 5; // Root files
  if (path.startsWith("src/") || path.includes("/src/")) return 4;
  if (path.includes("main") || path.includes("app")) return 4;
  if (path.endsWith(".json") || path.endsWith(".yaml") || path.endsWith(".yml")) return 3;
  return 1;
}

/**
 * Fetches the full file tree from GitHub and applies smart sampling.
 */
async function fetchGitHubTree(owner: string, repo: string, branch: string): Promise<FileInput[]> {
  const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
  const response = await fetchWithRetry(url, { headers: getGitHubHeaders() });
  const data: any = await response.json();
  
  if (data.truncated) {
    console.warn("[Ingestion] TREE TRUNCATED — processing available results only.");
  }
  console.log("TOTAL FILES FROM GITHUB:", data.tree.length);
  console.log("TRUNCATED:", !!data.truncated);

  // 1. Filter: ONLY Blobs, specific extensions, exclude build artifacts
  const includedExtensions = new Set(['.js', '.ts', '.jsx', '.tsx', '.py']);
  const excludedPatterns = [/node_modules\//, /\.git\//, /dist\//, /build\//, /\.png$/, /\.jpg$/, /\.jpeg$/, /\.gif$/, /\.pdf$/, /\.zip$/];
  
  let rawFiles = data.tree
    .filter((item: any) => item.type === "blob")
    .filter((item: any) => {
        const path = item.path;
        if (path === "package.json" || path.endsWith("/package.json")) return true;
        const ext = `.${path.split('.').pop()}`;
        return includedExtensions.has(ext) && !excludedPatterns.some(p => p.test(path));
    });

  const hasPackage = data.tree.some((f: any) => f.path === "package.json");
  if (!hasPackage) {
      console.warn("package.json NOT FOUND in repo tree");
  }

  console.log("TOTAL FILES:", data.tree.length);
  console.log("PACKAGE EXISTS:", hasPackage);


  // 2. Clean Paths
  rawFiles = rawFiles.map((f: any) => ({
    ...f,
    path: f.path.replace(/\\/g, "/")
  }));

  // 3. Deduplicate
  const dedupMap = new Map();
  for (const f of rawFiles) {
    dedupMap.set(f.path, f);
  }
  let uniqueFiles = Array.from(dedupMap.values());

  // 4. Smart Sampling (Priority Sort)
  uniqueNodesSort(uniqueFiles);

  // Limit to 300 for structural map, but only fetch content for top 100 for routes
  const filesToFetch = uniqueFiles.slice(0, 80);
  const remainingFiles = uniqueFiles.slice(80, 200);

  // 5. Fetch Content for Top Files (with batching)
  const fileInputs: FileInput[] = await Promise.all(
    filesToFetch.map(async (f: any) => {
        try {
            const content = await fetchFileContent(owner, repo, f.sha);
            let id = f.path;
            let isConfigRoot = false;
            let isConfigSub = false;

            if (f.path === "package.json") {
                id = "package.json";
                isConfigRoot = true;
            } else if (f.path.endsWith("/package.json")) {
                id = f.path.replace(/\//g, "_");
                isConfigSub = true;
            }

            return {
                id: id,
                content: content,
                extension: "." + f.path.split(".").pop(),
                isConfigRoot,
                isConfigSub,
                isPrimary: isConfigRoot
            };
        } catch (e) {
            return { id: f.path, content: "", extension: "." + f.path.split(".").pop() };
        }
    })
  );

  const fallbackInputs: FileInput[] = remainingFiles.map(f => {
      let id = f.path;
      let isConfigRoot = false;
      let isConfigSub = false;

      if (f.path === "package.json") {
          id = "package.json";
          isConfigRoot = true;
      } else if (f.path.endsWith("/package.json")) {
          id = f.path.replace(/\//g, "_");
          isConfigSub = true;
      }

      return {
          id: id,
          content: "",
          extension: "." + f.path.split(".").pop(),
          isConfigRoot,
          isConfigSub,
          isPrimary: isConfigRoot
      };
  });

  return [...fileInputs, ...fallbackInputs];
}

async function fetchFileContent(owner: string, repo: string, sha: string): Promise<string> {
    const url = `https://api.github.com/repos/${owner}/${repo}/git/blobs/${sha}`;
    const res = await fetchWithRetry(url, { headers: getGitHubHeaders() });
    const data: any = await res.json();
    return Buffer.from(data.content, "base64").toString("utf8");
}

function uniqueNodesSort(files: any[]) {
    files.sort((a, b) => getPriority(b.path) - getPriority(a.path));
}

// ---------------------------------------------------------------------------
// Import Analysis Utilities
// ---------------------------------------------------------------------------

function extractImports(content: string, ext: string): string[] {
    const imports: string[] = [];
    if (!content) return [];

    if (['.js', '.ts', '.jsx', '.tsx'].includes(ext)) {
        const patterns = [
            /import\s+.*?from\s+['"](.*?)['"]/g,
            /require\(['"](.*?)['"]\)/g,
            /from\s+['"](.*?)['"]/g
        ];
        for (const p of patterns) {
            let match;
            while ((match = p.exec(content)) !== null) {
                if (match[1]) imports.push(match[1]);
            }
        }
    } else if (ext === '.py') {
        const patterns = [
            /from\s+(.*?)\s+import/g,
            /import\s+(.*)/g
        ];
        for (const p of patterns) {
            let match;
            while ((match = p.exec(content)) !== null) {
                if (match[1]) imports.push(match[1].trim());
            }
        }
    } else if (ext === '.java') {
        const pattern = /import\s+(.*?);/g;
        let match;
        while ((match = pattern.exec(content)) !== null) {
            if (match[1]) imports.push(match[1].trim());
        }
    }

    return Array.from(new Set(imports));
}

function resolveImport(importPath: string, currentFile: string, allFiles: string[]): string | null {
    if (!importPath.startsWith('.')) return null; // Only relative imports

    const segments = currentFile.split('/');
    segments.pop(); // Remove filename
    const base = segments.join('/');

    // 1. Absolute resolution relative to repo root
    let resolved = (base + '/' + importPath).replace(/\/+/g, '/').replace(/^\//, '');
    
    // Normalize path (handle ./ and ../)
    const parts = resolved.split('/');
    const stack: string[] = [];
    for (const p of parts) {
        if (p === '..') stack.pop();
        else if (p !== '.') stack.push(p);
    }
    resolved = stack.join('/');

    // 2. Try extensions
    const fallbacks = ['', '.ts', '.js', '.jsx', '.tsx', '/index.ts', '/index.js'];
    for (const fb of fallbacks) {
        const trial = resolved + fb;
        if (allFiles.includes(trial)) return trial;
    }

    return null;
}

// ---------------------------------------------------------------------------
// Main Ingestion Entry Point
// ---------------------------------------------------------------------------

/**
 * Ingests repository information and returns a normalized file + dependency list.
 */
export async function ingest(input: IngestionInput): Promise<IngestionOutput> {
  if (!input.repoUrl) {
    throw new Error("No repository URL provided");
  }

  const parsed = parseGitHubUrl(input.repoUrl);
  if (!parsed) throw new Error("Invalid GitHub URL");

  const branch = await getRepoMetadata(parsed.owner, parsed.repo);
  const files = await fetchGitHubTree(parsed.owner, parsed.repo, branch);
  const allFileIds = files.map(f => f.id);

  const dependencies: DependencyInput[] = [];

  // --- Step A: Tech Stack Detection ---
  let techStack: string[] = [];
  let sysMetadata: any = { totalDeps: 0, appType: "generic" };

  const pkgFile = files.find(f => f.id === "package.json");
  if (pkgFile?.content) {
    try {
      const pkg = JSON.parse(pkgFile.content);
      const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
      
      sysMetadata.totalDeps = Object.keys(deps).length;
      
      const libs = {
        "React": ["react", "react-dom"],
        "Next.js": ["next"],
        "Express": ["express"],
        "Tailwind": ["tailwindcss"],
        "Mongoose": ["mongoose"],
        "Vite": ["vite"],
        "FastAPI": ["fastapi"], // Placeholder if py
        "Docker": ["docker"]
      };

      for (const [name, keys] of Object.entries(libs)) {
        if (keys.some(k => deps[k])) techStack.push(name);
      }

      const hasBackend = deps["express"] || deps["mongoose"] || deps["pg"];
      const hasFrontend = deps["react"] || deps["next"] || deps["vue"];
      
      if (hasBackend && hasFrontend) sysMetadata.appType = "Fullstack Application";
      else if (hasFrontend) sysMetadata.appType = "Frontend-only Node";
      else if (hasBackend) sysMetadata.appType = "Backend Service";

      // Attach to package.json node
      pkgFile.techStack = techStack;
      pkgFile.isConfig = true;
      pkgFile.totalDeps = sysMetadata.totalDeps;
    } catch (e) {
      console.warn("Failed to parse package.json");
    }
  }

  // --- Step B: Edge Processing & Tag Propagation ---
  for (const file of files) {
    // Propagate framework tags
    if (techStack.includes("React") && (file.id.includes("src/") || file.id.includes("frontend/"))) {
        file.framework = "React";
    } else if (techStack.includes("Express") && (file.id.includes("api/") || file.id.includes("backend/"))) {
        file.framework = "Express";
    }

    if (!file.content) continue;
    const imports = extractImports(file.content, file.extension);
    let edgeCount = 0;
    
    for (const imp of imports) {
        const resolved = resolveImport(imp, file.id, allFileIds);
        if (resolved && resolved !== file.id) {
            dependencies.push({ from: file.id, to: resolved });
            edgeCount++;
            if (edgeCount >= 3) break; 
        }
    }
  }

  // Add SYSTEM -> package.json edge, and package.json -> sub_configs
  if (allFileIds.includes("package.json")) {
    dependencies.push({ from: "SYSTEM", to: "package.json" });
    
    // Connect root package.json to sub-configs
    files.forEach(f => {
        if (f.isConfigSub) {
            dependencies.push({ from: "package.json", to: f.id });
        }
    });
  }


  return { files, dependencies };
}
