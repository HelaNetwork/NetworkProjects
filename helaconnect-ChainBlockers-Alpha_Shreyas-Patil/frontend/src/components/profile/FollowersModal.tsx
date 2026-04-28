import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';
import useGenerateAvatar from '../../hooks/useGenerateAvatar';

interface FollowersModalProps {
  type: 'followers' | 'following';
  wallets: string[];
  onClose: () => void;
}

const FollowersModal: React.FC<FollowersModalProps> = ({ type, wallets, onClose }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { generateAvatar } = useGenerateAvatar();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const fetched = await Promise.all(
          wallets.map(async (wallet) => {
            try {
              const res = await api.get(`/users/profile/${wallet}`);
              return res.data.data;
            } catch (e) {
              return null;
            }
          })
        );
        setUsers(fetched.filter(Boolean));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (wallets.length > 0) {
      fetchUsers();
    } else {
      setUsers([]);
      setLoading(false);
    }
  }, [wallets]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="glass-card w-full max-w-md rounded-2xl overflow-hidden flex flex-col max-h-[80vh]"
        style={{ border: '1px solid rgba(20,184,166,0.2)' }}>
        <div className="flex justify-between items-center p-5 border-b border-white/5">
          <h2 className="text-xl font-bold text-white capitalize">{type}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white text-2xl leading-none">&times;</button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          {loading ? (
            <div className="text-center py-8 text-white/40 animate-pulse">Loading {type}...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-white/30">No {type} yet.</div>
          ) : (
            <div className="space-y-2">
              {users.map(u => (
                <Link key={u.walletAddress} to={`/user/${u.walletAddress}`} onClick={onClose}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition border border-transparent hover:border-white/10">
                  <img
                    src={generateAvatar(u.walletAddress || u.fullName)}
                    alt={u.fullName || 'User'}
                    className="w-11 h-11 rounded-full object-cover shrink-0"
                    style={{ boxShadow: '0 0 8px rgba(20,184,166,0.3)' }}
                  />
                  <div>
                    <h4 className="font-bold text-white text-sm">{u.fullName || 'Anonymous User'}</h4>
                    <p className="text-xs text-white/40">{u.work?.jobTitle || 'Web3 Enthusiast'}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowersModal;
