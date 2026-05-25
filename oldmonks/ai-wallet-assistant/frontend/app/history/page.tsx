"use client";

import HistoryTable from '@/components/HistoryTable';
import { getAllAnalyses, clearHistory, Analysis } from '@/lib/history';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = getAllAnalyses();
    setAnalyses(data);
    setLoading(false);
  }, []);

  const handleClear = () => {
    if (confirm('Clear all history? This cannot be undone.')) {
      clearHistory();
      setAnalyses([]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-[#f5f5f5]">
        <div className="border-8 border-black bg-black text-white shadow-[20px_20px_0_#ff0000] p-12 rotate-2">
          <h2 className="text-4xl font-black uppercase tracking-widest animate-pulse">LOADING LOGS...</h2>
        </div>
      </div>
    );
  }

  return (
    <main style={{
      minHeight: '100vh',
      padding: '4rem 2rem',
      backgroundColor: '#f5f5f5',
      fontFamily: '"Arial Black", Arial, sans-serif',
      color: 'black'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header Section */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '3rem',
          flexWrap: 'wrap',
          gap: '2rem'
        }}>
          <div>
            <Link href="/" style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#111',
              color: '#fff',
              border: '4px solid black',
              boxShadow: '4px 4px 0 black',
              fontWeight: '900',
              textTransform: 'uppercase',
              textDecoration: 'none',
              marginBottom: '1rem'
            }}>
              ← RETURN TO TERMINAL
            </Link>
            <h1 style={{
              fontSize: '4.5rem',
              fontWeight: '900',
              color: 'black',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              lineHeight: '1',
              margin: '0',
              textShadow: '4px 4px 0 #00ffff'
            }}>
              ANALYSIS HISTORY
            </h1>
          </div>
          
          <button
            onClick={handleClear}
            style={{
              padding: '1rem 2rem',
              backgroundColor: '#ff0000',
              color: 'white',
              border: '5px solid black',
              fontSize: '1.25rem',
              fontWeight: '900',
              cursor: 'pointer',
              boxShadow: '8px 8px 0 black',
              textTransform: 'uppercase',
              rotate: '2deg',
              transition: 'transform 0.1s'
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translate(6px, 6px)';
              e.currentTarget.style.boxShadow = '2px 2px 0 black';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = '8px 8px 0 black';
            }}
          >
            ERASE ALL RECORDS
          </button>
        </div>
        
        {/* Main Content Area */}
        <div style={{
           border: '5px solid black',
           backgroundColor: 'white',
           boxShadow: '12px 12px 0 black',
           padding: '2rem',
        }}>
          <HistoryTable analyses={analyses} />
        </div>

      </div>
    </main>
  );
}
