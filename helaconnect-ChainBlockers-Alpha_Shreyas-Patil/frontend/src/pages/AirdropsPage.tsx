import React, { useEffect, useState } from 'react';
import Navbar from '../components/layout/Navbar';
import axios from 'axios';
import { Airdrop } from '../types';

const API_URL =  import.meta.env.VITE_API_URL;

const AirdropsPage: React.FC = () => {
  const [airdrops, setAirdrops] = useState<Airdrop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAirdrops = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/airdrops`);
        if (res.data.success) {
          setAirdrops(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching airdrops:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAirdrops();
  }, []);

  return (
    <div className="min-h-screen" style={{ background: '#0d1117' }}>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 pt-24 pb-16">
        {/* Page Header */}
        <div className="mb-10 animate-fade-in">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)', boxShadow: '0 0 24px rgba(20,184,166,0.35)' }}>
              🎁
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Active <span className="mint-gradient-text">Airdrops</span>
              </h1>
              <p className="text-white/40 text-sm mt-0.5">Participate in exclusive token airdrops on the Hela ecosystem</p>
            </div>
          </div>

          {/* Stats bar */}
          {!loading && (
            <div className="flex items-center gap-6 mt-5 p-4 glass-card rounded-2xl" style={{ border: '1px solid rgba(20,184,166,0.1)' }}>
              <div className="text-center">
                <div className="text-xl font-bold text-mint-400">{airdrops.length}</div>
                <div className="text-xs text-white/40">Active Drops</div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <div className="text-xl font-bold text-mint-400">
                  {airdrops.filter(a => new Date(a.endDate) > new Date()).length}
                </div>
                <div className="text-xs text-white/40">Still Open</div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-xs text-white/40 flex-1">
                💡 Click <span className="text-mint-400 font-medium">Participate</span> to join any airdrop before the deadline
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-52 rounded-2xl shimmer" />
            ))}
          </div>
        ) : airdrops.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-xl font-bold text-white/60 mb-2">No Active Airdrops</h2>
            <p className="text-white/30 text-sm">The admin hasn't posted any airdrops yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-in">
            {airdrops.map((ad) => {
              const isExpired = new Date(ad.endDate) < new Date();
              return (
                <div
                  key={ad._id}
                  id={`airdrop-card-${ad._id}`}
                  className="glass-card p-5 rounded-2xl flex flex-col card-hover"
                  style={{ border: `1px solid ${isExpired ? 'rgba(255,255,255,0.05)' : 'rgba(20,184,166,0.15)'}` }}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0"
                      style={{
                        background: isExpired ? 'rgba(255,255,255,0.06)' : 'rgba(20,184,166,0.12)',
                        border: `1px solid ${isExpired ? 'rgba(255,255,255,0.08)' : 'rgba(20,184,166,0.25)'}`,
                      }}>
                      {isExpired ? '⌛' : '🎁'}
                    </div>
                    <span
                      className="text-xs font-bold px-3 py-1.5 rounded-full shrink-0"
                      style={{
                        background: isExpired ? 'rgba(255,255,255,0.06)' : 'rgba(20,184,166,0.15)',
                        border: `1px solid ${isExpired ? 'rgba(255,255,255,0.08)' : 'rgba(20,184,166,0.3)'}`,
                        color: isExpired ? 'rgba(255,255,255,0.3)' : '#14b8a6',
                      }}
                    >
                      {ad.reward}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2">{ad.title}</h3>
                  <p className="text-sm text-white/50 mb-5 flex-1 leading-relaxed">{ad.description}</p>

                  {/* Footer */}
                  <div className="pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-white/30">⏰ Deadline:</span>
                        <span className={`text-xs font-medium ${isExpired ? 'text-red-400' : 'text-white/60'}`}>
                          {new Date(ad.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      {isExpired && (
                        <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">
                          Ended
                        </span>
                      )}
                      {!isExpired && (
                        <span className="text-xs bg-mint-500/10 text-mint-400 border border-mint-500/20 px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <a
                      href={ad.participationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      id={`airdrop-participate-${ad._id}`}
                      className={`w-full text-center py-2.5 rounded-xl font-semibold text-sm transition-all ${
                        isExpired
                          ? 'bg-white/5 text-white/20 cursor-not-allowed pointer-events-none'
                          : 'btn-mint'
                      }`}
                    >
                      {isExpired ? 'Airdrop Ended' : '🚀 Participate Now'}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default AirdropsPage;
