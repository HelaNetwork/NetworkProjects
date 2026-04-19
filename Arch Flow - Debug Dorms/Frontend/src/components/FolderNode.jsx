import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Folder, ChevronDown, ChevronRight } from 'lucide-react';

const FolderNode = ({ data, selected }) => {
  const isExpanded = data.isExpanded ?? true;

  return (
    <div 
      className={`
        relative px-5 py-3 rounded-2xl bg-[#0d1117] border transition-all duration-300
        ${selected ? 'border-blue-500 ring-4 ring-blue-500/10 shadow-[0_0_30px_rgba(59,130,246,0.15)]' : 'border-white/10'}
        hover:border-white/30 hover:bg-[#161b22] cursor-pointer group
      `}
      onClick={() => data.onToggle(data.id)}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />
      
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
          <Folder className="w-4 h-4 text-blue-400" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-white tracking-wide">
            {data.label}
          </span>
          <span className="text-[10px] text-gray-500 font-mono uppercase">
            Folder
          </span>
        </div>
        <div className="ml-2">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
};

export default memo(FolderNode);
