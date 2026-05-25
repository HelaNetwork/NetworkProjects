import { useUser } from '@/src/hooks/useUser';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { ProgressBar } from '@/src/components/ui/ProgressBar';
import { useAccount, useDisconnect } from 'wagmi';
import { User, Wallet, LogOut, ShieldCheck, Mail, Zap, Unlock, Target, Activity } from 'lucide-react';
import { auth } from '@/src/services/firebase';
import { signOut } from 'firebase/auth';
import { cn } from '@/src/utils/utils';
import { lessons } from '@/src/utils/lessons';

export default function Profile() {
  const { user, loading } = useUser();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) return <div className="p-8 text-center text-brand-text-muted">Loading...</div>;
  if (!user) return <div className="p-8 text-center text-brand-text-muted">Please sign in.</div>;

  const totalLessons = lessons.length;
  const completedLessons = user.completed_lessons.length;
  const unlockedLessons = user.unlocked_modules?.length || 1;
  const curriculumProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-10 mb-20">
      <div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-brand-ink uppercase">Explorer Profile</h1>
        <p className="text-brand-text-muted mt-2">Manage your identity and track your progression.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Identity Card */}
        <Card className="md:col-span-2 p-8 space-y-8 bg-white/50 backdrop-blur-xl border-dashed">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-2xl flex items-center justify-center text-brand-primary border border-indigo-200">
                <User size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-brand-ink">Personal Info</h3>
                <div className="flex items-center gap-2 text-brand-text-muted mt-1">
                  <Mail size={14} />
                  <span className="text-sm">{user.email}</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-red-500 hover:bg-red-50 bg-white shadow-sm border border-red-100">
               <LogOut size={16} className="mr-2" /> Sign Out
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-5 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 rounded-xl">
                  <Wallet size={20} className="text-brand-primary" />
                </div>
                <div>
                  <div className="text-xs font-bold text-brand-ink uppercase tracking-widest">Web3 Wallet</div>
                  <div className="text-sm font-mono text-brand-text-muted mt-0.5">
                    {isConnected ? address?.slice(0, 6) + '...' + address?.slice(-4) : user.wallet_address ? user.wallet_address.slice(0, 6) + '...' + user.wallet_address.slice(-4) : 'Not Connected'}
                  </div>
                </div>
              </div>
              {isConnected && (
                <Button variant="ghost" size="sm" onClick={() => disconnect()} className="text-red-500 hover:bg-red-50 hover:text-red-600">
                   Disconnect
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Currency & Level Card */}
        <Card className="p-8 flex flex-col justify-between space-y-8 bg-gradient-to-br from-brand-primary to-indigo-700 text-white border-none shadow-xl shadow-indigo-200">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-200 mb-6 flex items-center gap-2">
               <Zap size={14}/> Active Resources
            </h3>
            <div className="space-y-6">
              <div>
                <div className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest mb-1">Available XP</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black">{user.xp.toLocaleString()}</span>
                  <span className="text-sm font-bold text-indigo-200">XP</span>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-indigo-500/50 pt-6">
                 <div>
                    <div className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest mb-1">Current Level</div>
                    <div className="text-2xl font-bold">{user.level}</div>
                 </div>
                 <div>
                    <div className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest mb-1">Streak</div>
                    <div className="text-2xl font-bold flex items-center gap-1"><Activity size={18}/> {user.streak}</div>
                 </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      <h3 className="text-xl font-bold text-brand-ink uppercase tracking-tight pt-8 border-t">Learning Analytics</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Module Progress */}
        <Card className="p-8 bg-white text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
               <Target size={32} />
            </div>
            <h4 className="text-2xl font-black text-brand-ink mb-2">{completedLessons} / {totalLessons}</h4>
            <div className="text-xs font-bold text-brand-text-muted uppercase tracking-widest mb-6">Modules Completed</div>
            
            <div className="w-full space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-brand-text-muted uppercase tracking-widest">
                <span>Progress</span>
                <span>{curriculumProgress}%</span>
              </div>
              <ProgressBar progress={curriculumProgress} color="bg-blue-500" className="h-3" />
            </div>
        </Card>

        {/* Unlocked Potential */}
        <Card className="p-8 bg-white text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center mb-4">
               <Unlock size={32} />
            </div>
            <h4 className="text-2xl font-black text-brand-ink mb-2">{unlockedLessons} / {totalLessons}</h4>
            <div className="text-xs font-bold text-brand-text-muted uppercase tracking-widest mb-6">Modules Unlocked</div>
            
            <p className="text-sm text-brand-text-muted leading-relaxed max-w-xs mx-auto">
               You can spend your available XP to unlock new modules in the curriculum section.
            </p>
        </Card>
      </div>

    </div>
  );
}
