import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Layout } from 'lucide-react';

const CityNode = ({ data, selected }) => {
  return (
    <div className={`
      relative px-6 py-4 rounded-3xl bg-[#1e1b4b]/80 border-2 backdrop-blur-xl transition-all duration-500
      ${selected 
        ? 'border-purple-500 shadow-[0_0_40px_rgba(168,85,247,0.4)] scale-110' 
        : 'border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.1)]'}
      group hover:border-purple-500/50 hover:scale-105
    `}>
      <Handle type="target" position={Position.Top} className="opacity-0" />
      
      <div className="flex flex-col items-center gap-2">
        <div className="p-2 bg-purple-500/10 rounded-xl group-hover:bg-purple-500/20 transition-colors">
          <Layout className="w-5 h-5 text-purple-400" />
        </div>
        <span className="text-xs font-bold text-purple-100 uppercase tracking-widest text-center">
          {data.label.length > 18 ? data.label.substring(0, 15) + '...' : data.label}
        </span>
      </div>

      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
};

export default memo(CityNode);
