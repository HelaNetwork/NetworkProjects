import { Graph } from "graphlib";
import { 
  GraphNode, 
  GraphEdge, 
  FileInput, 
  DependencyInput, 
  AnalysisResult 
} from "../types/graphTypes";
import { detectLayer } from "./layerDetector";
import { tokenize } from "../utils/tokenizer";
import { computeLayout } from "./layoutEngine";
import { buildViews } from "../views/viewBuilder";
import { computePriority } from "../intelligence/priorityEngine";

/**
 * Builds the architecture graph and computes all derived views and metadata.
 */
export function buildArchitectureGraph(input: {
  files: FileInput[];
  dependencies: DependencyInput[];
}): AnalysisResult {
  const g = new Graph({ directed: true });
  
  // 1. Initialize nodes and indices
  const allNodes: GraphNode[] = [];
  const nodesMap = new Map<string, GraphNode>();
  const folderSet = new Set<string>();

  // 1a. File Node Creation
  for (const file of input.files) {
    const segments = file.id.split("/");
    const name = segments[segments.length - 1];
    const folder = segments.length > 1 ? segments.slice(0, -1).join("/") : "root";
    folderSet.add(folder);

    const node: GraphNode = {
      id: file.id,
      name,
      label: name,
      folder,
      layer: detectLayer(file.id),
      impact: 0,
      dependencies: [],
      dependents: [],
      type: file.isConfigRoot ? 'config-root' : (file.isConfigSub ? 'config-sub' : 'file'),
      position: { x: 0, y: 0 },
      highlight: false,
      isConfigRoot: file.isConfigRoot,
      isConfigSub: file.isConfigSub,
      isPrimary: file.isPrimary
    };

    nodesMap.set(file.id, node);
    allNodes.push(node);
    g.setNode(file.id);
  }

  // --- Mandatory Fallback Injection ---
  const hasRootPackage = allNodes.some(n => n.id === "package.json");
  if (!hasRootPackage) {
      console.warn("package.json NOT FOUND — FORCE-INJECTING FALLBACK");
      const fallback: GraphNode = {
          id: "package.json",
          name: "package.json",
          label: "package.json",
          folder: "root",
          layer: "infrastructure",
          impact: 10,
          dependencies: [],
          dependents: [],
          type: 'config-root',
          position: { x: 0, y: 0 },
          highlight: false,
          isConfigRoot: true,
          isPrimary: true
      };
      nodesMap.set("package.json", fallback);
      allNodes.push(fallback);
      g.setNode("package.json");
  }
  
  console.log("NODE EXISTS (package.json):", nodesMap.has("package.json"));


  // 1b. Folder Node Creation (City Centers)
  for (const folderPath of folderSet) {
    if (nodesMap.has(folderPath)) continue; 
    
    const node: GraphNode = {
        id: folderPath,
        name: folderPath.split("/").pop() || "root",
        label: folderPath.split("/").pop() || "root",
        folder: folderPath.split("/").slice(0, -1).join("/") || "root",
        layer: "infrastructure",
        impact: 0,
        dependencies: [],
        dependents: [],
        type: 'folder',
        position: { x: 0, y: 0 },
        highlight: false
    };
    nodesMap.set(folderPath, node);
    allNodes.push(node);
    g.setNode(folderPath);
  }

  // 2. Add Dependency Edges (Validated Imports)
  for (const dep of input.dependencies) {
    const sourceNode = nodesMap.get(dep.from);
    const targetNode = nodesMap.get(dep.to);

    if (sourceNode && targetNode) {
      g.setEdge(dep.from, dep.to, { relation: 'dependency' });
      if (!sourceNode.dependencies.includes(dep.to)) sourceNode.dependencies.push(dep.to);
      if (!targetNode.dependents.includes(dep.from)) targetNode.dependents.push(dep.from);
    }
  }

  // 3. Node Metrics (Global Impact) & Entry Detection
  let entryNodeId: string | null = null;
  const entryPriority = (id: string) => {
      const name = id.split("/").pop()?.toLowerCase() || "";
      const isRoot = !id.includes("/");
      if (name.startsWith("index")) return isRoot ? 100 : 90;
      if (name.startsWith("main")) return isRoot ? 80 : 70;
      if (name.startsWith("app")) return isRoot ? 60 : 50;
      if (name.startsWith("server")) return isRoot ? 40 : 30;
      return 0;
  };

  let maxPrio = -1;
  for (const node of allNodes) {
    node.impact = Math.min((node.dependents.length || 0) + (node.dependencies.length || 0), 20);
    
    const prio = entryPriority(node.id);
    if (prio > maxPrio) {
        maxPrio = prio;
        entryNodeId = node.id;
    }
  }

  // Fallback Entry (Highest Connectivity root node)
  if (!entryNodeId || maxPrio === 0) {
      const rootNodes = allNodes.filter(n => !n.id.includes("/"));
      const best = (rootNodes.length > 0 ? rootNodes : allNodes).sort((a, b) => b.impact - a.impact)[0];
      entryNodeId = best?.id || allNodes[0]?.id || null;
  }

  // 4. Strict Pruning (Top 20 selection)
  // PRUNE BEFORE EDGE ASSEMBLY as per LOCKED spec
  const sortedNodes = [...allNodes].sort((a, b) => {
      // Priority: Root proximity + Impact
      const depthA = a.id.split("/").length;
      const depthB = b.id.split("/").length;
      if (depthA !== depthB) return depthA - depthB;
      return b.impact - a.impact;
  });

  const visibleSubset = sortedNodes.slice(0, 20);
  const visibleNodeIds = new Set(visibleSubset.map(n => n.id));

  // Ensure Entry Node is visible
  if (entryNodeId && !visibleNodeIds.has(entryNodeId)) {
      const entryNode = nodesMap.get(entryNodeId);
      if (entryNode) visibleSubset.push(entryNode);
  }

  // PRUNING IMMUNITY: package.json must ALWAYS be visible
  if (!visibleNodeIds.has("package.json")) {
    const pkg = nodesMap.get("package.json");
    if (pkg) visibleSubset.push(pkg);
  }


  // Ensure Folder parents are visible for files
  const finalVisibleNodes: GraphNode[] = [];
  const addedIds = new Set<string>();

  for (const node of visibleSubset) {
      if (addedIds.has(node.id)) continue;
      finalVisibleNodes.push(node);
      addedIds.add(node.id);
      
      if (node.type === 'file' && node.folder && !addedIds.has(node.folder)) {
          const folderNode = nodesMap.get(node.folder);
          if (folderNode) {
              finalVisibleNodes.push(folderNode);
              addedIds.add(node.folder);
          }
      }
  }

  // Final trim to ~20 total nodes
  const finalSubset = finalVisibleNodes.slice(0, 22);
  const finalSubsetIds = new Set(finalSubset.map(n => n.id));

  // 5. Final Edge Sanitization (LOCKED SPEC)
  const edgeSet = new Set<string>();
  const sanitizedEdges: GraphEdge[] = [];
  
  input.dependencies.forEach(dep => {
      if (!dep.from || !dep.to) return;
      if (dep.from === dep.to) return;
      if (!finalSubsetIds.has(dep.from) || !finalSubsetIds.has(dep.to)) return;
      
      const key = `${dep.from}->${dep.to}`;
      if (!edgeSet.has(key)) {
          edgeSet.add(key);
          sanitizedEdges.push({ source: dep.from, target: dep.to, relation: 'dependency' });
      }
  });

  // 6. Root Detection & Connectivity Guarantee (DEMO SAFE)
  const incomingCount: Record<string, number> = {};
  finalSubset.forEach(n => incomingCount[n.id] = 0);
  sanitizedEdges.forEach(e => incomingCount[e.target] = (incomingCount[e.target] || 0) + 1);

  let entryNodes = finalSubset.filter(n => incomingCount[n.id] === 0);
  let finalRootId = entryNodeId;

  // 6a. Virtual Root implementation
  if (entryNodes.length > 1) {
      const virtualRoot: GraphNode = {
          id: "**root**",
          name: "SYSTEM",
          label: "SYSTEM",
          folder: "root",
          layer: "infrastructure",
          impact: 20,
          dependencies: entryNodes.map(n => n.id),
          dependents: [],
          type: 'folder',
          position: { x: 0, y: 0 },
          highlight: true
      };
      
      finalSubset.unshift(virtualRoot);
      entryNodes.forEach(node => {
          sanitizedEdges.push({ source: "**root**", target: node.id, relation: 'dependency' });
      });
      finalRootId = "**root**";
  }

  // 6b. Reachability Check & Orphan Recovery
  const visited = new Set<string>();
  const queue = [finalRootId || finalSubset[0]?.id];
  while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);
      sanitizedEdges.filter(e => e.source === current).forEach(e => queue.push(e.target));
  }

  // Attach unvisited nodes to root
  finalSubset.forEach(node => {
      if (!visited.has(node.id) && node.id !== finalRootId) {
          sanitizedEdges.push({ source: finalRootId || "**root**", target: node.id, relation: 'dependency' });
      }
  });

  // 6c. Adaptive Priority Enrichment
  const enrichedNodes = computePriority(finalSubset, sanitizedEdges);

  // 7. Assemble Result
  if (enrichedNodes.length < 1) {
      return {
          graph: { nodes: [], edges: [] },
          views: { default: [], highImpact: [], entryPoints: [], byFolder: {} },
          nodeMap: {},
          searchIndex: {},
          queryContext: { topNodes: [], entryPoints: [], nodeMap: {} },
          metadata: { version: "FALLBACK", totalFiles: 0, totalEdges: 0, validEdges: 0, isLargeGraph: false, payloadSize: 0, entryNodeId: null }
      };
  }

  return {
    graph: {
      nodes: enrichedNodes,
      edges: sanitizedEdges
    },
    views: { default: [], highImpact: [], entryPoints: [], byFolder: {} },
    nodeMap: Object.fromEntries(nodesMap.entries()),
    searchIndex: {},
    queryContext: { topNodes: [], entryPoints: [], nodeMap: {} },
    metadata: {
        version: "HIERARCHY-LOCKED-V1",
        totalFiles: input.files.length,
        totalEdges: input.dependencies.length,
        validEdges: sanitizedEdges.length,
        isLargeGraph: allNodes.length > 200,
        payloadSize: 0,
        entryNodeId: finalRootId || finalSubset[0]?.id
    }
  };
}
