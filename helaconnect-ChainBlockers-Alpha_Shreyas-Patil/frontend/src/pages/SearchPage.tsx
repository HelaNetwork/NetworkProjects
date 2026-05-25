import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import api from '../lib/axios';
import { User } from '../types';
import useGenerateAvatar from '../hooks/useGenerateAvatar';

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { generateAvatar } = useGenerateAvatar();

  const doSearch = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.get(`/users/search?q=${encodeURIComponent(q.trim())}`);
      setResults(res.data.data || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-search if query param present on load
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) { setQuery(q); doSearch(q); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(query ? { q: query } : {});
    doSearch(query);
  };

  return (
    <div className="min-h-screen" style={{ background: '#0d1117' }}>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">
            Search <span className="mint-gradient-text">Users</span>
          </h1>
          <p className="text-white/40 text-sm">Find professionals on the helaconntect network</p>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSubmit} className="flex gap-3 mb-8">
          <input
            id="search-users-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or wallet address…"
            className="input-field flex-1 text-base"
            autoFocus
          />
          <button id="search-users-btn" type="submit" className="btn-mint px-8">
            {loading ? <span className="animate-spin">⟳</span> : '🔍 Search'}
          </button>
        </form>

        {/* Results */}
        {loading && (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 rounded-2xl shimmer" />
            ))}
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <div className="text-5xl mb-4">🔭</div>
            <p className="text-white/40 text-lg">No users found for "{query}"</p>
            <p className="text-white/25 text-sm mt-2">Try searching by full name or wallet address</p>
          </div>
        )}

        {!loading && !searched && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">👥</div>
            <p className="text-white/30 text-base">Search for professionals in the helaconntect network</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="space-y-3 animate-fade-in">
            <p className="text-white/40 text-sm mb-4">{results.length} user{results.length !== 1 ? 's' : ''} found</p>
            {results.map((user) => (
              <button
                key={user._id}
                id={`user-card-${user._id}`}
                onClick={() => navigate(`/user/${user.walletAddress}`)}
                className="w-full glass-card p-4 rounded-2xl card-hover text-left flex items-center gap-4"
                style={{ border: '1px solid rgba(255,255,255,0.07)' }}
              >
                {/* Avatar */}
                <img
                  src={generateAvatar(user.walletAddress || user.fullName)}
                  alt={user.fullName || 'User'}
                  className="w-12 h-12 rounded-xl object-cover shrink-0"
                  style={{ boxShadow: '0 0 10px rgba(20,184,166,0.3)' }}
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-white truncate">{user.fullName || 'Unnamed User'}</p>
                    {user.work?.jobTitle && (
                      <span className="badge-mint text-xs shrink-0">{user.work.jobTitle}</span>
                    )}
                  </div>
                  {user.bio && (
                    <p className="text-sm text-white/40 truncate mt-0.5">{user.bio}</p>
                  )}
                  <p className="text-xs font-mono text-white/25 mt-1 truncate">{user.walletAddress}</p>
                </div>

                {/* Skills preview */}
                <div className="hidden sm:flex flex-col gap-1 items-end shrink-0">
                  {user.skills.slice(0, 2).map((s) => (
                    <span key={s} className="text-xs px-2 py-0.5 rounded-md text-mint-400/70"
                      style={{ background: 'rgba(20,184,166,0.08)' }}>{s}</span>
                  ))}
                  {user.skills.length > 2 && (
                    <span className="text-xs text-white/30">+{user.skills.length - 2} more</span>
                  )}
                </div>

                <span className="text-white/30 text-lg ml-2">›</span>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default SearchPage;
