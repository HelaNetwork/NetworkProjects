import { useState, useEffect, useCallback, useMemo } from 'react'
import { useLocation, Link } from 'react-router-dom'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  MarkerType,
  Panel,
} from 'reactflow'
import 'reactflow/dist/style.css'
import {
  ArrowLeft, Sparkles, X, ArrowDownRight, ArrowUpRight,
  Cpu, GitBranch, Layers, AlertTriangle, FileCode,
  TrendingUp, ChevronRight, MessageSquare, Send, Bot, User,
  Zap, Settings
} from 'lucide-react'
import { analyzeRepository, queryCodebase } from './services/api'
import ArchNode from './components/ArchNode'
import { applyForceLayout } from './utils/forceLayout'

// ── Node type registry ──────────────────────────────────────────────────────
const nodeTypes = { arch: ArchNode };

// ── Edge constants ──────────────────────────────────────────────────────────
const EDGE_DEFAULT = {
  stroke: '#9CA3AF',
  strokeWidth: 2.2,
  opacity: 0.6,
};
const EDGE_ACTIVE = {
  stroke: '#6366F1',
  strokeWidth: 3.5,
  opacity: 1,
};
const EDGE_DIM = {
  stroke: '#9CA3AF',
  strokeWidth: 1.2,
  opacity: 0.08,
};
const MARKER_DEFAULT = {
  type: MarkerType.ArrowClosed,
  width: 13,
  height: 13,
  color: '#9CA3AF',
};
const MARKER_ACTIVE = {
  type: MarkerType.ArrowClosed,
  width: 15,
  height: 15,
  color: '#6366F1',
};

// ── Helpers ─────────────────────────────────────────────────────────────────
function classifyRole(id = '') {
  const p = id.toLowerCase();
  if (p.includes('component') || p.includes('page') || p.includes('view')) return 'UI';
  if (p.includes('route') || p.includes('controller') || p.includes('api') || p.includes('handler')) return 'API';
  if (p.includes('service') || p.includes('util') || p.includes('lib') || p.includes('core')) return 'CORE';
  if (p.includes('config') || p.includes('env') || p.includes('.json')) return 'CONFIG';
  return 'MODULE';
}

function impactMeta(totalDeg) {
  if (totalDeg >= 10) return { label: 'CRITICAL', color: '#F87171', bg: 'rgba(239,68,68,0.12)' };
  if (totalDeg >= 6) return { label: 'HIGH', color: '#FB923C', bg: 'rgba(249,115,22,0.12)' };
  if (totalDeg >= 2) return { label: 'MEDIUM', color: '#34D399', bg: 'rgba(52,211,153,0.1)' };
  return { label: 'LOW', color: '#9CA3AF', bg: 'rgba(156,163,175,0.08)' };
}

// ════════════════════════════════════════════════════════════════════════════
export default function AnalysisPage() {
  console.log('DEBUG: AnalysisPage mounted');
  const location = useLocation();
  const repoUrl = location.state?.repoUrl || '';
  const { fitView } = useReactFlow();

  // ── State ────────────────────────────────────────────────────────────────
  const [rawEdges, setRawEdges] = useState([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [highlightState, setHighlightState] = useState({
    mode: 'none', // 'node' | 'multi' | 'none'
    nodes: []     // array of node IDs
  });
  const [status, setStatus] = useState('INGESTING');
  const [showOverlay, setShowOverlay] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState('INFO'); // 'INFO' | 'CHAT'
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hello! I can help you understand this architecture. Ask me anything about the codebase or select a node to focus my context.' }
  ]);

  // ── Build graph from backend result ─────────────────────────────────────
  const syncGraphData = useCallback((result) => {
    console.log('DEBUG: syncGraphData received:', result);

    const rawNodes = result?.graph?.nodes;
    const rawEdgesData = result?.graph?.edges;
    const entryId = result?.metadata?.entryNodeId;

    if (!rawNodes || rawNodes.length === 0) {
      setStatus('ERROR');
      setErrorMsg('Backend returned no nodes. Check the repository URL.');
      return;
    }

    // ── 0. Extract System Intelligence ────────────────────────────────
    const pkgNode = rawNodes.find(n => n.id === "package.json");
    const globalTech = pkgNode?.techStack || [];
    const appType = pkgNode?.appType || (globalTech.length > 0 ? "Web Application" : "Generic Library");

    // ── 1. Compute degree maps from raw edges ─────────────────────────────
    const outMap = {};   // id → [targetId, …]
    const inMap = {};   // id → [sourceId, …]
    rawNodes.forEach(n => { outMap[String(n.id)] = []; inMap[String(n.id)] = []; });
    (rawEdgesData || []).forEach(e => {
      const s = String(e.source), t = String(e.target);
      if (outMap[s] && t !== s) outMap[s].push(t);
      if (inMap[t] && t !== s) inMap[t].push(s);
    });

    // ── 2. Build RF nodes ─────────────────────────────────────────────────
    const rfNodes = rawNodes
      .filter(n => n && n.id)
      .map(n => {
        const id = String(n.id);
        const dep = outMap[id] || [];
        const dpt = inMap[id] || [];
        
        // Propagate global tech to SYSTEM
        if (id === 'SYSTEM') {
            n.techStack = globalTech;
            n.appType = appType;
        }

        return {
          id,
          type: 'arch',
          data: {
            ...n,
            id,
            label: n.id === 'SYSTEM' ? 'SYSTEM' : (n.label || id.split('/').pop()),
            isEntry: id === entryId || n.isEntry,
            role: classifyRole(id),
            dependencies: dep,
            dependents: dpt,
            impact: dep.length + dpt.length,
          },
          position: { x: 0, y: 0 },
        };
      });

    // ── 3. Build RF edges ─────────────────────────────────────────────────
    const idSet = new Set(rfNodes.map(n => n.id));
    const rfEdges = (rawEdgesData || [])
      .filter(e => e.source && e.target
        && idSet.has(String(e.source))
        && idSet.has(String(e.target))
        && String(e.source) !== String(e.target))
      .map((e, i) => ({
        id: `e-${i}-${e.source}-${e.target}`,
        source: String(e.source),
        target: String(e.target),
        type: 'smoothstep',
        animated: false,
        style: { ...EDGE_DEFAULT },
        markerEnd: { ...MARKER_DEFAULT },
      }));

    // ── 4. Deduplicate edges ──────────────────────────────────────────────
    const seen = new Set();
    const dedupedEdges = rfEdges.filter(e => {
      const key = `${e.source}→${e.target}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // ── 5. Force-directed layout ──────────────────────────────────────────
    let positioned;
    try {
      positioned = applyForceLayout(rfNodes, dedupedEdges, 1600, 1000);
      console.log('DEBUG: Force layout complete —', positioned.length, 'nodes,', dedupedEdges.length, 'edges');
    } catch (err) {
      console.error('DEBUG: Force layout failed:', err);
      positioned = rfNodes;
    }

    setRawEdges(dedupedEdges);
    setNodes(positioned);
    setEdges(dedupedEdges);

    // ── Reveal sequence ───────────────────────────────────────────────────
    const safetyTimer = setTimeout(() => {
      setStatus('READY');
      setShowOverlay(false);
    }, 4500);

    setTimeout(() => {
      clearTimeout(safetyTimer);
      setStatus('READY');
      setTimeout(() => setShowOverlay(false), 500);
    }, 800);

  }, [setNodes, setEdges]);

  // ── Trigger analysis ─────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        setStatus('INGESTING');
        const result = await analyzeRepository(repoUrl);
        setStatus('MAPPING');
        syncGraphData(result);
      } catch (err) {
        console.error('ANALYSIS ERROR:', err);
        setStatus('ERROR');
        setErrorMsg('Failed to fetch repository data. Please verify the URL or your GitHub token.');
        setShowOverlay(false);
      }
    })();
  }, [repoUrl, syncGraphData]);

  // ── Auto-fitView after overlay clears ────────────────────────────────────
  useEffect(() => {
    if (!fitView) return;
    if (nodes.length === 0) return;
    if (showOverlay) return;
    const t = setTimeout(() => fitView({ padding: 0.15, duration: 800 }), 120);
    return () => clearTimeout(t);
  }, [nodes, showOverlay, fitView]);

  // ── Unified Highlighting Engine ──────────────────────────────────────────
  useEffect(() => {
    const hasHighlight = highlightState.nodes.length > 0;

    setNodes(prev => prev.map(n => {
      const isFocused = !hasHighlight || highlightState.nodes.includes(n.id);
      return {
        ...n,
        style: {
          ...n.style,
          opacity: isFocused ? 1 : 0.25
        }
      };
    }));

    setEdges(prev => prev.map(e => {
      const isConnected = !hasHighlight || 
                          highlightState.nodes.includes(e.source) || 
                          highlightState.nodes.includes(e.target);
      return {
        ...e,
        style: {
          ...e.style,
          opacity: isConnected ? 1 : 0.15
        }
      };
    }));

    if (highlightState.mode === 'multi' && highlightState.nodes.length > 0) {
      const nodesToFocus = nodes.filter(n => highlightState.nodes.includes(n.id));
      if (nodesToFocus.length > 0) {
        const timeoutId = setTimeout(() => {
          fitView({ nodes: nodesToFocus, duration: 500, padding: 0.2 });
        }, 100);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [highlightState, setNodes, setEdges, fitView, nodes]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const onNodeClick = useCallback((_, n) => {
    setSelectedNode(n.data);
    setHighlightState({ mode: 'node', nodes: [n.id] });
    
    if (activeTab === 'CHAT') {
      const fileName = n.data.label || n.data.id.split('/').pop();
      setMessages(prev => [...prev, { role: 'ai', text: `I see you've selected ${fileName}. It has ${n.data.dependencies?.length || 0} dependencies and an impact level of ${n.data.priority || 'LOW'}. What would you like to know about it?` }]);
    }
  }, [activeTab]);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setHighlightState({ mode: 'none', nodes: [] });
  }, []);

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = {
      role: "user",
      text: chatInput.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setChatInput("");

    try {
      console.log("📡 Sending to backend:", chatInput);

      // Construct context for the query
      const context = {
        nodeMap: nodes.reduce((acc, curr) => ({ ...acc, [curr.id]: curr.data }), {}),
        graph: {
          nodes: nodes.map(n => n.data),
          edges: rawEdges
        },
        queryContext: {
          topNodes: nodes.slice(0, 10).map(n => n.id)
        }
      };

      const data = await queryCodebase(chatInput.trim(), context);
      console.log("📦 Backend response:", data);

      const aiMessage = {
        role: "ai",
        text: data.answer || "No response received.",
      };

      setMessages(prev => [...prev, aiMessage]);

      // Graph highlights from AI
      if (data.highlightNodes && data.highlightNodes.length > 0) {
        setHighlightState({
          mode: data.highlightNodes.length > 1 ? 'multi' : 'node',
          nodes: data.highlightNodes
        });
      }

    } catch (err) {
      console.error("❌ API ERROR:", err);
      setMessages(prev => [
        ...prev,
        {
          role: "ai",
          text: "I'm having trouble connecting to my architecture engine right now. Please try again in a moment.",
        },
      ]);
    }
  };

  // ── Sidebar computed values ───────────────────────────────────────────────
  const sidebarImpact = useMemo(() => {
    if (!selectedNode) return null;
    const deg = (selectedNode.dependencies || []).length + (selectedNode.dependents || []).length;
    return impactMeta(deg);
  }, [selectedNode]);

  const sidebarDeps = useMemo(() => selectedNode?.dependencies || [], [selectedNode]);
  const sidebarDepts = useMemo(() => selectedNode?.dependents || [], [selectedNode]);

  // ════════════════════════════════════════════════════════════════════════
  return (
    <div style={{
      display: 'flex', height: '100vh', width: '100%',
      backgroundColor: '#070711', color: 'white',
      fontFamily: 'Inter, system-ui, sans-serif',
      overflow: 'hidden', position: 'relative',
    }}>

      {/* ── Loading Overlay ── */}
      {showOverlay && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 100,
          background: 'radial-gradient(circle at center, #0D1117 0%, #070711 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ textAlign: 'center', maxWidth: '360px' }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '20px', margin: '0 auto 32px',
              background: 'rgba(79,70,229,0.15)',
              border: '2px solid rgba(79,70,229,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'spin 2.5s linear infinite',
            }}>
              <Cpu style={{ width: '28px', height: '28px', color: '#818CF8' }} />
            </div>
            <h3 style={{
              fontSize: '26px', fontWeight: 900, letterSpacing: '-0.03em',
              margin: '0 0 8px', background: 'linear-gradient(135deg, #A78BFA, #6366F1)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              {status === 'INGESTING' ? 'Ingesting Repository' :
                status === 'MAPPING' ? 'Building Force Graph' : 'Processing…'}
            </h3>
            <p style={{ fontSize: '11px', letterSpacing: '0.4em', color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>
              Force-Directed Layout
            </p>
          </div>
        </div>
      )}

      {/* ── Error Screen ── */}
      {status === 'ERROR' && !showOverlay && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 90,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px',
        }}>
          <AlertTriangle style={{ width: '52px', height: '52px', color: '#f87171' }} />
          <h2 style={{ fontSize: '22px', fontWeight: 900, margin: 0 }}>Analysis Failed</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', maxWidth: '420px', textAlign: 'center', fontSize: '14px', margin: 0 }}>
            {errorMsg}
          </p>
          <Link to="/" style={{
            padding: '10px 28px', background: '#4F46E5', color: 'white',
            borderRadius: '10px', fontSize: '13px', fontWeight: 700, textDecoration: 'none',
          }}>
            ← Go Back
          </Link>
        </div>
      )}

      {/* ── Graph Pane ── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden',
        transition: 'max-width 0.5s cubic-bezier(0.16,1,0.3,1)',
        maxWidth: selectedNode ? '68%' : '100%',
        minWidth: 0,
      }}>
        {/* Header */}
        <header style={{
          padding: '14px 28px', borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(7,7,17,0.85)', backdropFilter: 'blur(20px)', zIndex: 20,
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <Link to="/" style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              color: 'rgba(255,255,255,0.35)', fontSize: '11px', fontWeight: 800,
              textTransform: 'uppercase', letterSpacing: '0.12em', textDecoration: 'none',
            }}>
              <ArrowLeft style={{ width: '14px', height: '14px' }} /> Exit
            </Link>
            <div style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.07)' }} />
            <span style={{ fontSize: '13px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <Sparkles style={{ width: '14px', height: '14px', color: '#818CF8' }} />
              Architecture <span style={{ color: '#818CF8', marginLeft: '5px' }}>Explorer</span>
            </span>
          </div>

          {status === 'READY' && (
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              {[
                { icon: <Layers style={{ width: '12px', height: '12px' }} />, val: nodes.length, label: 'nodes' },
                { icon: <GitBranch style={{ width: '12px', height: '12px' }} />, val: edges.length, label: 'edges' },
              ].map(({ icon, val, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>
                  {icon} <span style={{ color: '#818CF8', fontWeight: 900 }}>{val}</span> {label}
                </div>
              ))}

              <button
                onClick={() => {
                  if (!selectedNode) {
                    // If no node selected, just open chat at root level
                    setSelectedNode({ id: 'workspace', label: 'Repository', dependencies: [], dependents: [] });
                  }
                  setActiveTab('CHAT');
                }}
                style={{
                  padding: '6px 16px', background: 'rgba(129,140,248,0.1)',
                  border: '1px solid rgba(129,140,248,0.3)', borderRadius: '8px',
                  color: '#818CF8', fontSize: '11px', fontWeight: 800,
                  display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(129,140,248,0.2)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(129,140,248,0.1)'}
              >
                <MessageSquare style={{ width: '14px', height: '14px' }} />
                Ask AI
              </button>
            </div>
          )}
        </header>

        {/* ReactFlow Canvas */}
        <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            minZoom={0.15}
            maxZoom={2.5}
            style={{ background: 'radial-gradient(circle at center, #0B0F1A 0%, #05070D 100%)' }}
          >
            <Background color="rgba(99,102,241,0.05)" gap={36} size={1.2} />
            <Controls 
              position="bottom-left" 
              showInteractive={false} 
              style={{
                background: 'rgba(17, 24, 39, 0.75)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(99,102,241,0.2)',
                borderRadius: '12px',
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                zIndex: 10,
                transform: 'scale(0.85)',
                transformOrigin: 'bottom left',
              }} 
            />
            
            {/* ── Global Tech Stack Tags (Near System) ── */}
            <Panel position="top-right" style={{ pointerEvents: 'none' }}>
               <div style={{ 
                 background: 'rgba(7,7,17,0.6)', backdropFilter: 'blur(8px)',
                 padding: '12px 18px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)',
                 display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end',
                 opacity: showOverlay ? 0 : 1, transition: 'opacity 1s'
               }}>
                  <div style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Detected Stack</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {nodes.find(n => n.id === 'SYSTEM')?.data?.techStack?.map(tag => (
                      <span key={tag} style={{ 
                        fontSize: '11px', fontWeight: 800, color: '#818CF8', 
                        padding: '2px 8px', background: 'rgba(129,140,248,0.1)', 
                        borderRadius: '6px', border: '1px solid rgba(129,140,248,0.2)' 
                      }}>{tag}</span>
                    ))}
                    {!nodes.find(n => n.id === 'SYSTEM')?.data?.techStack?.length && (
                      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>Generic Project</span>
                    )}
                  </div>
               </div>
            </Panel>

            {status === 'READY' && nodes.length === 0 && (
              <Panel position="top-center">
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '10px 24px', color: '#fca5a5', fontSize: '13px', fontWeight: 700 }}>
                  No graph data received from backend
                </div>
              </Panel>
            )}
          </ReactFlow>
        </div>
      </div>

      {/* ── Sidebar ── */}
      {selectedNode && (
        <div style={{
          width: '32%', minWidth: '320px', height: '100%',
          background: '#0A0A14',
          borderLeft: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', flexDirection: 'column',
          animation: 'slideIn 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
          boxShadow: '-24px 0 60px rgba(0,0,0,0.6)',
          zIndex: 30, overflow: 'hidden', flexShrink: 0,
        }}>

          {/* ── Sidebar Tabs ── */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            {[
              { id: 'INFO', label: 'Overview', icon: <Layers style={{ width: '13px', height: '13px' }} /> },
              { id: 'CHAT', label: 'AI Assistant', icon: <MessageSquare style={{ width: '13px', height: '13px' }} /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1, padding: '14px', background: 'transparent', border: 'none',
                  borderBottom: `2px solid ${activeTab === tab.id ? '#6366F1' : 'transparent'}`,
                  color: activeTab === tab.id ? '#FFFFFF' : 'rgba(255,255,255,0.3)',
                  fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
            <button onClick={() => setSelectedNode(null)} style={{
              padding: '14px', background: 'transparent', border: 'none',
              color: 'rgba(255,255,255,0.3)', cursor: 'pointer',
            }}>
              <X style={{ width: '16px', height: '16px' }} />
            </button>
          </div>

          {/* ── Sidebar Content ── */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {activeTab === 'INFO' ? (
              <div style={{ padding: '24px' }}>
                <div style={{ marginBottom: '20px' }}>
                  {/* Role pill */}
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    padding: '3px 10px', borderRadius: '6px', marginBottom: '10px',
                    background: selectedNode.isEntry ? 'rgba(79,70,229,0.2)' : 'rgba(255,255,255,0.07)',
                    border: `1px solid ${selectedNode.isEntry ? 'rgba(79,70,229,0.4)' : 'rgba(255,255,255,0.1)'}`,
                  }}>
                    <FileCode style={{ width: '10px', height: '10px', color: selectedNode.isEntry ? '#A78BFA' : '#9CA3AF' }} />
                    <span style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.1em', color: selectedNode.isEntry ? '#A78BFA' : '#9CA3AF', textTransform: 'uppercase' }}>
                      {selectedNode.isEntry ? 'Entry Point' : (selectedNode.role || 'MODULE')}
                    </span>
                  </div>

                  {/* File name */}
                  <h1 style={{ fontSize: '17px', fontWeight: 900, margin: '0 0 5px', lineHeight: 1.3, letterSpacing: '-0.01em', wordBreak: 'break-all' }}>
                    {selectedNode.label === 'SYSTEM' ? 'Virtual Root' : (selectedNode.label || selectedNode.id)}
                  </h1>

                  {/* Full path */}
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.28)', fontFamily: 'monospace', wordBreak: 'break-all', lineHeight: 1.5 }}>
                    {selectedNode.id}
                  </div>
                </div>

                {/* Impact Level */}
                {sidebarImpact && (
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 16px', borderRadius: '12px', marginBottom: '16px',
                    background: sidebarImpact.bg, border: `1px solid ${sidebarImpact.color}30`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <TrendingUp style={{ width: '14px', height: '14px', color: sidebarImpact.color }} />
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Impact Level</span>
                    </div>
                    <span style={{
                      fontSize: '11px', fontWeight: 900, letterSpacing: '0.1em',
                      color: sidebarImpact.color, textTransform: 'uppercase',
                      padding: '2px 10px', background: `${sidebarImpact.color}18`,
                      borderRadius: '6px',
                    }}>
                      {sidebarImpact.label}
                    </span>
                  </div>
                )}

                {/* Tech Stack Selection Tags */}
                {(selectedNode.techStack?.length > 0) && (
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                      Technology Stack
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {selectedNode.techStack.map(tag => (
                        <span key={tag} style={{
                          padding: '3px 10px', background: 'rgba(99,102,241,0.15)',
                          border: '1px solid rgba(99,102,241,0.3)', borderRadius: '6px',
                          fontSize: '10px', color: '#A78BFA', fontWeight: 800
                        }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  {[
                    {
                      label: 'Priority Level',
                      sub: 'Adaptive Rank',
                      value: selectedNode.priority,
                      icon: <Zap style={{ width: '14px', height: '14px', color: '#FBBF24' }} />,
                      color: selectedNode.priority === 'HIGH' ? '#EF4444' : selectedNode.priority === 'MEDIUM' ? '#10B981' : '#9CA3AF',
                    },
                    {
                      label: 'Intelligence',
                      sub: 'Priority Score',
                      value: selectedNode.priorityScore?.toFixed(1) || 0,
                      icon: <Settings style={{ width: '14px', height: '14px', color: '#A78BFA' }} />,
                      color: '#A78BFA',
                    },
                    {
                      label: 'Semantic',
                      sub: 'Keyword Score',
                      value: selectedNode.semanticScore || 0,
                      icon: <FileCode style={{ width: '14px', height: '14px', color: '#60A5FA' }} />,
                      color: '#60A5FA',
                    },
                    {
                      label: 'Normalized',
                      sub: 'Project Depth',
                      value: selectedNode.normalizedScore?.toFixed(2) || 0,
                      icon: <ChevronRight style={{ width: '14px', height: '14px', color: '#34D399' }} />,
                      color: '#34D399',
                    },
                  ].map(({ label, sub, value, icon, color }) => (
                    <div key={label} style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: '12px', padding: '14px 14px 12px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        {icon}
                        <span style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                          {label}
                        </span>
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '-0.02em', color, lineHeight: 1 }}>
                        {value}
                      </div>
                      <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)', marginTop: '4px' }}>{sub}</div>
                    </div>
                  ))}
                </div>

                {/* Connectivity Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                  {[
                    {
                      label: selectedNode.isConfig ? 'Total Deps' : 'In-Degree',
                      sub: selectedNode.isConfig ? 'NPM Packages' : 'Impact Count',
                      value: selectedNode.isConfig ? (selectedNode.totalDeps || 0) : sidebarDepts.length,
                      icon: <ArrowDownRight style={{ width: '14px', height: '14px', color: '#60A5FA' }} />,
                      color: '#60A5FA',
                    },
                    {
                      label: 'Out-Degree',
                      sub: 'Complexity',
                      value: sidebarDeps.length,
                      icon: <ArrowUpRight style={{ width: '14px', height: '14px', color: '#34D399' }} />,
                      color: '#34D399',
                    },
                  ].map(({ label, sub, value, icon, color }) => (
                    <div key={label} style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: '12px', padding: '14px 14px 12px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        {icon}
                        <span style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                          {label}
                        </span>
                      </div>
                      <div style={{ fontSize: '30px', fontWeight: 900, letterSpacing: '-0.04em', color, lineHeight: 1 }}>
                        {value}
                      </div>
                      <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)', marginTop: '4px' }}>{sub}</div>
                    </div>
                  ))}
                </div>

                {/* Lists */}
                {sidebarDeps.length > 0 && (
                  <SidebarSection
                    title="Imports"
                    icon={<ArrowDownRight style={{ width: '12px', height: '12px' }} />}
                    color="#60A5FA"
                    items={sidebarDeps}
                    dotColor="#60A5FA"
                  />
                )}
                {sidebarDepts.length > 0 && (
                  <SidebarSection
                    title="Imported By"
                    icon={<ArrowUpRight style={{ width: '12px', height: '12px' }} />}
                    color="#34D399"
                    items={sidebarDepts}
                    dotColor="#34D399"
                  />
                )}
              </div>
            ) : (
              /* ── Chat Tab Content ── */
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', padding: '0 0 24px 0' }}>
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 10px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {messages.map((msg, i) => (
                    <div key={i} style={{
                      alignSelf: msg.role === 'ai' ? 'flex-start' : 'flex-end',
                      maxWidth: '85%',
                      display: 'flex', gap: '10px',
                      flexDirection: msg.role === 'ai' ? 'row' : 'row-reverse'
                    }}>
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                        background: msg.role === 'ai' ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${msg.role === 'ai' ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.1)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {msg.role === 'ai' ? <Bot style={{ width: '14px', height: '14px', color: '#818CF8' }} /> : <User style={{ width: '14px', height: '14px', color: '#FFFFFF' }} />}
                      </div>
                      <div style={{
                        padding: '12px 14px', borderRadius: '12px', fontSize: '13px', lineHeight: 1.5,
                        background: msg.role === 'ai' ? 'rgba(255,255,255,0.03)' : '#4F46E5',
                        border: msg.role === 'ai' ? '1px solid rgba(255,255,255,0.05)' : 'none',
                        color: msg.role === 'ai' ? 'rgba(255,255,255,0.8)' : '#FFFFFF',
                      }}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '0 24px', position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Ask about this codebase..."
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                    style={{
                      width: '100%', background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px',
                      padding: '14px 45px 14px 16px', color: 'white', fontSize: '13px',
                      outline: 'none', transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                  />
                  <button
                    onClick={handleSendMessage}
                    style={{
                      position: 'absolute', right: '32px', top: '50%', transform: 'translateY(-50%)',
                      background: 'transparent', border: 'none', color: '#818CF8', cursor: 'pointer',
                      padding: '4px',
                    }}
                  >
                    <Send style={{ width: '16px', height: '16px' }} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sidebar Section helper ───────────────────────────────────────────────────
function SidebarSection({ title, icon, color, items, dotColor }) {
  const MAX_VISIBLE = 8;
  const visible = items.slice(0, MAX_VISIBLE);
  const overflow = items.length - MAX_VISIBLE;

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '9px' }}>
        <span style={{ color }}>{icon}</span>
        <span style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.09em' }}>
          {title}
        </span>
        <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.2)', marginLeft: 'auto' }}>
          {items.length}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {visible.map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '9px',
            padding: '6px 10px', borderRadius: '8px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.04)',
            fontSize: '11px', color: 'rgba(255,255,255,0.55)',
            fontFamily: 'monospace',
          }}>
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {typeof item === 'string' ? item.split('/').pop() : String(item)}
            </span>
          </div>
        ))}
        {overflow > 0 && (
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Bot style={{ width: '10px', height: '10px' }} />
            {overflow} more…
          </div>
        )}
      </div>
    </div>
  );
}
