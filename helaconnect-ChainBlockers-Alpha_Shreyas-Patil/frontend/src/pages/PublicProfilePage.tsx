import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import Navbar from '../components/layout/Navbar';
import OnChainModal from '../components/ui/OnChainModal';
import api from '../lib/axios';
import { User } from '../types';
import FollowersModal from '../components/profile/FollowersModal';
import useGenerateAvatar from '../hooks/useGenerateAvatar';

const PublicProfilePage: React.FC = () => {
  const { walletAddress } = useParams<{ walletAddress: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((s: RootState) => s.auth);

  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnChain, setShowOnChain] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [modalType, setModalType] = useState<'followers' | 'following' | null>(null);
  const { generateAvatar } = useGenerateAvatar();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/users/profile/${walletAddress}`);
        const u: User = res.data.data;
        setProfile(u);
        
        if (currentUser?.walletAddress && u.walletAddress) {
          setIsFollowing(u.followers?.includes(currentUser.walletAddress.toLowerCase()) || false);
        }
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [walletAddress, currentUser?.walletAddress]);

  const handleFollow = async () => {
    if (!profile || !currentUser?.walletAddress) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await api.post('/users/unfollow', {
          followerWallet: currentUser.walletAddress,
          targetWallet: profile.walletAddress
        });
        setIsFollowing(false);
        setProfile({ ...profile, followers: profile.followers.filter(w => w !== currentUser.walletAddress?.toLowerCase()) });
      } else {
        await api.post('/users/follow', {
          followerWallet: currentUser.walletAddress,
          targetWallet: profile.walletAddress
        });
        setIsFollowing(true);
        setProfile({ ...profile, followers: [...(profile.followers || []), currentUser.walletAddress.toLowerCase()] });
      }
    } catch { /* silent */ }
    finally { setFollowLoading(false); }
  };

  const isOwnProfile = currentUser?.walletAddress === walletAddress?.toLowerCase();

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: '#0d1117' }}>
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 pt-24 pb-12">
          <div className="space-y-4">
            <div className="h-40 rounded-2xl shimmer" />
            <div className="h-32 rounded-2xl shimmer" />
            <div className="h-48 rounded-2xl shimmer" />
          </div>
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen" style={{ background: '#0d1117' }}>
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 pt-24 pb-12 text-center">
          <div className="text-5xl mb-4">😶</div>
          <h2 className="text-xl text-white font-bold mb-2">User Not Found</h2>
          <p className="text-white/40 mb-6">This wallet address isn't registered on helaconntect.</p>
          <button onClick={() => navigate(-1)} className="btn-ghost">← Go Back</button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#0d1117' }}>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 pt-24 pb-12">
        <div className="space-y-5 animate-fade-in">

          {/* Profile Header Card */}
          <div className="glass-card p-6 rounded-2xl" style={{ border: '1px solid rgba(20,184,166,0.15)' }}>
            <div className="flex items-start justify-between gap-4">
              {/* Avatar + basic info */}
              <div className="flex items-center gap-4">
                <img
                  src={generateAvatar(profile.walletAddress || profile.fullName)}
                  alt={profile.fullName || 'User'}
                  className="w-16 h-16 rounded-2xl shrink-0 object-cover"
                  style={{ boxShadow: '0 0 20px rgba(20,184,166,0.3)' }}
                />
                <div>
                  <h1 className="text-xl font-bold text-white">{profile.fullName || 'Unnamed User'}</h1>
                  {profile.work?.jobTitle && (
                    <p className="text-sm text-mint-400 mt-0.5">{profile.work.jobTitle}
                      {profile.work.companyName && <span className="text-white/40"> @ {profile.work.companyName}</span>}
                    </p>
                  )}
                  <p className="text-xs font-mono text-white/25 mt-1 truncate max-w-xs">{profile.walletAddress}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 shrink-0">
                {isOwnProfile ? (
                  <button
                    id="edit-own-profile-btn"
                    onClick={() => navigate('/profile')}
                    className="btn-mint text-sm px-5 py-2"
                  >✏️ Edit Profile</button>
                ) : (
                  <button
                    id="follow-user-btn"
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={isFollowing ? 'btn-ghost text-sm px-5 py-2' : 'btn-mint text-sm px-5 py-2'}
                  >
                    {followLoading ? '⟳' : isFollowing ? '✓ Connected' : '+ Add Connection'}
                  </button>
                )}
                <button
                  id="view-onchain-btn"
                  onClick={() => setShowOnChain(true)}
                  className="btn-ghost text-sm px-5 py-2 flex items-center gap-1.5"
                >
                  ⛓️ On-Chain Data
                </button>
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="mt-4 text-white/60 text-sm leading-relaxed"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
                {profile.bio}
              </p>
            )}

            {/* Stats row */}
            <div className="flex gap-6 mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="text-center cursor-pointer hover:text-mint-400 transition" onClick={() => setModalType('followers')}>
                <div className="text-lg font-bold text-mint-400">{profile?.followers?.length || 0}</div>
                <div className="text-xs text-white/40">Followers</div>
              </div>
              <div className="text-center cursor-pointer hover:text-mint-400 transition" onClick={() => setModalType('following')}>
                <div className="text-lg font-bold text-mint-400">{profile?.following?.length || 0}</div>
                <div className="text-xs text-white/40">Following</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-mint-400">{profile.skills?.length || 0}</div>
                <div className="text-xs text-white/40">Skills</div>
              </div>
            </div>
          </div>

          {/* Skills */}
          {profile.skills?.length > 0 && (
            <div className="glass-card p-5 rounded-2xl" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
              <h2 className="font-bold text-white mb-3 flex items-center gap-2">
                <span>⚡</span> Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((s) => (
                  <span key={s} className="skill-tag selected pointer-events-none">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {profile.education && (
            <div className="glass-card p-5 rounded-2xl" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
              <h2 className="font-bold text-white mb-3 flex items-center gap-2">
                <span>🎓</span> Education
              </h2>
              <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <p className="font-semibold text-white">{profile.education.degree} in {profile.education.fieldOfStudy}</p>
                <p className="text-sm text-white/50 mt-0.5">{profile.education.institution}</p>
                <p className="text-xs text-white/30 mt-1">Class of {profile.education.year}</p>
              </div>
            </div>
          )}

          {/* Work */}
          {profile.isWorking && profile.work && (
            <div className="glass-card p-5 rounded-2xl" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
              <h2 className="font-bold text-white mb-3 flex items-center gap-2">
                <span>💼</span> Work Experience
              </h2>
              <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <p className="font-semibold text-white">{profile.work.jobTitle}</p>
                <p className="text-sm text-mint-400 mt-0.5">{profile.work.companyName}</p>
                <p className="text-xs text-white/30 mt-1">{profile.work.yearsOfExperience} year{profile.work.yearsOfExperience !== 1 ? 's' : ''} of experience</p>
              </div>
            </div>
          )}

          {/* On-Chain section preview */}
          <div
            className="glass-card p-5 rounded-2xl cursor-pointer card-hover"
            style={{ border: '1px solid rgba(20,184,166,0.15)' }}
            onClick={() => setShowOnChain(true)}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-white flex items-center gap-2">
                  <span>⛓️</span> On-Chain Data
                </h2>
                <p className="text-xs text-white/40 mt-1">Wallet activity on Hela Testnet blockchain</p>
              </div>
              <div className="text-mint-400 text-xl">›</div>
            </div>
          </div>
        </div>
      </main>

      {showOnChain && (
        <OnChainModal
          walletAddress={profile.walletAddress}
          onClose={() => setShowOnChain(false)}
        />
      )}

      {modalType && profile && (
        <FollowersModal
          type={modalType}
          wallets={modalType === 'followers' ? profile.followers || [] : profile.following || []}
          onClose={() => setModalType(null)}
        />
      )}
    </div>
  );
};

export default PublicProfilePage;
