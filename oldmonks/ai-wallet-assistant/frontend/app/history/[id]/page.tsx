"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getAnalysisById, type Analysis } from '@/lib/history';
import StatusBadge from '@/components/StatusBadge';
import Link from 'next/link';

export default function HistoryDetail() {
  const params = useParams();
  const id = params.id as string;
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const data = getAnalysisById(id);
      setAnalysis(data);
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="border-8 border-black bg-white shadow-[20px_20px_0_black] p-12 rotate-1">
          Loading analysis...
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
        <div className="border-8 border-black bg-white shadow-[20px_20px_0_black] p-12 rotate-2 max-w-4xl">
          <h1 className="text-5xl font-black uppercase mb-8">Analysis Not Found</h1>
          <Link 
            href="/history"
            className="inline-block px-8 py-4 bg-blue-500 text-white border-4 border-blue-700 font-black text-xl uppercase shadow-[8px_8px_0_#1d4ed8] hover:shadow-[4px_4px_0_#1d4ed8]"
          >
            ← Back to History
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (timestamp: number) => 
    new Date(timestamp).toLocaleString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });

  return (
    <main className="min-h-screen py-12 px-6 md:px-12 lg:px-24 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-12">
          <Link 
            href="/history"
            className="inline-flex items-center gap-3 px-6 py-3 bg-gray-800 text-white border-4 border-black font-black uppercase tracking-wide shadow-[6px_6px_0_black] hover:shadow-[3px_3px_0_black] hover:translate-x-[3px] hover:translate-y-[3px]"
          >
            ← All Analyses
          </Link>
        </div>

        {/* Header */}
        <div className="border-8 border-black bg-white shadow-[24px_24px_0_black] rotate-1 p-12 mb-12">
          <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center mb-12">
            <StatusBadge status={analysis.result.status} />
            <div>
              <h1 className="text-5xl lg:text-6xl font-black uppercase tracking-widest mb-4 bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text">
                {formatDate(analysis.timestamp)}
              </h1>
            </div>
          </div>
        </div>

        {/* Input */}
        <div className="border-8 border-black bg-white shadow-[20px_20px_0_black] rotate-[-1deg] p-10 mb-12">
          <h2 className="text-3xl font-black uppercase mb-6 tracking-wide border-b-4 border-black pb-4">Transaction Input</h2>
          <pre className="font-mono text-xl leading-relaxed bg-gray-900 text-green-400 p-8 border-4 border-black shadow-inner whitespace-pre-wrap overflow-auto max-h-96">
            {analysis.inputText}
          </pre>
        </div>

        {/* Result */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Summary */}
          <div className="border-8 border-black bg-white shadow-[20px_20px_0_black] p-10 rotate-[1deg]">
            <h3 className="text-2xl font-black uppercase mb-6 tracking-wide border-b-4 border-black pb-4">Summary</h3>
            <p className="text-xl font-mono leading-relaxed">{analysis.result.summary}</p>
          </div>

          {/* Details */}
          <div className="border-8 border-black bg-white shadow-[-20px_20px_0_black] p-10 rotate-[-2deg]">
            <h3 className="text-2xl font-black uppercase mb-6 tracking-wide border-b-4 border-black pb-4">Details</h3>
            <p className="text-lg font-mono leading-relaxed">{analysis.result.details}</p>
          </div>
        </div>

        {/* Chat History */}
        {analysis.chatHistory.length > 0 && (
          <div className="border-8 border-black bg-black text-green-400 shadow-[20px_20px_0_#333] p-10 mb-12">
            <h3 className="text-3xl font-black uppercase mb-8 tracking-wide border-b-4 border-green-400 pb-4 text-white">AI Chat History</h3>
            <div className="space-y-6 max-h-96 overflow-y-auto">
              {analysis.chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-2xl p-6 border-2 border-green-400 bg-black/50 rounded-none font-mono text-lg shadow-lg ${
                    msg.role === 'user' ? 'bg-yellow-900/50 border-yellow-400 text-yellow-300 ml-auto' : ''
                  }`}>
                    <div className="font-bold uppercase tracking-wider mb-2 text-sm">
                      {msg.role === 'user' ? 'USER' : 'AI'}
                    </div>
                    <div>{msg.message}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

