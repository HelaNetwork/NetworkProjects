import { useState } from 'react';
import { auth } from '@/src/services/firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { LogIn, Mail, Lock, UserPlus } from 'lucide-react';
import React from 'react';

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('Google sign-in is not enabled in the Firebase Console. Please enable it in Authentication > Sign-in method.');
      } else {
        setError(err.message);
      }
    }
    setIsLoading(false);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password sign-in is not enabled in the Firebase Console. Please enable it in Authentication > Sign-in method.');
      } else {
        setError(err.message);
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg px-4">
      <Card className="w-full max-w-md p-10">
        <div className="text-center mb-10">
          <div className="text-3xl font-extrabold text-brand-primary mb-2 tracking-tight">
            <span className="text-4xl">◈</span> Web3Quest
          </div>
          <p className="text-brand-text-muted">
            {isSignUp ? 'Create your account to start learning' : 'Welcome back, Explorer'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm mb-6">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full py-6 border-brand-border text-brand-ink hover:bg-gray-50 bg-white"
            onClick={handleGoogleLogin}
            isLoading={isLoading}
          >
            <LogIn className="mr-2 h-5 w-5" /> Continue with Google
          </Button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-brand-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-brand-text-muted font-bold tracking-widest leading-none">Or email</span>
            </div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-muted" size={18} />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-brand-border focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-brand-primary transition-all bg-brand-bg/50"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-muted" size={18} />
                <input
                  type="password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-brand-border focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-brand-primary transition-all bg-brand-bg/50"
                />
              </div>
            </div>
            
            <Button type="submit" className="w-full py-7 text-base rounded-xl mt-2" isLoading={isLoading}>
              {isSignUp ? (
                <><UserPlus className="mr-2 h-5 w-5" /> Create Account</>
              ) : (
                <><LogIn className="mr-2 h-5 w-5" /> Sign In</>
              )}
            </Button>
          </form>

          <div className="text-center pt-4">
            <button 
              type="button"
              className="text-sm font-semibold text-brand-primary hover:underline"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>

        <p className="mt-10 text-center text-[10px] text-brand-text-muted uppercase tracking-widest font-bold">
          Protected by Web3Quest Cloud Security
        </p>
      </Card>
    </div>
  );
}
