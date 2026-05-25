import { useUser } from '@/src/hooks/useUser';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { ProgressBar } from '@/src/components/ui/ProgressBar';
import { lessons } from '@/src/utils/lessons';
import { useEffect, useState } from 'react';
import { Flame, Trophy, BookOpen, Star as StarIcon, Users } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/src/services/firebase';
import { cn } from '@/src/utils/utils';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, loading } = useUser();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const navigate = useNavigate();

  const [canClaim, setCanClaim] = useState(false);

  useEffect(() => {
    if (user) {
      if (!user.last_bonus_claim) {
        setCanClaim(true);
      } else {
        const lastClaim = new Date(user.last_bonus_claim);
        const now = new Date();
        const diffHours = (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60);
        setCanClaim(diffHours >= 24);
      }
    }
  }, [user]);

  const handleClaimBonus = async () => {
    if (!user || (!canClaim && user.last_bonus_claim)) return;
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        xp: user.xp + 50,
        last_bonus_claim: new Date().toISOString()
      });
      setCanClaim(false);
      // Wait for useUser to auto-sync XP from firestore
    } catch (e) {
      console.error('Failed to claim bonus', e);
    }
  };

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const q = query(collection(db, 'users'), orderBy('xp', 'desc'), limit(10));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLeaderboard(data);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) return <div className="p-8 text-center text-brand-text-muted">Loading profile...</div>;
  if (!user) return (
    <div className="p-16 max-w-lg mx-auto text-center space-y-6 mt-10">
      <h2 className="text-3xl font-black text-brand-ink">Welcome to Web3Quest</h2>
      <p className="text-brand-text-muted">You need to create an account or sign in to start tracking your XP and entering multiplayer battles.</p>
      <Button size="xl" className="w-full" onClick={() => navigate('/login')}>Sign Up / Sign In</Button>
    </div>
  );

  const currentProgress = Math.round(((user.completed_lessons?.length || 0) / lessons.length) * 100);
  const nextLessonIndex = user.completed_lessons?.length || 0;
  const currentLesson = lessons[nextLessonIndex] || lessons[lessons.length - 1];
  const upcomingLessons = lessons.slice(nextLessonIndex + 1, nextLessonIndex + 4);

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8">
      {/* Summary Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 border-brand-border bg-white shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
            <Trophy size={24} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest">Global Rank</div>
            <div className="text-xl font-black text-brand-ink">
              #{leaderboard.findIndex(l => l.id === user.id) + 1 || '?'}
            </div>
          </div>
        </Card>
        <Card className="p-6 border-brand-border bg-white shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
            <Flame size={24} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest">Streak</div>
            <div className="text-xl font-black text-brand-ink">{user.streak} Days</div>
          </div>
        </Card>
        <Card className="p-6 border-brand-border bg-white shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <BookOpen size={24} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest">Progress</div>
            <div className="text-xl font-black text-brand-ink">{currentProgress}%</div>
          </div>
        </Card>
        <Card className="p-6 border-brand-border bg-white shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center">
             <StarIcon size={24} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest">Level</div>
            <div className="text-xl font-black text-brand-ink">Lvl {user.level}</div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="p-8 border-brand-border bg-white shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
            <div>
              <h2 className="text-xl font-bold text-brand-ink">
                {nextLessonIndex >= lessons.length ? 'Mastered!' : 'Continue Learning'}
              </h2>
              <p className="text-sm text-brand-text-muted mt-1">
                {nextLessonIndex >= lessons.length 
                  ? 'You have completed all current modules.' 
                  : `Unit ${nextLessonIndex + 1}: ${currentLesson.title}`}
              </p>
            </div>
            <Button 
              size="lg" 
              className="rounded-xl px-8" 
              onClick={() => navigate('/learn')}
              disabled={nextLessonIndex >= lessons.length}
            >
              {nextLessonIndex >= lessons.length ? 'All Clear' : 'Resume Lesson'}
            </Button>
          </div>
          
          <div className="space-y-2">
            <ProgressBar progress={currentProgress} color="bg-brand-primary" className="h-2" />
          </div>

          <div className="flex gap-10 mt-6">
            <div>
              <div className="text-[10px] uppercase font-bold text-brand-text-muted tracking-widest">Current Task</div>
              <div className="text-sm font-semibold text-brand-ink mt-0.5">
                {currentLesson.web3Task?.title || 'Knowledge Check'}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-brand-text-muted tracking-widest">Estimated Reward</div>
              <div className="text-sm font-semibold text-brand-success mt-0.5">+100 XP</div>
            </div>
          </div>
        </Card>

        <Card className="p-0 border-brand-border bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-brand-border bg-gray-50/50">
            <h3 className="text-sm font-bold text-brand-ink uppercase tracking-widest">Upcoming Lessons</h3>
          </div>
          <div className="divide-y divide-brand-border">
            {upcomingLessons.length > 0 ? upcomingLessons.map((lesson, idx) => (
              <div key={lesson.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg">
                  {idx === 0 ? '⚓' : idx === 1 ? '🎨' : '⚖️'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-brand-ink truncate">{lesson.title}</div>
                  <div className="text-xs text-brand-text-muted truncate">{lesson.description}</div>
                </div>
                <div className="text-[10px] font-bold text-brand-text-muted uppercase px-3 py-1 bg-gray-50 rounded-lg border border-brand-border">Locked</div>
              </div>
            )) : (
              <div className="p-8 text-center text-brand-text-muted text-sm italic">
                Check back later for new modules!
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white overflow-hidden relative group shadow-lg">
          <h3 className="text-lg font-bold mb-2">Live Quest Mode</h3>
          <p className="text-sm opacity-90 mb-6 leading-relaxed">
            Real-time multiplayer battle. Face off against global explorers.
          </p>
          <div className="mb-6">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-2 block text-white/70">Join Now</span>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3 font-mono text-xl tracking-[0.2em] font-bold inline-block min-w-[140px] text-center">
              READY
            </div>
          </div>
          <Button 
            variant="secondary" 
            className="w-full bg-white text-indigo-600 border-none shadow-xl hover:bg-gray-50 font-bold" 
            onClick={() => navigate('/game/lobby')}
          >
            Enter Lobby
          </Button>
          
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
        </div>

        <Card className="p-6 border-brand-border bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100 shadow-sm relative overflow-hidden">
           <div className="relative z-10">
              <h3 className="text-sm font-bold text-emerald-900 uppercase tracking-widest mb-2">Daily Bonus</h3>
              <p className="text-xs text-emerald-700 mb-6 font-medium leading-relaxed">Claim your daily allowance of XP to unlock more curriculum modules and participate in high stakes contests.</p>
              
              <Button 
                onClick={handleClaimBonus} 
                disabled={!canClaim}
                className={cn(
                  "w-full text-white font-bold",
                   canClaim ? "bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/30" : "bg-gray-300 text-gray-500 shadow-none"
                )}
              >
                 {canClaim ? 'Claim +50 XP' : 'Come Back Tomorrow'}
              </Button>
           </div>
           <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4">
              <StarIcon size={80} className="text-emerald-500" />
           </div>
        </Card>

        <Card className="p-6 border-brand-border bg-white shadow-sm">
          <h3 className="text-sm font-bold text-brand-ink uppercase tracking-widest mb-6 border-b border-brand-border pb-2">Top Explorers</h3>
          <div className="space-y-1">
            {leaderboard.map((item, idx) => (
              <div 
                key={item.id} 
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl transition-colors",
                  item.id === user.id ? "bg-indigo-50 border border-indigo-100" : "hover:bg-gray-50"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "text-xs font-black w-6 text-center",
                    idx === 0 ? "text-yellow-500" : idx === 1 ? "text-gray-400" : idx === 2 ? "text-amber-600" : "text-brand-text-muted"
                  )}>
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-brand-ink truncate max-w-[120px]">
                    {item.email?.split('@')[0] || 'Anonymous'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-brand-success shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                   <span className="text-xs font-black text-brand-primary">{item.xp?.toLocaleString()}</span>
                </div>
              </div>
            ))}
            
            {!leaderboard.some(l => l.id === user.id) && (
              <div className="mt-4 pt-4 border-t border-brand-border border-dashed">
                <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-brand-primary w-6 text-center">?</span>
                    <span className="text-xs font-bold text-brand-ink">You</span>
                  </div>
                  <span className="text-xs font-black text-brand-primary">{user.xp?.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  </div>
  );
}
