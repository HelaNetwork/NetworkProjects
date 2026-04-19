import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { 
  FileCode, 
  ChevronRight, 
  ArrowUpRight, 
  ArrowDownRight,
  Settings,
  Zap,
  Box,
  Code2
} from 'lucide-react';
import { getPriorityStyle } from '../utils/graph/priorityMapper';

/**
 * ArchNode - Adaptive & Production Ready
 * Handles priority-based styling with color preservation for SYSTEM/CONFIG.
 */
export const ArchNode = ({ data, selected }) => {
    const [hovered, setHovered] = useState(false);
    
    // --- State & Context ---
    const priority = data?.priority;
    const isEntry  = data.isEntry || data.id === 'SYSTEM';
    const isConfig = data.isConfig || data.id === 'package.json';
    const framework = data.framework || null; 
    const deps     = (data.dependencies || []).length;
    const depts    = (data.dependents   || []).length;
    const totalDeg = deps + depts;

    // Safety Log
    console.log("Priority:", priority);

    // --- Adaptive Priority Mapping ---
    const pStyle = getPriorityStyle(priority);

    // ── Palette Selection ──
    let bg, borderColor, textColor, badgeBg, badgeText;

    if (isConfig) {
        bg          = '#D97706';
        borderColor = '#FBBF24';
        textColor   = '#FFFFFF';
        badgeBg     = 'rgba(255,255,255,0.25)';
        badgeText   = '#FEF3C7';
    } else if (isEntry) {
        bg          = '#4F46E5';
        borderColor = '#A78BFA';
        textColor   = '#FFFFFF';
        badgeBg     = 'rgba(255,255,255,0.2)';
        badgeText   = '#EDE9FE';
    } else {
        bg          = pStyle.background;
        borderColor = pStyle.borderColor;
        textColor   = '#F9FAFB';
        badgeBg     = 'rgba(255,255,255,0.1)';
        badgeText   = '#9CA3AF';
    }

    // ── Style Merging (Special Node Preservation) ──
    const isSpecial = isEntry || isConfig;

    // Extract dynamic glow from mapper
    const glowColor = (selected || hovered) 
        ? pStyle.glowColor.replace('0.6', '0.9').replace('0.4', '0.7').replace('0.2', '0.5') 
        : pStyle.glowColor;

    const baseStyle = {
        width: '200px',
        background: bg,
        borderRadius: '14px',
        border: `2px solid ${borderColor}`,
        padding: '12px 16px',
        color: textColor,
        fontWeight: 600,
        boxSizing: 'border-box',
        transition: 'all 0.18s ease',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
    };

    const finalStyle = isSpecial 
        ? {
            ...baseStyle,
            boxShadow: `0 0 20px ${glowColor}, 0 4px 20px rgba(0,0,0,0.6)`,
            transform: selected ? 'scale(1.15)' : (hovered ? 'scale(1.05)' : pStyle.transform),
            opacity: 1
          }
        : {
            ...baseStyle,
            boxShadow: `0 0 15px ${glowColor}, 0 4px 15px rgba(0,0,0,0.5)`,
            transform: selected ? 'scale(1.15)' : (hovered ? 'scale(1.05)' : pStyle.transform),
            opacity: selected || hovered ? 1 : pStyle.opacity
          };

    // --- Framework Tinting (Subtle 5% overlay) ---
    const tintColor = framework === 'React' ? 'rgba(16, 185, 129, 0.08)' 
                    : framework === 'Express' ? 'rgba(59, 130, 246, 0.08)' 
                    : 'transparent';

    // ── Label & UI ──
    const raw   = data.label || (data.id || '').split('/').pop() || '';
    const label = raw.length > 22 ? raw.slice(0, 20) + '…' : raw;
    const badge = isConfig ? 'CONFIG'
                : isEntry ? 'ENTRY'
                : (priority || 'FILE');

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            title={`${raw}\nPath: ${data.id || ''}\nDependencies: ${deps} | Dependents: ${depts}`}
            style={finalStyle}
        >
            {/* Framework Tint Overlay */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: tintColor, pointerEvents: 'none', zIndex: 0
            }} />

            <Handle type="target" position={Position.Top}    style={{ opacity: 0, pointerEvents: 'none' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative', zIndex: 1 }}>
                {/* File icon */}
                <div style={{
                    width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
                    background: 'rgba(255,255,255,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <rect x="2" y="1" width="9" height="12" rx="1.5" stroke="rgba(255,255,255,0.9)" strokeWidth="1.4" fill="none"/>
                        <path d="M5 5h5M5 8h3" stroke="rgba(255,255,255,0.9)" strokeWidth="1.2" strokeLinecap="round"/>
                        <path d="M11 8l3 3-3 3" stroke="rgba(255,255,255,0.9)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>

                {/* Labels */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                        fontSize: '12px', fontWeight: 700, color: textColor,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        letterSpacing: '0.01em', lineHeight: 1.3,
                    }}>
                        {label}
                    </div>
                    <div style={{
                        display: 'inline-block', marginTop: '3px',
                        fontSize: '9px', fontWeight: 800, letterSpacing: '0.1em',
                        color: badgeText, background: badgeBg,
                        padding: '1px 7px', borderRadius: '4px',
                    }}>
                        {badge}
                    </div>
                </div>

                {/* Degree badge */}
                {totalDeg > 0 && (
                    <div style={{
                        fontSize: '11px', fontWeight: 800,
                        color: 'rgba(255,255,255,0.9)',
                        background: 'rgba(0,0,0,0.25)', borderRadius: '6px',
                        padding: '2px 7px', flexShrink: 0,
                        letterSpacing: '-0.02em',
                    }}>
                        {totalDeg}
                    </div>
                )}
            </div>

            <Handle type="source" position={Position.Bottom} style={{ opacity: 0, pointerEvents: 'none' }} />
        </div>
    );
};

export default memo(ArchNode);
