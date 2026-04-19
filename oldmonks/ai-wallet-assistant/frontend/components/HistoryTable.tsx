"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Analysis } from '@/lib/history';

interface HistoryTableProps {
  analyses: Analysis[];
}

export default function HistoryTable({ analyses }: HistoryTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const filteredAnalyses = useMemo(() => {
    if (!search) return analyses;
    const q = search.toLowerCase();
    return analyses.filter(a =>
      a.inputText.toLowerCase().includes(q) ||
      a.result.summary.toLowerCase().includes(q)
    );
  }, [analyses, search]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncate = (text: string, max: number) =>
    text.length > max ? text.slice(0, max) + '...' : text;

  // Get risk badge styles
  const getRiskStyle = (status: string) => {
    const styles: Record<string, React.CSSProperties> = {
      Safe: {
        backgroundColor: '#00e676',
        color: 'black',
      },
      Warning: {
        backgroundColor: '#ffd600',
        color: 'black',
      },
      Critical: {
        backgroundColor: '#ff3b3b',
        color: 'white',
      },
    };
    return styles[status] || { backgroundColor: 'gray', color: 'white' };
  };

  if (filteredAnalyses.length === 0) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <div style={{
          fontSize: '3rem',
          marginBottom: '1rem'
        }}>
          🔍
        </div>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '900',
          color: 'black',
          marginBottom: '0.5rem',
          fontFamily: '"Arial Black", sans-serif'
        }}>
          NO MATCHES FOUND
        </h2>
        <p style={{ color: '#6b7280', fontFamily: 'monospace' }}>
          Try a different search term
        </p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      {/* Search Bar */}
      <div style={{
        padding: '2rem 0',
        marginBottom: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '100%' }}>
          <input
            type="text"
            placeholder="Search by transaction summary or input..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '1.25rem 1.5rem',
              border: '4px solid black',
              backgroundColor: 'white',
              fontFamily: 'monospace',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              boxShadow: '6px 6px 0 black',
              outline: 'none',
              transition: 'all 0.1s'
            }}
          />
          <div style={{
            position: 'absolute',
            right: '1.5rem',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '1.25rem',
            pointerEvents: 'none'
          }}>
            🔍
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '1rem', fontWeight: '900', fontFamily: 'monospace', color: 'black' }}>
            TOTAL RESULTS: {filteredAnalyses.length}
          </span>
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                background: 'none',
                border: 'none',
                textDecoration: 'underline',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontFamily: 'monospace'
              }}
            >
              CLEAR SEARCH
            </button>
          )}
        </div>
      </div>

      {/* Cards List */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {filteredAnalyses.map((analysis) => (
          <div
            key={analysis.id}
            onClick={() => router.push(`/history/${analysis.id}`)}
            style={{
              border: '4px solid black',
              backgroundColor: 'white',
              boxShadow: '8px 8px 0 black',
              padding: '1.5rem',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '12px 12px 0 black';
              e.currentTarget.style.transform = 'translate(-2px, -2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '8px 8px 0 black';
              e.currentTarget.style.transform = 'translate(0, 0)';
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translate(4px, 4px)';
              e.currentTarget.style.boxShadow = '2px 2px 0 black';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translate(-2px, -2px)';
              e.currentTarget.style.boxShadow = '12px 12px 0 black';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{
                display: 'inline-block',
                padding: '0.4rem 1rem',
                border: '4px solid black',
                fontWeight: '900',
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                fontFamily: '"Arial Black", sans-serif',
                ...getRiskStyle(analysis.result.status)
              }}>
                {analysis.result.status}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: 'black',
                fontWeight: 'bold',
                fontFamily: 'monospace'
              }}>
                ID: {analysis.id.slice(0, 8)}...
              </div>
            </div>

            <div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '900',
                color: 'black',
                marginBottom: '0.5rem',
                fontFamily: '"Arial Black", sans-serif',
                lineHeight: '1.2'
              }}>
                {analysis.result.summary}
              </h3>
              <p style={{
                fontSize: '1rem',
                color: '#000',
                fontFamily: 'monospace',
                lineHeight: '1.5',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {analysis.inputText}
              </p>
            </div>

            <div style={{
              marginTop: 'auto',
              paddingTop: '1rem',
              borderTop: '4px solid black',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{
                fontSize: '0.875rem',
                color: 'black',
                fontWeight: 'bold',
                fontFamily: 'monospace'
              }}>
                DATE: {formatDate(analysis.timestamp)}
              </div>
              <div style={{
                fontSize: '0.875rem',
                fontWeight: '900',
                fontFamily: 'monospace',
                textDecoration: 'underline'
              }}>
                VIEW FULL ANALYSIS →
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

