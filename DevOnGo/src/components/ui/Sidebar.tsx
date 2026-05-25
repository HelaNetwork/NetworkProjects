import { NavLink } from 'react-router-dom';
import { BookOpen, Gamepad2, Trophy, LayoutDashboard, User, Wallet } from 'lucide-react';
import { cn } from '@/src/utils/utils';
import { useUser } from '@/src/hooks/useUser';
import { doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '@/src/services/firebase';
import { useState } from 'react';

export const Sidebar = ({ onNavigate }: { onNavigate?: () => void }) => {
  const { user, refreshProfile } = useUser();
  const [claiming, setClaiming] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Learning Path', path: '/learn', icon: BookOpen },
    { name: 'Multiplayer', path: '/game/lobby', icon: Gamepad2 },
    { name: 'Achievements', path: '/achievements', icon: Trophy },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const canClaimBonus = () => {
    if (!user) return false;
    if (!user.last_bonus_claim) return true;
    
    const lastClaim = user.last_bonus_claim.toDate ? user.last_bonus_claim.toDate() : new Error('Invalid date');
    const now = new Date();
    const diffHours = (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60);
    return diffHours >= 24;
  };

  const handleClaimBonus = async () => {
    if (!user || !canClaimBonus() || claiming) return;
    
    setClaiming(true);
    try {
      const userDocRef = doc(db, 'users', user.id);
      await updateDoc(userDocRef, {
        xp: increment(50),
        last_bonus_claim: serverTimestamp()
      });
      await refreshProfile();
    } catch (err) {
      console.error('Error claiming bonus:', err);
    } finally {
      setClaiming(false);
    }
  };

  return (
    <aside className="w-[280px] bg-brand-sidebar border-r border-brand-border flex flex-col p-6 h-full overflow-y-auto">
      <div className="flex items-center gap-2 text-xl font-extrabold text-brand-primary mb-10 tracking-tight">
        <span className="text-2xl">◈</span> Web3Quest
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onNavigate}
            className={({ isActive }) => cn('nav-item', isActive && 'active')}
          >
            <item.icon size={20} />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-8">
        <div className="bg-brand-bg border border-brand-border border-dashed rounded-xl p-4">
          <p className="text-[10px] uppercase font-bold text-brand-text-muted tracking-widest mb-2">Daily Bonus</p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-brand-ink">+50 XP</span>
            <button 
              onClick={handleClaimBonus}
              disabled={!canClaimBonus() || claiming}
              className={cn(
                "text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors",
                canClaimBonus() && !claiming 
                  ? "bg-brand-primary hover:bg-brand-primary-hover shadow-sm" 
                  : "bg-gray-300 cursor-not-allowed"
              )}
            >
              {claiming ? '...' : (canClaimBonus() ? 'Claim' : 'Claimed')}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
