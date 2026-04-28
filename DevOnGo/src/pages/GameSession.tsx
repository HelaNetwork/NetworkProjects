import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { db } from '@/src/services/firebase';
import { useUser } from '@/src/hooks/useUser';
import { 
  doc, 
  onSnapshot, 
  updateDoc, 
  collection, 
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';
import { ConfirmationModal } from '@/src/components/ui/ConfirmationModal';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Timer } from '@/src/components/ui/Timer';
import { QuestionCard } from '@/src/components/ui/QuestionCard';
import { ScoreBadge } from '@/src/components/ui/ScoreBadge';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Crown, ArrowRight, Loader2, Sparkles, Trophy, Flame, LogOut } from 'lucide-react';
import { lessons } from '@/src/utils/lessons';
import { cn } from '@/src/utils/utils';
import { unlockAchievement } from '@/src/services/achievementsService';
import { useLayout } from '@/src/components/ui/Layout';
import { fetchBattleRoomResultsFromDb, type BattlePlayerDbInfo } from '@/src/services/progressDbService';

export default function GameSessionPage() {
  const { setHideSidebar } = useLayout();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: userLoading } = useUser();
  const [session, setSession] = useState<any>(null);
  
  useEffect(() => {
    setHideSidebar(true);
    return () => setHideSidebar(false);
  }, [setHideSidebar]);

  const [players, setPlayers] = useState<any[]>([]);
  const [localQuestionIndex, setLocalQuestionIndex] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | undefined>(undefined);
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const historySaved = useRef(false);
  const battleFetchDone = useRef(false);
  const [battleDbStandings, setBattleDbStandings] = useState<BattlePlayerDbInfo[] | null>(null);

  useEffect(() => {
    historySaved.current = false;
    battleFetchDone.current = false;
    setBattleDbStandings(null);
  }, [id]);

  useEffect(() => {
    if (!id || userLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }

    const sessionRef = doc(db, 'game_sessions', id);
    const unsubSession = onSnapshot(sessionRef, (snap) => {
      if (!snap.exists()) {
        navigate('/game/lobby');
        return;
      }
      setSession({ id: snap.id, ...snap.data() });
      setLoading(false);
    });

    const playersRef = collection(db, 'game_sessions', id, 'players');
    const unsubPlayers = onSnapshot(playersRef, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPlayers(data);
    });

    return () => {
      unsubSession();
      unsubPlayers();
    };
  }, [id, navigate, user, userLoading]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Check if all players finished
  useEffect(() => {
    if (session?.status === 'playing' && session.created_by === user.id) {
      if (players.length > 0 && players.every(p => p.isDone)) {
        updateDoc(doc(db, 'game_sessions', session.id), { status: 'ended' });
      }
    }
  }, [players, session, user]);

  const allQuestions = lessons.flatMap(l => {
     const arr = [...l.questions];
     if (l.web3Task) {
       arr.push({
          question: `TASK: ${l.web3Task.title}. What is a required step?`,
          options: [l.web3Task.steps[1] || l.web3Task.steps[0], 'Submit your private key directly', 'Ask the bank for permission', 'Delete your wallet data'],
          correctIndex: 0,
          explanation: 'It is important to remember the procedure of on-chain tasks.'
       });
     }
     return arr;
  });

  const maxQuestions = Math.min(allQuestions.length, 5);

  // Bot Logic
  useEffect(() => {
    if (session?.mode === 'bot' && session.status === 'playing' && session.created_by === user.id) {
      const bot = players.find(p => p.user_id === 'bot_alpha');
      if (bot && !bot.isDone) {
        const timer = setTimeout(async () => {
          const isCorrect = Math.random() > 0.3; // 70% chance bot is right
          const newScore = (bot.score || 0) + (isCorrect ? 100 : 0);
          const currentQsProcessed = bot.qsProcessed ? bot.qsProcessed + 1 : 1;
          
          const botRef = doc(db, 'game_sessions', id!, 'players', 'bot_alpha');
          await updateDoc(botRef, { 
            score: newScore,
            qsProcessed: currentQsProcessed,
            isDone: currentQsProcessed >= maxQuestions 
          });
        }, 1500 + Math.random() * 2000); // 1.5 - 3.5 seconds
        return () => clearTimeout(timer);
      }
    }
  }, [session?.status, user, players, id, maxQuestions]);

  // History Logic & Prize Claims
  useEffect(() => {
    if (session?.status === 'ended' && !historySaved.current) {
      historySaved.current = true;
      const sorted = [...players].sort((a, b) => b.score - a.score);
      const winner = sorted[0];

      if (session.created_by === user.id) {
        addDoc(collection(db, 'game_history'), {
          session_id: session.id,
          mode: session.mode,
          user_ids: players.map(p => p.user_id),
          ended_at: serverTimestamp(),
          winner_id: winner?.user_id || null,
          players: players.map(p => ({ email: p.email, score: p.score, user_id: p.user_id }))
        });
      }

      if (winner?.user_id === user.id) {
         unlockAchievement(user.id, 'game-master');
         if (session.mode === 'contest' && session.prize_pool) {
            unlockAchievement(user.id, 'high-roller'); 
            const userRef = doc(db, 'users', user.id);
            getDocs(query(collection(db, 'users'), where('id', '==', user.id))).then(snap => {
               if(!snap.empty) {
                  const userData = snap.docs[0].data();
                  updateDoc(userRef, { xp: (userData.xp + session.prize_pool) });
               }
            });
         }
      }
    }
  }, [session?.status, user, players, session?.mode, session?.prize_pool]);

  useEffect(() => {
    if (session?.status !== 'ended' || !id) return;
    if (session.mode !== 'multiplayer' && session.mode !== 'contest') return;
    if (battleFetchDone.current) return;
    battleFetchDone.current = true;
    fetchBattleRoomResultsFromDb(id)
      .then(setBattleDbStandings)
      .catch((e) => console.error('Battle room DB fetch failed', e));
  }, [session?.status, session?.mode, id]);

  const handleStartGame = async () => {
    if (!session || !user || session.created_by !== user.id) return;
    
    if (session.mode !== 'bot' && session.mode !== 'solo' && players.length < 2) {
      toast.error('You need at least 2 players to start this match.');
      return;
    }

    try {
      const sessionDocRef = doc(db, 'game_sessions', session.id);
      await updateDoc(sessionDocRef, { 
        status: 'playing', 
        current_question_index: 0
      });
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  const handleSelectAnswer = async (idx: number) => {
    if (isLocked || !session || !user) return;
    setSelectedIdx(idx);
    setIsLocked(true);

    const question = allQuestions[localQuestionIndex];
    const isCorrect = idx === question.correctIndex;

    const currentPlayer = players.find(p => p.user_id === user.id);
    if (currentPlayer) {
      try {
        const playerDocRef = doc(db, 'game_sessions', session.id, 'players', user.id);
        await updateDoc(playerDocRef, { 
          score: (currentPlayer.score || 0) + (isCorrect ? 100 : 0)
        });
      } catch (error) {
        console.error('Error updating score:', error);
      }
    }
  };

  const nextLocalQuestion = async () => {
    if (!session || !user) return;
    const isDone = (localQuestionIndex + 1) >= maxQuestions;
    
    if (isDone) {
      try {
        const playerDocRef = doc(db, 'game_sessions', session.id, 'players', user.id);
        await updateDoc(playerDocRef, { isDone: true });
        setLocalQuestionIndex(localQuestionIndex + 1);
      } catch (e) {
        console.error(e);
      }
    } else {
       setSelectedIdx(undefined);
       setIsLocked(false);
       setLocalQuestionIndex(localQuestionIndex + 1);
    }
  };

  const overrideEndGame = async () => {
      const sessionDocRef = doc(db, 'game_sessions', session.id);
      await updateDoc(sessionDocRef, { status: 'ended' });
  }

  const handleLeaveMatch = () => {
    setIsLeaveModalOpen(true);
  };
  
  const confirmLeaveMatch = () => {
    navigate('/game/lobby');
  };

  if (loading || userLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-gray-300" size={48} />
    </div>
  );

  if (session?.status === 'lobby') {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center relative">
        <div className="absolute top-0 right-6">
            <Button variant="ghost" className="text-red-500 hover:bg-red-50" onClick={handleLeaveMatch}>
                <LogOut size={16} className="mr-2" /> Leave Match
            </Button>
        </div>
        
        <h1 className="text-4xl font-black mb-4 uppercase tracking-tighter">Waiting Room</h1>
        
        <ConfirmationModal
          isOpen={isLeaveModalOpen}
          onClose={() => setIsLeaveModalOpen(false)}
          onConfirm={confirmLeaveMatch}
          title="Abandon Match?"
          message="Are you sure you want to abandon the match? You may lose your stakes, progress, or pending XP!"
          confirmText="Leave Match"
        />

        <div className="inline-block px-8 py-3 bg-white border-2 border-brand-primary/20 shadow-xl shadow-indigo-100 rounded-2xl font-mono text-3xl tracking-widest mb-4">
           {session.room_code}
        </div>
        
        {session.mode === 'contest' && (
          <div className="flex items-center justify-center gap-4 mb-12">
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-lg font-bold text-sm">
              <Trophy size={16} /> Prize Pool: {session.prize_pool || 0} XP
            </div>
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg font-bold text-sm">
              <Flame size={16} /> Entry: {session.entry_fee || 0} XP
            </div>
          </div>
        )}
        {session.mode !== 'contest' && <div className="mb-12"></div>}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          {players.map(p => (
            <Card key={p.id} className="p-4 flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-indigo-50 text-brand-primary rounded-full flex items-center justify-center font-bold">
                {p.email?.[0].toUpperCase() || '?'}
              </div>
              <div className="text-sm font-bold truncate w-full">{p.email?.split('@')[0]}</div>
              {p.user_id === session.created_by && (
                <Crown size={14} className="text-yellow-500" />
              )}
            </Card>
          ))}
        </div>

        {session.created_by === user.id ? (
          <Button size="xl" className="px-12 py-8 text-xl rounded-2xl shadow-xl shadow-indigo-200" onClick={handleStartGame}>
            Start Game <ArrowRight className="ml-2" />
          </Button>
        ) : (
          <p className="text-brand-text-muted italic flex items-center justify-center gap-2">
            <Loader2 className="animate-spin" size={16} /> Starting soon... Your host will begin the game.
          </p>
        )}
      </div>
    );
  }

  if (session?.status === 'playing') {
    if (localQuestionIndex >= maxQuestions) {
        return (
          <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
            <Loader2 className="animate-spin text-brand-primary mb-6" size={48} />
            <h2 className="text-2xl font-bold mb-4">Waiting for others to finish...</h2>
            <div className="flex flex-col gap-2 max-w-sm w-full mx-auto">
               {players.sort((a,b) => b.score - a.score).map((p) => (
                  <div key={p.id} className="flex justify-between items-center p-3 bg-white rounded-lg border">
                      <span className="font-bold truncate mr-4">{p.email?.split('@')[0]}</span>
                      <span className="text-sm font-bold opacity-50 whitespace-nowrap">{p.isDone ? 'Finished' : 'Playing...'}</span>
                  </div>
               ))}
            </div>
            {session.created_by === user.id && (
                <Button className="mt-12 opacity-50 hover:opacity-100" variant="outline" onClick={overrideEndGame}>Force End Early</Button>
            )}
          </div>
        )
    }

    const question = allQuestions[localQuestionIndex];
    
    return (
      <div className="min-h-screen flex flex-col relative">
        <div className="absolute top-4 right-4 z-50">
           <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50/50 hover:text-red-600" onClick={handleLeaveMatch}>
              <LogOut size={14} className="mr-1" /> Leave
           </Button>
        </div>
        <Timer duration={20} onTimeUp={() => setIsLocked(true)} key={localQuestionIndex} />
        
        <div className="flex-1 px-6 py-12 flex flex-col items-center justify-center max-w-5xl mx-auto w-full">
           <div className="flex justify-between w-full mb-8">
              <div className="text-sm font-bold text-gray-400">QUESTION {localQuestionIndex + 1} OF {maxQuestions}</div>
              <div className="flex gap-4">
                 {players.sort((a,b) => b.score - a.score).slice(0, 3).map(p => (
                   <div key={p.id} className="flex flex-col items-end">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">{p.email?.split('@')[0]}</span>
                      <ScoreBadge score={p.score} animate={false} />
                   </div>
                 ))}
              </div>
           </div>

           <AnimatePresence mode="wait">
             <motion.div
               key={localQuestionIndex}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               className="w-full"
             >
               <QuestionCard
                 question={question.question}
                 options={question.options}
                 onSelect={handleSelectAnswer}
                 selectedIdx={selectedIdx}
                 isLocked={isLocked}
                 correctIdx={isLocked ? question.correctIndex : undefined}
               />
             </motion.div>
           </AnimatePresence>

           {isLocked && (
             <Button size="lg" className="mt-12" onClick={nextLocalQuestion}>
               {localQuestionIndex >= maxQuestions - 1 ? 'Finish' : 'Next Question'}
             </Button>
           )}
        </div>
      </div>
    );
  }

  if (session?.status === 'ended') {
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    return (
      <div className="max-w-xl mx-auto px-6 py-24 text-center pb-32">
        <h1 className="text-4xl font-black mb-12 uppercase tracking-tighter text-brand-ink">Final Standings</h1>
        
        {session.mode === 'contest' && sortedPlayers[0]?.user_id === user.id && (
           <div className="mb-12 inline-flex flex-col items-center bg-gradient-to-br from-amber-100 to-yellow-50 border border-yellow-200 p-8 rounded-3xl shadow-2xl shadow-yellow-200/50 transform rotate-1 scale-105">
              <Sparkles className="text-yellow-500 mb-2" size={32} />
              <div className="font-bold text-amber-800 uppercase tracking-widest text-sm mb-1">Contest Winner</div>
              <div className="text-3xl font-black text-amber-600">+{session.prize_pool} XP</div>
           </div>
        )}

        <div className="space-y-4 mb-16">
          {sortedPlayers.map((p, idx) => (
            <Card key={p.id} className={cn("p-6 flex items-center justify-between", idx === 0 ? "border-brand-primary shadow-lg shadow-indigo-100" : "")}>
              <div className="flex items-center gap-4">
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg", 
                  idx === 0 ? "bg-yellow-100 text-yellow-600" : 
                  idx === 1 ? "bg-gray-100 text-gray-600" : 
                  idx === 2 ? "bg-amber-100 text-amber-700" : "bg-slate-50 text-slate-400"
                )}>
                  {idx + 1}
                </div>
                <div className="font-bold text-brand-ink">{p.email?.split('@')[0]}</div>
              </div>
              <ScoreBadge score={p.score} animate={idx === 0} />
            </Card>
          ))}
        </div>

        {battleDbStandings && battleDbStandings.length > 0 && (session.mode === 'multiplayer' || session.mode === 'contest') && (
          <div className="mb-12 text-left rounded-2xl border border-slate-200 bg-slate-50/80 p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Firestore snapshot (username · score · rank)</p>
            <ul className="space-y-2 text-sm text-brand-ink">
              {battleDbStandings.map((row) => (
                <li key={`${row.rank}-${row.username}`} className="flex justify-between gap-4">
                  <span className="font-semibold">#{row.rank} {row.username}</span>
                  <span className="text-brand-text-muted">{row.score} pts</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button size="xl" className="px-12 py-6 text-lg" onClick={() => navigate('/game/lobby')}>
          Return to Arena
        </Button>
      </div>
    );
  }

  return null;
}
