import {
  forceSimulation,
  forceManyBody,
  forceCenter,
  forceCollide,
  forceLink,
  forceX,
  forceY,
  forceRadial,
} from 'd3-force';

/**
 * Force-directed layout engine (Obsidian-style radial clustering).
 *
 * Runs the D3 simulation synchronously to completion and returns
 * static positions for ReactFlow to render.
 *
 * Config (per spec):
 *   charge:    -900  (repulsion)
 *   link dist: 220–260
 *   collision: 130
 *   radial:    400–600
 *   link strength: 0.4
 */
export function applyForceLayout(nodes, edges, width = 1400, height = 900) {
  if (!nodes || nodes.length === 0) return nodes;

  const cx = width / 2;
  const cy = height / 2;

  // Compute degree (inbound + outbound) for each node
  const degree = {};
  nodes.forEach(n => { degree[n.id] = 0; });
  edges.forEach(e => {
    if (degree[e.source] !== undefined) degree[e.source]++;
    if (degree[e.target] !== undefined) degree[e.target]++;
  });

  // Clone nodes — D3 mutates them
  const simNodes = nodes.map(n => ({
    id: n.id,
    type: n.data?.type || 'file',
    isEntry: n.data?.isEntry || false,
    degree: degree[n.id] || 0,
    // Seed entry near center, others scattered
    x: n.data?.isEntry ? cx : cx + (Math.random() - 0.5) * width * 0.6,
    y: n.data?.isEntry ? cy : cy + (Math.random() - 0.5) * height * 0.6,
  }));

  // Map id → simNode for link resolution
  const nodeById = Object.fromEntries(simNodes.map(n => [n.id, n]));
  const validIds = new Set(simNodes.map(n => n.id));

  const simLinks = edges
    .filter(e => validIds.has(e.source) && validIds.has(e.target))
    .map(e => ({ source: e.source, target: e.target }));

  const simulation = forceSimulation(simNodes)
    // SECTION 1: INCREASE GLOBAL SPREAD
    // Repulsion — even stronger push for maximum breathing space
    .force('charge', forceManyBody().strength(-900))

    // SECTION 2: REDUCE CENTER CLUSTERING
    // Adaptive link distance: 220–260 px based on node degree
    .force('link', forceLink(simLinks)
      .id(d => d.id)
      .distance(d => {
        const deg = Math.max(d.source.degree, d.target.degree, 1);
        return Math.max(220, 260 - deg * 5);   // 220–260 px
      })
      .strength(0.4)) // Lower strength = less collapse

    // SECTION 4: LIMIT OVER-COMPRESSION
    // Larger collision radius = strictly no congestion
    .force('collision', forceCollide().radius(130).strength(0.9))

    // SECTION 3: ADD RADIAL DISTRIBUTION EFFECT
    // Pushes nodes outward toward specific rings
    .force('radial', forceRadial(d => {
      if (d.type === 'config-root') return 120;
      if (d.type === 'config-sub') return 220;
      return 500;
    }, cx, cy).strength(0.12))


    // Gravity variables
    .force('x', forceX(cx).strength(0.04))
    .force('y', forceY(cy).strength(0.04))

    // Center anchor — keeps cloud centered
    .force('center', forceCenter(cx, cy).strength(0.05))

    .alphaDecay(0.025)
    .stop();

  // Run until converged (alpha < 0.001) or max 500 ticks for wider spread
  const maxTicks = 500;
  for (let i = 0; i < maxTicks; i++) {
    simulation.tick();
    if (simulation.alpha() < 0.001) break;
  }

  // Map positions back to ReactFlow nodes
  const posMap = Object.fromEntries(simNodes.map(n => [n.id, { x: n.x, y: n.y }]));

  return nodes.map(n => ({
    ...n,
    position: posMap[n.id] || { x: cx, y: cy },
  }));
}
