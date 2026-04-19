import React, { useState, useRef, useEffect, useMemo } from 'react';
import { NODES, EDGES, CLUSTERS, HexagonNode } from '../utils/graphUtils';
import { 
  Maximize, 
  RefreshCw, 
  Info, 
  ChevronRight,
  ArrowRight,
  MousePointer2
} from 'lucide-react';

const GraphPanel = () => {
  // --- View State ---
  const [viewState, setViewState] = useState({ x: 0, y: 0, zoom: 1 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // --- Graph Interaction State ---
  const [activeNodeId, setActiveNodeId] = useState(null);
  const [hoverNodeId, setHoverNodeId] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const activeNode = useMemo(() => NODES.find(n => n.id === activeNodeId), [activeNodeId]);
  const connectedEdges = useMemo(() => 
    EDGES.filter(e => e.source === activeNodeId || e.target === activeNodeId), 
    [activeNodeId]
  );
  
  const connectedNodes = useMemo(() => {
    if (!activeNodeId) return [];
    const neighbors = new Set();
    connectedEdges.forEach(e => {
      neighbors.add(e.source === activeNodeId ? e.target : e.source);
    });
    return NODES.filter(n => neighbors.has(n.id));
  }, [activeNodeId, connectedEdges]);

  // --- Handlers ---
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseDown = (e) => {
    if (e.button === 0) { // Left click for pan
      isDragging.current = true;
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
    if (isDragging.current) {
      const dx = (e.clientX - lastMousePos.current.x) / viewState.zoom;
      const dy = (e.clientY - lastMousePos.current.y) / viewState.zoom;
      setViewState(prev => ({ ...prev, x: prev.x - dx, y: prev.y - dy }));
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomSpeed = 0.001;
    const newZoom = Math.max(0.2, Math.min(3, viewState.zoom - e.deltaY * zoomSpeed));
    setViewState(prev => ({ ...prev, zoom: newZoom }));
  };

  const resetView = () => setViewState({ x: 0, y: 0, zoom: 1 });

  const fitGraph = () => {
    if (NODES.length === 0) return;
    const minX = Math.min(...NODES.map(n => n.x)) - 100;
    const maxX = Math.max(...NODES.map(n => n.x)) + 100;
    const minY = Math.min(...NODES.map(n => n.y)) - 100;
    const maxY = Math.max(...NODES.map(n => n.y)) + 100;
    
    const graphWidth = maxX - minX;
    const graphHeight = maxY - minY;
    
    const zoom = Math.min(
      containerSize.width / graphWidth,
      containerSize.height / graphHeight,
      1
    );
    
    setViewState({
      x: minX + (graphWidth - containerSize.width / zoom) / 2,
      y: minY + (graphHeight - containerSize.height / zoom) / 2,
      zoom
    });
  };

  // --- Rendering Helpers ---
  const renderEdge = (edge) => {
    const source = NODES.find(n => n.id === edge.source);
    const target = NODES.find(n => n.id === edge.target);
    if (!source || !target) return null;

    // Cubic Bezier Curve logic
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const ctrlDist = dist * 0.3;
    
    // Control points to create a smooth curve
    const cp1x = source.x + ctrlDist;
    const cp1y = source.y;
    const cp2x = target.x - ctrlDist;
    const cp2y = target.y;

    const isActive = activeNodeId === edge.source || activeNodeId === edge.target;
    const color = isActive ? '#6366f1' : '#1e293b';

    return (
      <g key={edge.id}>
        <defs>
          <marker
            id={`arrowhead-${edge.id}`}
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill={color} />
          </marker>
        </defs>
        
        {/* Shadow / Glow path */}
        <path
          d={`M ${source.x} ${source.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${target.x} ${target.y}`}
          fill="none"
          stroke={color}
          strokeWidth={isActive ? 3 : 1.5}
          strokeOpacity={isActive ? 0.3 : 0.1}
          pointerEvents="none"
        />

        {/* Animated flow path */}
        <path
          d={`M ${source.x} ${source.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${target.x} ${target.y}`}
          fill="none"
          stroke={color}
          strokeWidth={isActive ? 2 : 1.5}
          strokeDasharray={isActive ? "5,5" : "none"}
          markerEnd={`url(#arrowhead-${edge.id})`}
          className={isActive ? "animate-edge-flow" : ""}
          style={{ transition: 'stroke 0.3s' }}
        />

        {/* Hover area */}
        <path
          d={`M ${source.x} ${source.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${target.x} ${target.y}`}
          fill="none"
          stroke="transparent"
          strokeWidth="10"
          className="cursor-pointer"
          onMouseEnter={() => {/* Optional: edge hover state */}}
        />
      </g>
    );
  };

  const viewBox = `${viewState.x} ${viewState.y} ${containerSize.width / viewState.zoom} ${containerSize.height / viewState.zoom}`;

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-[#0f0f13] overflow-hidden select-none font-sans flex text-[#f1f5f9]"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      <style>{`
        @keyframes edgeFlow {
          from { stroke-dashoffset: 20; }
          to { stroke-dashoffset: 0; }
        }
        .animate-edge-flow {
          animation: edgeFlow 1s linear infinite;
        }
        .dot-grid {
          background-image: radial-gradient(#1e293b 1px, transparent 1px);
          background-size: 30px 30px;
        }
      `}</style>
      
      {/* Dot Grid Layer */}
      <div className="absolute inset-0 dot-grid opacity-20 pointer-events-none" 
           style={{ transform: `scale(${viewState.zoom}) translate(${-viewState.x}px, ${-viewState.y}px)` }} />

      {/* SVG Canvas */}
      <svg className="w-full h-full relative z-0" viewBox={viewBox}>
        <g>
          {EDGES.map(renderEdge)}
          {NODES.map(node => (
            <HexagonNode
              key={node.id}
              {...node}
              isActive={activeNodeId === node.id}
              isHovered={hoverNodeId === node.id}
              onClick={(e) => {
                e.stopPropagation();
                setActiveNodeId(prev => prev === node.id ? null : node.id);
              }}
              onHover={(val) => setHoverNodeId(val ? node.id : null)}
            />
          ))}
        </g>
      </svg>

      {/* Legend - Top Left */}
      <div className="absolute top-6 left-6 z-10 bg-slate-900/80 backdrop-blur-md border border-slate-800 p-4 rounded-xl shadow-2xl">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Clusters</h4>
        <div className="space-y-2">
          {Object.values(CLUSTERS).map(c => (
            <div key={c.id} className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full border border-white/10" style={{ backgroundColor: c.border }} />
              <span className="text-sm font-medium text-slate-300">{c.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Toolbar - Top Right */}
      <div className="absolute top-6 right-[420px] z-10 flex gap-2">
        <button 
          onClick={resetView}
          className="flex items-center gap-2 px-3 py-2 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-lg text-sm font-medium hover:bg-indigo-600/20 hover:border-indigo-500/50 transition-all"
        >
          <RefreshCw className="w-4 h-4" /> Reset
        </button>
        <button 
          onClick={fitGraph}
          className="flex items-center gap-2 px-3 py-2 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-lg text-sm font-medium hover:bg-indigo-600/20 hover:border-indigo-500/50 transition-all"
        >
          <Maximize className="w-4 h-4" /> Fit Graph
        </button>
      </div>

      {/* Sidebar Panel - Details */}
      <div className={`absolute top-0 right-0 w-[400px] h-full bg-[#111827] border-l border-[#1e293b] z-20 transition-transform duration-500 shadow-2xl ${activeNodeId ? 'translate-x-0' : 'translate-x-full'}`}>
        {activeNode && (
          <div className="p-8 h-full flex flex-col">
            <div className="flex items-start justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider" 
                       style={{ backgroundColor: CLUSTERS[activeNode.cluster].fill, color: CLUSTERS[activeNode.cluster].text, border: `1px solid ${CLUSTERS[activeNode.cluster].border}` }}>
                    {CLUSTERS[activeNode.cluster].label}
                  </div>
                </div>
                <h2 className="text-3xl font-bold">{activeNode.label}</h2>
              </div>
              <button onClick={() => setActiveNodeId(null)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-500">
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            <p className="text-slate-400 text-sm leading-relaxed mb-10">
              {activeNode.description}
            </p>

            <div className="flex-1 space-y-8 overflow-y-auto pr-4 scrollbar-hide">
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <ArrowRight className="w-3 h-3" /> Connected Components ({connectedNodes.length})
                </h4>
                <div className="space-y-3">
                  {connectedNodes.map(node => (
                    <div 
                      key={node.id}
                      onClick={() => setActiveNodeId(node.id)}
                      className="group flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 hover:border-indigo-500/50 cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CLUSTERS[node.cluster].border }} />
                        <span className="text-sm font-medium text-slate-300 group-hover:text-white">{node.label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-slate-800 flex items-center gap-3 text-slate-500">
              <Info className="w-4 h-4" />
              <span className="text-xs">Click neighboring nodes to explore dependencies</span>
            </div>
          </div>
        )}
      </div>

      {/* Tooltip */}
      {hoverNodeId && !activeNodeId && (
        <div 
          className="fixed pointer-events-none z-50 bg-[#1e293b] border p-4 rounded-lg shadow-2xl min-w-[200px]"
          style={{ 
            left: mousePos.x + 20, 
            top: mousePos.y + 20,
            borderColor: CLUSTERS[NODES.find(n => n.id === hoverNodeId).cluster].border
          }}
        >
          <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: CLUSTERS[NODES.find(n => n.id === hoverNodeId).cluster].text }}>
            {CLUSTERS[NODES.find(n => n.id === hoverNodeId).cluster].label}
          </div>
          <div className="text-sm font-bold text-white mb-2">{NODES.find(n => n.id === hoverNodeId).label}</div>
          <p className="text-[11px] text-slate-400 leading-tight">
            {NODES.find(n => n.id === hoverNodeId).description}
          </p>
        </div>
      )}

      {/* Interaction Hint */}
      {!activeNodeId && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-slate-900/50 backdrop-blur-md px-6 py-3 rounded-full border border-slate-800 flex items-center gap-4 text-xs font-medium text-slate-400">
          <div className="flex items-center gap-1.5"><MousePointer2 className="w-3 h-3" /> Pan/Zoom Canvas</div>
          <div className="w-1 h-1 rounded-full bg-slate-700" />
          <div>Click node to inspect</div>
        </div>
      )}
    </div>
  );
};

export default GraphPanel;
