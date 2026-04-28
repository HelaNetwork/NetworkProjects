import { useEffect, useState } from 'react';
import { db, auth } from '@/src/services/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useUser } from '@/src/hooks/useUser';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { Button } from './Button';
import { LogOut, Moon, Sun } from 'lucide-react';

export const Navbar = () => {
  const { user, setUser } = useUser();
  const { address } = useAccount();
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    if (address && user && user.wallet_address !== address) {
      const userDocRef = doc(db, 'users', user.id);
      updateDoc(userDocRef, { wallet_address: address }).then(() => {
        setUser({ ...user, wallet_address: address });
      });
    }
  }, [address, user, setUser]);

  const handleSignOut = () => signOut(auth);

  return (
    <header className="h-[72px] bg-brand-sidebar border-bottom border-brand-border flex items-center justify-between px-8 shrink-0 border-b">
      <div>
        <h1 className="text-lg font-bold text-brand-ink">Welcome back, Explorer</h1>
        <p className="text-xs text-brand-text-muted mt-0.5">
          {user ? `You've earned ${user.xp} XP so far.` : 'Join the quest to master Web3.'}
        </p>
      </div>

      <div className="flex items-center gap-6">
        <Button variant="ghost" size="sm" onClick={toggleDark} className="w-8 h-8 p-0 rounded-full text-brand-text-muted hover:text-brand-ink">
           {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </Button>
        <div className="hidden lg:flex items-center gap-4">
          <div className="flex items-center gap-2 bg-brand-bg px-3 py-1.5 rounded-full text-xs font-bold font-mono border border-brand-border">
            <span className="text-brand-accent">🔥</span>
            <span className="text-brand-ink">{user?.streak || 0} STREAK</span>
          </div>
          <div className="flex items-center gap-2 bg-brand-bg px-3 py-1.5 rounded-full text-xs font-bold font-mono border border-brand-border">
            <span>✨</span>
            <span className="text-brand-ink">{user?.xp || 0} XP</span>
          </div>
        </div>

        <div className="flex items-center gap-4 pl-6 border-l border-brand-border">
          <ConnectButton showBalance={false} chainStatus="none" accountStatus="avatar" />
          
          {user ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="w-8 h-8 p-0 border border-brand-border rounded-full hover:bg-brand-bg text-brand-text-muted hover:text-brand-ink">
                <LogOut size={16} />
              </Button>
            </div>
          ) : (
            <Button size="sm" onClick={() => window.location.href = '/login'}>Sign In</Button>
          )}
        </div>
      </div>
    </header>
  );
};
