import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '@/src/services/firebase';
import { 
  collection, 
  addDoc, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  limit, 
  orderBy,
  serverTimestamp,
  updateDoc,
  onSnapshot
} from 'firebase/firestore';
import { useUser } from '@/src/hooks/useUser';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { generateRoomCode } from '@/src/utils/utils';
import { Plus, Hash, Users, Cpu, Play, History, Zap, Trophy, Flame, Globe, Lock } from 'lucide-react';
import React from 'react';
import { cn } from '@/src/utils/utils';
import { toast } from 'sonner';
import { ConfirmationModal } from '@/src/components/ui/ConfirmationModal';

export default function Lobby() {
  const [roomCode, setRoomCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [liveContests, setLiveContests] = useState<any[]>([]);
  const [isContestPublic, setIsContestPublic] = useState(true);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [pendingSessionId, setPendingSessionId] = useState<string | null>(null);
  const { user, setUser } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, 'game_history'), 
        where('user_ids', 'array-contains', user.id),
        orderBy('ended_at', 'desc'),
        limit(5)
      );
      getDocs(q).then(snap => {
        setHistory(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });

      const liveQ = query(
        collection(db, 'game_sessions'),
        where('status', '==', 'lobby'),
        where('mode', '==', 'contest'),
        where('isPublic', '==', true),
        limit(15)
      );
      const unsub = onSnapshot(liveQ, (snap) => {
        setLiveContests(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsub();
    }
  }, [user]);

  const createRoom = async (mode: 'multiplayer' | 'solo' | 'bot' | 'contest' = 'multiplayer') => {
    if (!user) return;
    
    let entryFee = 0;
    if (mode === 'contest') {
      entryFee = 200;
      if (user.xp < entryFee) {
        toast.error("Not enough XP for the entry fee!");
        return;
      }
    }

    setIsLoading(true);
    const code = generateRoomCode();
    
    try {
      // Deduct XP immediately if it's a contest
      if (mode === 'contest') {
        const userRef = doc(db, 'users', user.id);
        const newXp = user.xp - entryFee;
        await updateDoc(userRef, { xp: newXp });
        setUser({ ...user, xp: newXp });
      }

      const sessionRef = await addDoc(collection(db, 'game_sessions'), {
        created_by: user.id,
        room_code: code,
        status: (mode === 'multiplayer' || mode === 'contest') ? 'lobby' : 'playing',
        mode: mode,
        isPublic: mode === 'contest' ? isContestPublic : mode === 'multiplayer' ? true : false,
        entry_fee: entryFee,
        prize_pool: entryFee * 2, // House bonus maybe? Or just pot
        created_at: serverTimestamp(),
        current_question_index: 0,
        question_deadline: new Date(Date.now() + 20000).toISOString()
      });

      // Add host as player
      const playerRef = doc(db, 'game_sessions', sessionRef.id, 'players', user.id);
      await setDoc(playerRef, {
        session_id: sessionRef.id,
        user_id: user.id,
        score: 0,
        is_ready: true,
        email: user.email
      });

      if (mode === 'bot') {
        const botId = 'bot_alpha';
        const botRef = doc(db, 'game_sessions', sessionRef.id, 'players', botId);
        await setDoc(botRef, {
           session_id: sessionRef.id,
           user_id: botId,
           score: 0,
           is_ready: true,
           email: 'Bot Alpha'
        });
      }

      toast.success(`Successfully created ${mode} room!`);
      navigate(`/game/${sessionRef.id}`);
    } catch (error) {
      console.error('Error creating room:', error);
      toast.error('Could not create room.');
    }
    setIsLoading(false);
  };

  const findRandomMatch = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const q = query(
        collection(db, 'game_sessions'), 
        where('status', '==', 'lobby'),
        where('mode', '==', 'multiplayer'),
        limit(15)
      );
      const snap = await getDocs(q);
      const rooms = snap.docs.filter(d => d.data().created_by !== user.id && d.data().isPublic !== false);
      
      if (rooms.length > 0) {
        const room = rooms[Math.floor(Math.random() * rooms.length)];
        await joinById(room.id);
      } else {
        toast.info('No available public rooms. Creating one for you...');
        await createRoom('multiplayer');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to find a match.');
    }
    setIsLoading(false);
  };

  const joinById = async (sessionId: string) => {
    if (!user) return;
    const playerRef = doc(db, 'game_sessions', sessionId, 'players', user.id);
    await setDoc(playerRef, {
      session_id: sessionId,
      user_id: user.id,
      score: 0,
      is_ready: true,
      email: user.email
    });
    toast.success('Joined match successfully!');
    navigate(`/game/${sessionId}`);
  };

  const joinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !roomCode) return;
    setIsLoading(true);

    try {
      const q = query(
        collection(db, 'game_sessions'), 
        where('room_code', '==', roomCode.trim().toUpperCase()), 
        where('status', '==', 'lobby'),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        toast.error('Room not found or game already in progress!');
      } else {
        const sessionDoc = querySnapshot.docs[0];
        const sessionData = sessionDoc.data();

        if (sessionData.mode === 'contest' && sessionData.entry_fee) {
           if (user.xp < sessionData.entry_fee) {
              toast.error(`You need ${sessionData.entry_fee} XP to join this contest match!`);
              setIsLoading(false);
              return;
           }
           // deduct XP
           const userRef = doc(db, 'users', user.id);
           const newXp = user.xp - sessionData.entry_fee;
           await updateDoc(userRef, { xp: newXp });
           setUser({ ...user, xp: newXp });
           
           // bump prize pool
           await updateDoc(doc(db, 'game_sessions', sessionDoc.id), {
              prize_pool: (sessionData.prize_pool || 0) + sessionData.entry_fee
           });
        }
        await joinById(sessionDoc.id);
      }
    } catch (error) {
      console.error('Error joining room:', error);
      toast.error('Error joining room. Check permissions.');
    }
    setIsLoading(false);
  };

  const showMatchDetails = (item: any) => {
    const isWin = item.winner_id === user?.id;
    const playersStr = item.players?.map((p:any) => `${p.email.split('@')[0]} (${p.score})`).join(' vs ') || 'Unknown Players';
    toast(`Match Details: ${item.mode.toUpperCase()}`, {
      description: `Result: ${isWin ? 'Victory' : 'Defeat'} | Players: ${playersStr}`,
      duration: 5000,
      icon: isWin ? <Trophy className="text-green-500" /> : <History className="text-gray-500" />
    });
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-10 mb-20">
      <div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-brand-ink uppercase">Multiplayer Arena</h1>
        <p className="text-brand-text-muted mt-2">Compete in real-time or practice with bots.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Play Modes */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Card className="p-8 group hover:border-brand-primary transition-all cursor-pointer bg-brand-bg border-brand-border" onClick={() => createRoom('multiplayer')}>
            <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/40 text-brand-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Users size={28} />
            </div>
            <h3 className="text-xl font-bold text-brand-ink mb-2">Private Room</h3>
            <p className="text-sm text-brand-text-muted mb-8">Generate a code and invite your friends to a custom battle.</p>
            <Button variant="outline" className="w-full">Host Match</Button>
          </Card>

          <Card className="p-8 group hover:border-amber-500 transition-all cursor-default bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-900/50">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Trophy size={28} />
            </div>
            <div className="flex justify-between items-start mb-2">
               <h3 className="text-xl font-bold text-amber-900 dark:text-amber-500">High Stakes</h3>
               <span className="text-[10px] bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-1 rounded font-black uppercase flex items-center gap-1">
                 <Flame size={12} fill="currentColor"/> 200 XP
               </span>
            </div>
            <p className="text-sm text-amber-700/80 dark:text-amber-600/80 mb-6">Put your XP on the line! Winner takes the pooled prize fund.</p>
            
            <div className="flex gap-2 items-center mb-4">
              <Button size="sm" variant={isContestPublic ? "default" : "outline"} className={cn("w-full", isContestPublic ? "bg-amber-500 hover:bg-amber-600 text-white border-none" : "border-amber-300 text-amber-700")} onClick={() => setIsContestPublic(true)}>
                 <Globe size={14} className="mr-2" /> Public
              </Button>
              <Button size="sm" variant={!isContestPublic ? "default" : "outline"} className={cn("w-full", !isContestPublic ? "bg-amber-500 hover:bg-amber-600 text-white border-none" : "border-amber-300 text-amber-700")} onClick={() => setIsContestPublic(false)}>
                 <Lock size={14} className="mr-2" /> Private
              </Button>
            </div>
            <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 border-none text-white shadow-xl shadow-amber-500/20" onClick={() => createRoom('contest')}>Host Contest</Button>
          </Card>

          <Card className="p-8 group hover:border-brand-primary transition-all cursor-pointer bg-brand-bg border-brand-border" onClick={findRandomMatch}>
             <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 text-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Zap size={28} />
            </div>
            <h3 className="text-xl font-bold text-brand-ink mb-2">Random Match</h3>
            <p className="text-sm text-brand-text-muted mb-8">Instant matching with active global explorers.</p>
            <Button variant="outline" className="w-full">Quick Play</Button>
          </Card>

          <Card className="p-8 group hover:border-brand-primary transition-all cursor-pointer bg-brand-bg border-brand-border" onClick={() => createRoom('bot')}>
             <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/30 text-brand-success rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Cpu size={28} />
            </div>
            <h3 className="text-xl font-bold text-brand-ink mb-2">Bot Practice</h3>
            <p className="text-sm text-brand-text-muted mb-8">Train against our AI to sharpen your Web3 knowledge.</p>
            <Button variant="outline" className="w-full">Start Training</Button>
          </Card>
        </div>

        {/* Join Panel */}
        <div className="space-y-6">
          <Card className="p-8 bg-brand-primary text-white border-none shadow-xl">
            <h3 className="text-lg font-bold mb-4 uppercase tracking-widest flex items-center gap-2">
              <Hash size={18} /> Join with Code
            </h3>
            <form onSubmit={joinByCode} className="space-y-4">
               <input
                type="text"
                placeholder="ABCDEF"
                className="w-full text-center text-2xl font-mono tracking-[0.3em] uppercase py-4 bg-white/10 border border-white/20 rounded-xl outline-none focus:bg-white/20 transition-all placeholder:text-white/40"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                maxLength={6}
                required
              />
              <Button 
                type="submit"
                className="w-full bg-white text-brand-primary hover:bg-gray-50 font-black"
                isLoading={isLoading} 
              >
                Assemble Group
              </Button>
            </form>
          </Card>

          {/* Live Contests */}
          <Card className="p-6 bg-brand-bg overflow-hidden border-brand-border">
            <div className="flex items-center gap-2 mb-4 text-brand-ink font-bold uppercase text-xs tracking-widest border-b border-brand-border pb-2">
              <Flame size={14} className="text-amber-500" /> Live Public Contests
            </div>
            <div className="space-y-3">
              {liveContests.filter(c => c.isPublic !== false).length > 0 ? liveContests.filter(c => c.created_by !== user?.id && c.isPublic !== false).slice(0,4).map((contest, idx) => (
                <div key={idx} className="flex justify-between items-center group bg-brand-bg p-3 rounded-lg border border-brand-border hover:border-amber-400 transition-colors">
                  <div>
                    <div className="text-xs font-bold text-brand-ink">Prize: {contest.prize_pool} XP</div>
                    <div className="text-[10px] text-brand-text-muted">Host: {contest.created_by.slice(0, 5)}...</div>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs h-8 px-3" onClick={() => {
                     setRoomCode(contest.room_code);
                     document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' });
                  }}>
                    Select
                  </Button>
                </div>
              )) : (
                <div className="text-center py-6 text-brand-text-muted text-xs italic">No open contests.</div>
              )}
            </div>
          </Card>
          
          <Card className="p-6 bg-brand-bg overflow-hidden border-brand-border">
            <div className="flex items-center gap-2 mb-6 text-brand-ink font-bold uppercase text-xs tracking-widest border-b border-brand-border pb-2">
              <History size={14} /> Match History
            </div>
            <div className="space-y-4">
              {history.length > 0 ? history.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center group cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 p-2 rounded -mx-2 transition-colors" onClick={() => showMatchDetails(item)}>
                  <div>
                    <div className="text-sm font-bold text-brand-ink group-hover:text-brand-primary">{item.mode || 'Match'}</div>
                    <div className="text-[10px] text-brand-text-muted">{item.ended_at?.toDate().toLocaleDateString()}</div>
                  </div>
                  <div className={cn(
                    "px-2 py-1 rounded text-[10px] font-black uppercase",
                    item.winner_id === user?.id ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800"
                  )}>
                    {item.winner_id === user?.id ? 'Victory' : 'Defeat'}
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-brand-text-muted text-xs italic">No matches yet.</div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

const Gamepad2 = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <line x1="6" y1="12" x2="10" y2="12" />
    <line x1="8" y1="10" x2="8" y2="14" />
    <circle cx="15" cy="13" r="1" />
    <circle cx="18" cy="11" r="1" />
    <rect x="2" y="6" width="20" height="12" rx="2" />
  </svg>
);
