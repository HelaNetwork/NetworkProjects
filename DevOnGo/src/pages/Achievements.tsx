import { useEffect, useState } from 'react';
import { db } from '@/src/services/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { Card } from '@/src/components/ui/Card';
import { Trophy, Shield, Award, Zap, Star as StarIcon, Flame, Crown, Activity, Target, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/utils/utils';
import { useUser } from '@/src/hooks/useUser';

const BADGES = [
  { id: 'first-swap', title: 'DeFi Explorer', description: 'Linked your wallet and performed a trade simulation.', icon: Zap, color: 'text-brand-primary' },
  { id: 'web3-beginner', title: 'Web3 Scholar', description: 'Completed your first 3 learning modules.', icon: Award, color: 'text-brand-success' },
  { id: 'nft-creator', title: 'Digital Artist', description: 'Minted your first testnet digital asset.', icon: StarIcon, color: 'text-purple-500' },
  { id: 'streak-7', title: 'Weekly Warrior', description: 'Maintained a 7-day learning streak.', icon: Shield, color: 'text-brand-accent' },
  { id: 'game-master', title: 'Arena Victor', description: 'Won your first multiplayer knowledge match.', icon: Trophy, color: 'text-yellow-500' },
  { id: 'high-roller', title: 'High Roller', description: 'Emerged victorious in a High Stakes XP contest.', icon: Flame, color: 'text-red-500' },
];

export default function Achievements() {
  const { user, loading } = useUser();
  const [unlocked, setUnlocked] = useState<any[]>([]);
  const [leaders, setLeaders] = useState<any[]>([]);
  const [matchesPlayed, setMatchesPlayed] = useState(0);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, 'achievements'), where('user_id', '==', user.id));
      getDocs(q).then((querySnapshot) => {
        const data = querySnapshot.docs.map(doc => doc.data());
        setUnlocked(data);
      });
      
      const qLeaderboard = query(collection(db, 'users'), orderBy('xp', 'desc'), limit(10));
      getDocs(qLeaderboard).then((snap) => {
        setLeaders(snap.docs.map(d => d.data()));
      });

      const qGames = query(collection(db, 'game_history'), where('user_ids', 'array-contains', user.id));
      getDocs(qGames).then((snap) => {
        setMatchesPlayed(snap.docs.length);
      });
    }
  }, [user]);

  if (loading) return <div className="p-8 text-center text-brand-text-muted italic">Identifying your legacy...</div>;
  if (!user) return <div className="p-8 text-center text-brand-text-muted italic">Quest restricted. Sign in to view trophies.</div>;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-12 mb-20 flex flex-col lg:flex-row gap-8 lg:gap-12">
      <div className="flex-1 space-y-10">
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tighter text-brand-ink uppercase italic transform -skew-x-6 inline-block bg-brand-primary text-white px-6 py-2">
             The Vault
          </h1>
          <p className="text-brand-text-muted font-mono text-sm tracking-tight uppercase">
            Your eternal record of decentralized mastery • {unlocked.length}/{BADGES.length} Collected
          </p>
        </div>

        {/* Personal Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <Card className="p-4 bg-brand-bg border-brand-border">
              <div className="flex items-center gap-2 text-brand-text-muted mb-2 text-xs font-bold uppercase"><Activity size={14}/> Level</div>
              <div className="text-3xl font-black text-brand-ink">{user.level || 1}</div>
           </Card>
           <Card className="p-4 bg-brand-bg border-brand-border">
              <div className="flex items-center gap-2 text-brand-text-muted mb-2 text-xs font-bold uppercase"><Target size={14}/> Total XP</div>
              <div className="text-3xl font-black text-brand-primary">{user.xp || 0}</div>
           </Card>
           <Card className="p-4 bg-brand-bg border-brand-border">
              <div className="flex items-center gap-2 text-brand-text-muted mb-2 text-xs font-bold uppercase"><Flame size={14} className="text-red-500"/> Streak</div>
              <div className="text-3xl font-black text-red-600">{user.streak || 0} <span className="text-sm font-normal text-gray-500">days</span></div>
           </Card>
           <Card className="p-4 bg-brand-bg border-brand-border">
              <div className="flex items-center gap-2 text-brand-text-muted mb-2 text-xs font-bold uppercase"><TrendingUp size={14}/> Matches</div>
              <div className="text-3xl font-black text-brand-ink">{matchesPlayed}</div>
           </Card>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {BADGES.map((badge, idx) => {
            const isUnlocked = unlocked.some(u => u.badge_id === badge.id);
            const Icon = badge.icon;

            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card 
                  className={cn(
                    "p-6 relative group transition-all text-center h-full flex flex-col items-center justify-between", 
                    isUnlocked 
                      ? "border-brand-primary bg-brand-bg shadow-lg shadow-indigo-100/50 dark:shadow-indigo-900/20" 
                      : "opacity-60 bg-gray-50/50 dark:bg-white/5 border-gray-200 dark:border-gray-800"
                  )}
                >
                   <div className={cn(
                     "w-20 h-20 bg-white dark:bg-gray-900 rounded-[1.5rem] shadow-sm border flex items-center justify-center mb-4 transition-all duration-500",
                     isUnlocked ? "border-brand-primary group-hover:scale-110" : "border-gray-200 dark:border-gray-800"
                   )}>
                      <Icon size={32} className={isUnlocked ? badge.color : "text-gray-300 dark:text-gray-600"} />
                   </div>
                   
                   <div className="space-y-2 mb-4">
                     <h3 className="text-lg font-black text-brand-ink uppercase tracking-tight">{badge.title}</h3>
                     <p className="text-xs text-brand-text-muted leading-relaxed">{badge.description}</p>
                   </div>
                   
                   <div className="mt-auto w-full uppercase text-[10px] font-bold tracking-[0.1em]">
                     {isUnlocked ? (
                        <div className="py-2 rounded-md bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-100 dark:border-green-900/50 flex items-center justify-center gap-1.5">
                           <StarIcon size={12} fill="currentColor" /> Unlocked
                        </div>
                     ) : (
                        <div className="py-2 rounded-md bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700 flex items-center justify-center gap-1.5">
                           <LockIcon size={12} className="text-inherit" /> Locked
                        </div>
                     )}
                   </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
      
      {/* Sidebar Leaderboard */}
      <div className="w-full lg:w-80 space-y-6 shrink-0 mt-8 lg:mt-0">
         <div className="bg-brand-ink rounded-3xl p-6 text-white shadow-xl shadow-brand-ink/20">
            <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
              <Crown size={20} className="text-yellow-400" />
              <h2 className="text-lg font-black uppercase tracking-widest text-white">Global Leaderboard</h2>
            </div>
            
            <div className="space-y-4">
              {leaders.map((leader, idx) => (
                 <div key={leader.id} className="flex items-center justify-between group p-2 hover:bg-white/5 rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                       <span className={cn(
                         "w-6 h-6 flex items-center justify-center rounded-lg font-black text-[10px]",
                         idx === 0 ? "bg-yellow-500 text-yellow-900" : 
                         idx === 1 ? "bg-gray-300 text-gray-800" :
                         idx === 2 ? "bg-amber-700 text-amber-100" : "bg-white/10 text-white/50"
                       )}>
                          {idx + 1}
                       </span>
                       <div>
                          <div className={cn(
                            "font-bold text-sm truncate w-24",
                            leader.id === user.id ? "text-brand-primary" : "text-white"
                          )}>
                             {leader.id === user.id ? "You" : leader.email?.split('@')[0] || "Anon"}
                          </div>
                       </div>
                    </div>
                    <div className="text-xs font-black text-brand-primary font-mono bg-brand-primary/10 px-2.5 py-1 rounded-md">
                       {(leader.xp || 0).toLocaleString()}
                    </div>
                 </div>
              ))}
            </div>
         </div>
      </div>
    </div>
  );
}

const LockIcon = ({ size, className }: { size: number, className: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
