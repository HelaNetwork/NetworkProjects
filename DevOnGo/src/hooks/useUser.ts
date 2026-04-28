import { useEffect, useState } from 'react';
import { auth, db } from '@/src/services/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export interface UserProfile {
  id: string;
  email: string | null;
  wallet_address?: string;
  xp: number;
  level: number;
  streak: number;
  completed_lessons: string[];
  unlocked_modules: string[];
  last_bonus_claim?: any;
  created_at?: any;
}

export function useUser() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string) => {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data() as UserProfile;
        // ensure unlocked_modules is at least initialized
        if (!data.unlocked_modules) {
           data.unlocked_modules = ['know-web3']; 
        }
        setUser({ ...data, id: userDoc.id });
      } else {
        const newUserProfile: any = {
          email: auth.currentUser?.email,
          xp: 0,
          level: 1,
          streak: 1,
          completed_lessons: [],
          unlocked_modules: ['know-web3', 'install-metamask', 'wallet-create-connect'],
          created_at: serverTimestamp(),
        };
        await setDoc(userDocRef, newUserProfile);
        setUser({ ...newUserProfile, id: uid });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await fetchProfile(firebaseUser.uid);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (auth.currentUser) {
      await fetchProfile(auth.currentUser.uid);
    }
  };

  return { user, setUser, loading, refreshProfile };
}
