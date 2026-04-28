import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Airdrop } from '../../types';

const API_URL = import.meta.env.VITE_API_URL;

const AirdropsTab: React.FC = () => {
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

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-44 rounded-2xl shimmer" />
        ))}
      </div>
    );
  }

  if (airdrops.length === 0) {
    return (
      <div className="text-center py-20 text-white/30">
        <div className="text-5xl mb-4">🎁</div>
        <h3 className="text-lg font-semibold text-white/50 mb-2">No Active Airdrops</h3>
        <p className="text-sm">Check back soon — new drops are added regularly!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {airdrops.map((ad) => (
        <div key={ad._id} className="glass-card p-5 rounded-2xl card-hover flex flex-col" style={{ border: '1px solid rgba(20,184,166,0.12)' }}>
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
              style={{ background: 'rgba(20,184,166,0.12)', border: '1px solid rgba(20,184,166,0.2)' }}>
              🎁
            </div>
            <span className="text-xs bg-mint-500/20 text-mint-400 px-3 py-1 rounded-full border border-mint-500/30 font-semibold">
              {ad.reward}
            </span>
          </div>

          <h3 className="text-base font-bold text-white mb-2">{ad.title}</h3>
          <p className="text-sm text-white/50 mb-4 flex-1 line-clamp-3">{ad.description}</p>

          {/* Footer */}
          <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-2">
            <span className="text-xs text-white/30">
              ⏰ Ends {new Date(ad.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <a
              href={ad.participationLink}
              target="_blank"
              rel="noopener noreferrer"
              id={`airdrop-participate-${ad._id}`}
              className="btn-mint text-sm px-4 py-2 whitespace-nowrap"
            >
              Participate ↗
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AirdropsTab;
