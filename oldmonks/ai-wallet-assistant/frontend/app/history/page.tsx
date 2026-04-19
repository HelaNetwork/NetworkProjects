"use client";

import HistoryTable from '@/components/HistoryTable';
import { getAllAnalyses, clearHistory, type Analysis, type Status } from '@/lib/history';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = getAllAnalyses();
    setAnalyses(data);
    setLoading(false);
  }, []);

  // Calculate stats
  const stats = useMemo(() => {
    const total = analyses.length;
    const safe = analyses.filter(a => a.result.status === 'Safe').length;
    const warning = analyses.filter(a => a.result.status === 'Warning').length;
    const critical = analyses.filter(a => a.result.status === 'Critical').length;
    const safePercent = total > 0 ? Math.round((safe / total) * 100) : 0;
    return { total, safe, warning, critical, safePercent };
  }, [analyses]);

  // Safety overview calculation
  const safetyOverview = useMemo(() => {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const weekAgo = now - 7 * dayMs;
    const monthAgo = now - 30 * dayMs;
    const yearAgo = now - 365 * dayMs;

    const getStatusForPeriod = (cutoff: number) => {
      const periodAnalyses = analyses.filter(a => a.timestamp >= cutoff);
      if (periodAnalyses.length === 0) return 'N/A';
      const criticalCount = periodAnalyses.filter(a => a.result.status === 'Critical').length;
      if (criticalCount > 0) return 'CAUTION';
      return 'SAFE';
    };

    return {
      week: getStatusForPeriod(weekAgo),
      month: getStatusForPeriod(monthAgo),
      year: getStatusForPeriod(yearAgo),
    };
  }, [analyses]);

  const handleClear = () => {
    if (confirm('Clear all history? This cannot be undone.')) {
      clearHistory();
      setAnalyses([]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8" style={{ backgroundColor: '#f9fafb' }}>
        <div style={{
          border: '8px solid black',
          backgroundColor: 'white',
          boxShadow: '20px 20px 0 black',
          padding: '3rem',
          transform: 'rotate(2deg)'
        }}>
          <div className="animate-pulse" style={{ backgroundColor: '#e5e7eb', height: '3rem', width: '12rem', marginBottom: '1rem' }}></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="animate-pulse" style={{ backgroundColor: '#e5e7eb', height: '1rem', width: '75%', borderRadius: '4px' }}></div>
            <div className="animate-pulse" style={{ backgroundColor: '#e5e7eb', height: '1rem', width: '50%', borderRadius: '4px' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main style={{ minHeight: '100vh', padding: '2.5rem 1.5rem', backgroundColor: '#f9fafb' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

        {/* Header - More Compact */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', borderBottom: '4px solid black', paddingBottom: '1rem' }}>
          <div>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '900',
              textTransform: 'uppercase',
              color: 'black',
              fontFamily: '"Arial Black", sans-serif',
              lineHeight: '1'
            }}>
              ANALYSIS <span style={{ backgroundColor: '#ffd600', padding: '0 0.3rem' }}>HISTORY</span>
            </h1>
            <p style={{ fontSize: '1rem', color: '#000', fontWeight: 'bold', fontFamily: 'monospace', marginTop: '0.5rem' }}>
              &gt; Your crypto security track record
            </p>
          </div>
          
          <button
            onClick={handleClear}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'white',
              color: 'black',
              border: '4px solid black',
              fontSize: '0.75rem',
              fontWeight: '900',
              fontFamily: '"Arial Black", sans-serif',
              cursor: 'pointer',
              boxShadow: '4px 4px 0 black',
              textTransform: 'uppercase'
            }}
          >
            Clear History
          </button>
        </div>

        {/* Empty State */}
        {analyses.length === 0 ? (
          <div style={{
            border: '4px solid black',
            backgroundColor: 'white',
            boxShadow: '8px 8px 0 black',
            padding: '4rem 2rem',
            textAlign: 'center',
            maxWidth: '600px',
            margin: '4rem auto'
          }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '900', color: 'black', marginBottom: '1rem', fontFamily: '"Arial Black", sans-serif' }}>
              EMPTY HISTORY
            </h2>
            <Link href="/" style={{
              display: 'inline-block',
              padding: '1rem 2rem',
              backgroundColor: '#00e676',
              color: 'black',
              textDecoration: 'none',
              fontWeight: '900',
              border: '4px solid black',
              boxShadow: '4px 4px 0 black',
              fontFamily: '"Arial Black", sans-serif',
              textTransform: 'uppercase'
            }}>
              START ANALYSIS →
            </Link>
          </div>
        ) : (
          <>
            {/* Unified Dashboard Section */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 3fr',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              {/* Stats Mini-Panel */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem'
              }}>
                <div style={{ border: '4px solid black', backgroundColor: 'white', padding: '1rem', boxShadow: '5px 5px 0 black' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: '900', fontFamily: 'monospace', textTransform: 'uppercase' }}>TOT</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: '900', fontFamily: '"Arial Black", sans-serif' }}>{stats.total}</div>
                </div>
                <div style={{ border: '4px solid black', backgroundColor: '#ff3b3b', color: 'white', padding: '1rem', boxShadow: '5px 5px 0 black' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: '900', fontFamily: 'monospace', textTransform: 'uppercase' }}>RISK</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: '900', fontFamily: '"Arial Black", sans-serif' }}>{stats.critical}</div>
                </div>
                <div style={{ border: '4px solid black', backgroundColor: '#00e676', padding: '1rem', boxShadow: '5px 5px 0 black', gridColumn: 'span 2' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: '900', fontFamily: 'monospace', textTransform: 'uppercase' }}>SAFE RATE</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '900', fontFamily: '"Arial Black", sans-serif' }}>{stats.safePercent}%</div>
                  </div>
                </div>
              </div>

              {/* Safety Timeline Mini-Panel */}
              <div style={{
                border: '4px solid black',
                backgroundColor: 'white',
                padding: '1rem',
                boxShadow: '5px 5px 0 black',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '900', fontFamily: 'monospace', marginBottom: '0.75rem', borderBottom: '2px solid black', paddingBottom: '0.25rem' }}>
                  OVERVIEW STATUS
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {[
                    { label: 'WEEK', status: safetyOverview.week },
                    { label: 'MONTH', status: safetyOverview.month },
                    { label: 'YEAR', status: safetyOverview.year }
                  ].map(({ label, status }) => (
                    <div key={label} style={{
                      textAlign: 'center',
                      padding: '0.4rem',
                      border: '2px solid black',
                      backgroundColor: status === 'SAFE' ? '#00e676' : status === 'CAUTION' ? '#ffd600' : '#f3f4f6'
                    }}>
                      <div style={{ fontSize: '0.6rem', fontWeight: '900', fontFamily: 'monospace' }}>{label}</div>
                      <div style={{ fontSize: '0.75rem', fontWeight: '900' }}>
                        {status === 'SAFE' ? 'SAFE' : status === 'CAUTION' ? 'RISK' : 'N/A'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* History Table (Cards) */}
            <HistoryTable analyses={analyses} />
          </>
        )}
      </div>
    </main>
  );
}

