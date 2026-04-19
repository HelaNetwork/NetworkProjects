import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { FileCode, Activity } from 'lucide-react';

const BuildingNode = ({ data, selected }) => {
  const impact = data.impact || 0;
  const isEntry = data.isEntry || false;
  
  // Color logic
  let colorClass = "from-blue-500/10 to-blue-600/5 border-blue-500/20 text-blue-400";
  let glowClass = "shadow-[0_0_15px_rgba(59,130,246,0.05)]";
  
  if (impact > 15) {
      colorClass = "from-red-500/20 to-red-600/10 border-red-500/30 text-red-400";
      glowClass = "shadow-[0_0_20px_rgba(239,68,68,0.15)]";
  } else if (impact > 7) {
      colorClass = "from-orange-500/20 to-orange-600/10 border-orange-500/30 text-orange-400";
      glowClass = "shadow-[0_0_20px_rgba(249,115,22,0.15)]";
  }

  const label = data.label.length > 18 ? data.label.substring(0, 15) + '...' : data.label;

  return (
    <div className={`
      relative px-4 py-2.5 rounded-xl bg-gradient-to-br ${colorClass} border backdrop-blur-xl 
      transition-all duration-500 group ${glowClass}
      ${selected ? 'scale-110 !border-white ring-4 ring-white/10' : 'hover:scale-105 hover:bg-white/5 active:scale-95'}
      ${isEntry && !selected ? 'animate-pulse ring-2 ring-purple-500/30' : ''}
    `}>
      <Handle type="target" position={Position.Top} className="opacity-0" />
      
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
            <FileCode className="w-3.5 h-3.5 opacity-70" />
        </div>
        <div className="flex flex-col">
            <span className="text-[11px] font-bold tracking-wide">
            {label}
            </span>
            {isEntry && <span className="text-[8px] uppercase tracking-tighter text-purple-400 font-black opacity-70">Entry Point</span>}
        </div>
        {impact > 5 && (
            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/20 text-[8px] font-bold border border-white/5`}>
                <Activity className="w-2.5 h-2.5 opacity-50" />
                {impact}
            </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
};

export default memo(BuildingNode);
