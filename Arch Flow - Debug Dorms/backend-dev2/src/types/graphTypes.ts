export type FileInput = {
  id: string;
  content: string;
  extension: string;
  techStack?: string[];
  isConfig?: boolean;
  totalDeps?: number;
  framework?: string;
  isPrimary?: boolean;
  isConfigRoot?: boolean;
  isConfigSub?: boolean;
};

export type DependencyInput = {
  from: string;
  to: string;
};

export type RepoAnalyzerInput = {
  files: FileInput[];
  dependencies: DependencyInput[];
};

export type GraphNode = {
  id: string;
  name: string;
  label: string;
  folder: string;
  layer: string;
  impact: number;
  dependencies: string[];
  dependents: string[];
  type: 'file' | 'folder' | 'config-root' | 'config-sub';
  position: { x: number; y: number };
  highlight: boolean;
  isPrimary?: boolean;
  isConfigRoot?: boolean;
  isConfigSub?: boolean;
  techStack?: string[];
  framework?: string;
  isConfig?: boolean;
  totalDeps?: number;
  priority?: "HIGH" | "MEDIUM" | "LOW";
  priorityScore?: number;
  normalizedScore?: number;
  semanticScore?: number;
  inDegree?: number;
  outDegree?: number;
};

export type GraphEdge = {
  source: string;
  target: string;
  relation?: 'hierarchy' | 'dependency';
};

export type GraphViews = {
  default: string[];
  highImpact: string[];
  entryPoints: string[];
  byFolder: Record<string, string[]>;
};

export type QueryContext = {
  topNodes: string[];
  entryPoints: string[];
  nodeMap: Record<string, GraphNode>;
};

export type AnalysisResult = {
  graph: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
  views: GraphViews;
  nodeMap: Record<string, GraphNode>;
  searchIndex: Record<string, string[]>;
  queryContext: QueryContext;
  metadata: {
    version: string;
    totalFiles: number;
    totalEdges: number;
    validEdges: number;
    isLargeGraph: boolean;
    payloadSize: number;
    entryNodeId: string | null;
  };
};

export type QueryRequest = {
  query: string;
  context: AnalysisResult;
};

export type QueryResponse = {
  answer: string;
  highlightNodes: string[];
  focusNode: string;
};
