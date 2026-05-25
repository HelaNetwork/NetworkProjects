"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Analysis } from '@/lib/history';
import StatusBadge from './StatusBadge';

interface HistoryTableProps {
  analyses: Analysis[];
}

export default function HistoryTable({ analyses }: HistoryTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<string>('ALL');

  const filteredAnalyses = useMemo(() => {
    let filtered = analyses.filter(a => a && a.result && a.inputText);
    if (filterMode !== 'ALL') {
      filtered = filtered.filter(a => a.result.status?.toUpperCase() === filterMode);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(a => 
        (a.inputText || '').toLowerCase().includes(q) ||
        (a.result.summary || '').toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [analyses, search, filterMode]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncate = (text: string, max: number) => 
    text.length > max ? text.slice(0, max) + '...' : text;

  if (analyses.length === 0) {
    return (
      <div style={{
        padding: '4rem',
        border: '6px solid black',
        backgroundColor: '#ffff00',
        boxShadow: '10px 10px 0 black',
        textAlign: 'center',
        rotate: '1deg'
      }}>
        <h2 style={{ fontSize: '3rem', fontWeight: '900', color: 'black', margin: '0 0 1rem 0', textTransform: 'uppercase' }}>
          DATABASE EMPTY
        </h2>
        <p style={{ fontSize: '1.25rem', fontFamily: 'monospace', color: 'black', fontWeight: 'bold' }}>
          Execute an analysis to generate history.
        </p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', fontFamily: '"Arial Black", sans-serif', color: 'black' }}>
      
      {/* Controls */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        marginBottom: '3rem',
        padding: '1.5rem',
        backgroundColor: '#111',
        border: '4px solid black',
        boxShadow: '8px 8px 0 #00ffff'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="SEARCH RECORDS..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: '1',
              minWidth: '200px',
              padding: '1rem 1.5rem',
              border: '4px solid black',
              backgroundColor: '#ffff00',
              fontFamily: 'monospace',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              color: 'black',
              boxShadow: 'inset 4px 4px 0 rgba(0,0,0,0.1)'
            }}
          />
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['ALL', 'SAFE', 'WARNING', 'CRITICAL'].map((f) => {
               let bgColor = '#fff';
               if (f === 'SAFE') bgColor = '#00ff00';
               if (f === 'WARNING') bgColor = '#ffff00';
               if (f === 'CRITICAL') bgColor = '#ff0000';
               return (
                 <button
                   key={f}
                   onClick={() => setFilterMode(f)}
                   style={{
                     padding: '0.75rem 1.25rem',
                     backgroundColor: filterMode === f ? bgColor : '#fff',
                     color: filterMode === f && f === 'CRITICAL' ? '#fff' : 'black',
                     border: '3px solid black',
                     fontWeight: '900',
                     cursor: 'pointer',
                     boxShadow: filterMode === f ? 'inset 3px 3px 0 rgba(0,0,0,0.2)' : '3px 3px 0 black'
                   }}
                 >
                   {f}
                 </button>
               );
            })}
          </div>
        </div>
      </div>

      {/* Cards List */}
      {filteredAnalyses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#eee', border: '4px solid black' }}>
          <h3 style={{ fontSize: '2rem', margin: 0 }}>NO RELEVANT RECORDS FOUND</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {filteredAnalyses.map((analysis, i) => {
            const isCritical = analysis.result.status?.toUpperCase() === 'CRITICAL';
            const isSafe = analysis.result.status?.toUpperCase() === 'SAFE';
            return (
              <div 
                key={analysis.id}
                onClick={() => router.push(`/history/${analysis.id}`)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '1.5rem',
                  border: '5px solid black',
                  backgroundColor: isCritical ? '#ffe6e6' : (isSafe ? '#f0fff0' : '#fff'),
                  color: 'black',
                  boxShadow: '8px 8px 0 black',
                  cursor: 'pointer',
                  transition: 'all 0.1s',
                  rotate: i % 2 === 0 ? '0.5deg' : '-0.5deg'
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'translate(4px, 4px)';
                  e.currentTarget.style.boxShadow = '4px 4px 0 black';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '8px 8px 0 black';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '3px solid black', paddingBottom: '1rem', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '1rem', fontFamily: 'monospace', fontWeight: 'bold' }}>
                    {formatDate(analysis.timestamp)}
                  </div>
                  <StatusBadge status={analysis.result.status} />
                </div>
                
                <h3 style={{ fontSize: '1.5rem', fontWeight: '900', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>
                  {analysis.result.summary}
                </h3>
                
                <p style={{ fontSize: '1rem', fontFamily: 'monospace', margin: 0, padding: '1rem', backgroundColor: '#f0f0f0', border: '2px solid black', color: 'black' }}>
                  {truncate(analysis.inputText, 120)}
                </p>
                
                <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                  <span style={{ backgroundColor: 'black', color: 'white', padding: '0.4rem 0.8rem', fontWeight: '900' }}>→ OPEN REPORT</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
