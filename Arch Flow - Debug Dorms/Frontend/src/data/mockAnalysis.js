/**
 * Master Mock Analysis Data
 * Strictly aligned with backend AnalysisResult schema.
 */
export const mockAnalysis = {
  graph: {
    nodes: [
      { id: "src/index.ts", name: "index.ts", label: "index.ts", folder: "src", layer: "entry", impact: 3, position: { x: 250, y: 0 }, highlight: false },
      { id: "src/auth/authService.ts", name: "authService.ts", label: "authService.ts", folder: "src/auth", layer: "service", impact: 2, position: { x: 100, y: 150 }, highlight: false },
      { id: "src/auth/loginController.ts", name: "loginController.ts", label: "loginController.ts", folder: "src/auth", layer: "controller", impact: 1, position: { x: 400, y: 150 }, highlight: false },
      { id: "src/db/connection.ts", name: "connection.ts", label: "connection.ts", folder: "src/db", layer: "infrastructure", impact: 0, position: { x: 250, y: 300 }, highlight: false }
    ],
    edges: [
      { source: "src/index.ts", target: "src/auth/loginController.ts" },
      { source: "src/auth/loginController.ts", target: "src/auth/authService.ts" },
      { source: "src/auth/authService.ts", target: "src/db/connection.ts" }
    ]
  },
  views: {
    default: ["src/index.ts", "src/auth/authService.ts", "src/auth/loginController.ts", "src/db/connection.ts"],
    highImpact: ["src/index.ts", "src/auth/authService.ts"],
    entryPoints: ["src/index.ts"],
    byFolder: {
      "src": ["src/index.ts"],
      "src/auth": ["src/auth/authService.ts", "src/auth/loginController.ts"],
      "src/db": ["src/db/connection.ts"]
    }
  },
  nodeMap: {
    "src/index.ts": { id: "src/index.ts", name: "index.ts", impact: 3, folder: "src" },
    "src/auth/authService.ts": { id: "src/auth/authService.ts", name: "authService.ts", impact: 2, folder: "src/auth" },
    "src/auth/loginController.ts": { id: "src/auth/loginController.ts", name: "loginController.ts", impact: 1, folder: "src/auth" },
    "src/db/connection.ts": { id: "src/db/connection.ts", name: "connection.ts", impact: 0, folder: "src/db" }
  },
  searchIndex: {
    "auth": ["src/auth/authService.ts", "src/auth/loginController.ts"],
    "index": ["src/index.ts"],
    "db": ["src/db/connection.ts"],
    "login": ["src/auth/loginController.ts"]
  },
  queryContext: {
    topNodes: ["src/index.ts", "src/auth/authService.ts"],
    entryPoints: ["src/index.ts"],
    nodeMap: {} // Simplified for demo
  },
  metadata: {
    totalFiles: 4,
    totalEdges: 3,
    validEdges: 3,
    isLargeGraph: false,
    payloadSize: 1.2
  }
};
