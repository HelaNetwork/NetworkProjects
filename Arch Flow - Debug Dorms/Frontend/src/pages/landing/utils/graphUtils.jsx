import React from 'react';

export const CLUSTERS = {
  1: { id: 1, label: 'Core Engine', fill: '#1e1b4b', border: '#6366f1', text: '#a5b4fc' },
  2: { id: 2, label: 'UI Components', fill: '#052e16', border: '#22c55e', text: '#86efac' },
  3: { id: 3, label: 'Data Processing', fill: '#451a03', border: '#f59e0b', text: '#fcd34d' },
  4: { id: 4, label: 'Utilities', fill: '#4c0519', border: '#f43f5e', text: '#fda4af' }
};

export const NODES = [
  { id: 'n1', label: 'Main.js', cluster: 1, x: 400, y: 300, description: 'The entry point of the application.' },
  { id: 'n2', label: 'App.jsx', cluster: 1, x: 550, y: 250, description: 'Core application component managing routes.' },
  { id: 'n3', label: 'LandingPage.jsx', cluster: 2, x: 650, y: 150, description: 'Visual landing page with hero and features.' },
  { id: 'n4', label: 'AnalyzePage.jsx', cluster: 2, x: 700, y: 350, description: 'Complex analysis view with graph visualizations.' },
  { id: 'n5', label: 'AuthContext.js', cluster: 1, x: 300, y: 200, description: 'Security and user session management.' },
  { id: 'n6', label: 'GraphPanel.jsx', cluster: 2, x: 850, y: 400, description: 'Interactive SVG graph visualization engine.' },
  { id: 'n7', label: 'dataParser.js', cluster: 3, x: 250, y: 450, description: 'Parses incoming raw data into graph structures.' },
  { id: 'n8', label: 'apiClient.js', cluster: 3, x: 150, y: 350, description: 'Handles communication with backend services.' },
  { id: 'n9', label: 'fileSystem.js', cluster: 4, x: 100, y: 550, description: 'Local storage and file I/O operations.' },
  { id: 'n10', label: 'constants.js', cluster: 4, x: 350, y: 550, description: 'Shared configuration and constant values.' },
  { id: 'n11', label: 'theme.js', cluster: 4, x: 500, y: 500, description: 'Design system and theme definitions.' },
  { id: 'n12', label: 'logger.js', cluster: 4, x: 200, y: 100, description: 'Centralized error and activity logging.' },
  { id: 'n13', label: 'websocket.js', cluster: 3, x: 100, y: 250, description: 'Real-time update synchronization.' },
];

export const EDGES = [
  { id: 'e1', source: 'n1', target: 'n2', label: 'Imports', weight: 2 },
  { id: 'e2', source: 'n2', target: 'n3', label: 'Routes', weight: 1 },
  { id: 'e3', source: 'n2', target: 'n4', label: 'Routes', weight: 1 },
  { id: 'e4', source: 'n2', target: 'n5', label: 'Uses', weight: 3 },
  { id: 'e5', source: 'n4', target: 'n6', label: 'Renders', weight: 5 },
  { id: 'e6', source: 'n1', target: 'n5', label: 'Initializes', weight: 2 },
  { id: 'e7', source: 'n7', target: 'n4', label: 'Feeds', weight: 4 },
  { id: 'e8', source: 'n8', target: 'n7', label: 'Fetches', weight: 2 },
  { id: 'e9', source: 'n9', target: 'n8', label: 'Caches', weight: 1 },
  { id: 'e10', source: 'n10', target: 'n7', label: 'Configures', weight: 1 },
  { id: 'e11', source: 'n11', target: 'n6', label: 'Styles', weight: 2 },
  { id: 'e12', source: 'n12', target: 'n1', label: 'Monitors', weight: 1 },
  { id: 'e13', source: 'n13', target: 'n8', label: 'Signals', weight: 3 },
  { id: 'e14', source: 'n5', target: 'n8', label: 'Authorizes', weight: 2 },
  { id: 'e15', source: 'n4', target: 'n11', label: 'Themes', weight: 1 },
  { id: 'e16', source: 'n6', target: 'n7', label: 'Optimizes', weight: 2 },
];

export const HexagonNode = ({ x, y, label, cluster, size = 40, isActive, isHovered, onClick, onHover }) => {
  const c = CLUSTERS[cluster];
  
  // Calculate hexagon points
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i * 60) * (Math.PI / 180);
    points.push(`${x + size * Math.cos(angle)},${y + size * Math.sin(angle)}`);
  }
  
  return (
    <g 
      className="cursor-pointer transition-transform duration-300 ease-out"
      style={{ transformOrigin: `${x}px ${y}px`, transform: isHovered ? 'scale(1.1)' : 'scale(1)' }}
      onClick={onClick}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      {/* Glow Effect */}
      {isActive && (
        <circle 
          cx={x} cy={y} r={size * 1.5} 
          fill={c.border} opacity="0.15" 
          className="animate-pulse"
        />
      )}
      
      {/* Outer Border / Glow Ring */}
      <polygon
        points={points.join(' ')}
        fill="transparent"
        stroke={isActive ? c.border : 'transparent'}
        strokeWidth="4"
        className="transition-all duration-300"
      />

      {/* Main Hexagon */}
      <polygon
        points={points.join(' ')}
        fill={c.fill}
        stroke={isHovered ? c.border : '#1e293b'}
        strokeWidth="2"
        className="transition-colors duration-300"
      />
      
      {/* Label */}
      <text
        x={x}
        y={y + size + 20}
        textAnchor="middle"
        fill={isHovered || isActive ? c.text : '#94a3b8'}
        fontSize="12"
        fontFamily="Inter, ui-sans-serif, system-ui"
        fontWeight="500"
        className="pointer-events-none transition-colors duration-300 whitespace-nowrap"
      >
        {label}
      </text>

      {/* Mini indicator icon/dot inside */}
      <circle cx={x} cy={y} r="3" fill={c.border} />
    </g>
  );
};
