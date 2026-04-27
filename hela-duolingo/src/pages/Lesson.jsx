import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Hash, Sparkles, Brain, Trophy, Coins, ArrowRight } from 'lucide-react';
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';
import confetti from 'canvas-confetti';
import { lessons } from '../data/lessons';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import Quiz from '../components/Quiz';
import { useProgress } from '../hooks/useProgress';
import { useAdaptiveLearning } from '../hooks/useAdaptiveLearning';

const Lesson = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { address } = useAccount();
  const { markLessonCompleted, addXp, awardBadge } = useProgress();
  const { recordError, recordSuccess, profile } = useAdaptiveLearning();
  
  const lesson = lessons.find(l => l.id === id);
  
  const [mode, setMode] = useState('tasks'); // tasks, quiz, earn, finished
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [txHash, setTxHash] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const [showAIHint, setShowAIHint] = useState(false);
  
  if (!lesson) return <div>Lesson not found</div>;

  const currentTask = lesson.tasks[currentTaskIndex];
  
  // Progress calculation: Tasks -> Quiz -> Earn
  const totalStages = lesson.tasks.length + 2; 
  const currentStage = mode === 'tasks' ? currentTaskIndex + 1 : mode === 'quiz' ? lesson.tasks.length + 1 : totalStages;
  const progress = (currentStage / totalStages) * 100;

  const verifyOnHela = async () => {
    if (!txHash.startsWith('0x') || txHash.length !== 66) {
      setErrorMessage('Invalid Hela transaction hash');
      setStatus('error');
      recordError();
      setShowAIHint(true);
      return;
    }

    if (!address) {
      setErrorMessage('Connect Hela wallet first');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const provider = new ethers.JsonRpcProvider('https://testnet-rpc.helachain.com');
      const tx = await provider.getTransaction(txHash);

      if (!tx) throw new Error('TX not found on Hela Testnet');
      if (tx.from.toLowerCase() !== address.toLowerCase()) {
        throw new Error('Transaction must be from your wallet');
      }

      addXp(25);
      recordSuccess();
      setStatus('success');
      setShowAIHint(false);
      
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#58CC02', '#1CB0F6', '#FFC800']
      });
    } catch (err) {
      setErrorMessage(err.message || 'Verification failed');
      setStatus('error');
      recordError();
      setShowAIHint(true);
    }
  };

  const handleNextTask = () => {
    if (currentTaskIndex < lesson.tasks.length - 1) {
      setCurrentTaskIndex(prev => prev + 1);
      setTxHash('');
      setStatus('idle');
    } else {
      setMode('quiz');
    }
  };

  const handleQuizFinish = (score) => {
    addXp(score * 20);
    setMode('earn');
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 }
    });
  };

  const handleClaimReward = () => {
    markLessonCompleted(lesson.id);
    awardBadge(lesson.earn.badge);
    setMode('finished');
    confetti({
      particleCount: 300,
      spread: 200,
      origin: { y: 0.5 }
    });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="px-6 py-8 flex items-center gap-6 max-w-4xl mx-auto w-full">
        <button onClick={() => navigate('/dashboard')} className="text-duo-hare hover:text-duo-eel transition-colors">
          <X className="w-8 h-8" />
        </button>
        <ProgressBar progress={progress} color={lesson.progressColor} />
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 max-w-xl mx-auto w-full pb-32">
        <AnimatePresence mode="wait">
          {mode === 'tasks' && (
            <motion.div
              key={currentTask.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Brain className="text-duo-blue w-5 h-5" />
                  <span className="text-xs font-black text-duo-blue uppercase tracking-widest">
                    AI Level: {profile.level}
                  </span>
                </div>
                <span className="text-xs font-black text-duo-hare uppercase tracking-widest">Task {currentTaskIndex + 1}/{lesson.tasks.length}</span>
              </div>

              <h2 className="text-3xl font-black text-duo-eel mb-6">{currentTask.title}</h2>
              
              <div className="bg-duo-swan/20 border-2 border-duo-swan rounded-3xl p-8 mb-8 relative">
                <p className="text-xl font-bold text-duo-wolf mb-8">
                  {currentTask.description}
                </p>
                
                {currentTask.type === 'info' && (
                  <div className="p-4 bg-white border-2 border-duo-swan rounded-2xl italic text-duo-eel font-bold">
                    "{currentTask.learnContent}"
                  </div>
                )}

                {currentTask.type === 'interaction' && (
                  <div className="space-y-4">
                    <div className="relative">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-duo-hare w-5 h-5" />
                      <input 
                        type="text"
                        placeholder="Hela Tx Hash (0x...)"
                        value={txHash}
                        onChange={(e) => setTxHash(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white border-2 border-duo-swan rounded-2xl font-bold text-duo-eel outline-none focus:border-duo-blue"
                      />
                    </div>
                  </div>
                )}

                {showAIHint && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-duo-yellow/10 border-2 border-duo-yellow rounded-2xl flex gap-3"
                  >
                    <Sparkles className="text-duo-yellow w-5 h-5 shrink-0" />
                    <p className="text-sm font-bold text-duo-yellow-dark">
                      <span className="uppercase block text-[10px] mb-1">AI Mentor {profile.hintVerbosity}</span>
                      {profile.aiComment}
                    </p>
                  </motion.div>
                )}
              </div>

              {status === 'success' && (
                <div className="flex items-center gap-4 p-4 bg-duo-green/10 border-2 border-duo-green rounded-2xl mb-8">
                  <CheckCircle2 className="text-duo-green w-8 h-8" />
                  <span className="text-duo-green-dark font-black text-lg">Hela Verified! +25 XP</span>
                </div>
              )}
            </motion.div>
          )}

          {mode === 'quiz' && (
            <motion.div key="quiz" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
              <span className="text-sm font-black text-duo-green uppercase tracking-widest mb-4 block text-center">Knowledge Mastery</span>
              <Quiz 
                questions={lesson.quiz} 
                onCorrect={recordSuccess}
                onWrong={recordError}
                onFinish={handleQuizFinish} 
              />
            </motion.div>
          )}

          {mode === 'earn' && (
            <motion.div key="earn" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center w-full">
              <div className="w-24 h-24 bg-duo-yellow rounded-3xl mx-auto mb-8 flex items-center justify-center border-b-8 border-duo-yellow-dark">
                <Trophy className="text-white w-12 h-12" />
              </div>
              <h2 className="text-4xl font-black text-duo-eel mb-4">You've Earned!</h2>
              <div className="space-y-4 mb-12">
                <div className="bg-white border-2 border-duo-swan p-6 rounded-3xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-duo-blue/10 rounded-xl flex items-center justify-center">
                      <Award className="text-duo-blue w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-black text-duo-hare uppercase">Badge</p>
                      <p className="text-lg font-black text-duo-eel">{lesson.earn.badge}</p>
                    </div>
                  </div>
                  <CheckCircle2 className="text-duo-green w-6 h-6" />
                </div>
                <div className="bg-white border-2 border-duo-swan p-6 rounded-3xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-duo-yellow/10 rounded-xl flex items-center justify-center">
                      <Coins className="text-duo-yellow w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-black text-duo-hare uppercase">Bonus</p>
                      <p className="text-lg font-black text-duo-eel">{lesson.earn.xp} XP Points</p>
                    </div>
                  </div>
                  <CheckCircle2 className="text-duo-green w-6 h-6" />
                </div>
              </div>
              <Button size="lg" className="w-full" onClick={handleClaimReward}>
                Claim & Complete <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          )}

          {mode === 'finished' && (
            <motion.div key="finished" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
              <div className="w-32 h-32 bg-duo-green rounded-full mx-auto mb-8 flex items-center justify-center border-b-8 border-duo-green-dark">
                <Sparkles className="text-white w-16 h-16" />
              </div>
              <h2 className="text-4xl font-black text-duo-eel mb-4 tracking-tight">Mission Accomplished</h2>
              <p className="text-xl font-bold text-duo-wolf mb-12">Next stop: More Hela rewards!</p>
              <Button size="lg" onClick={() => navigate('/dashboard')}>
                Explore Roadmap
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer (Tasks only) */}
      {mode === 'tasks' && (
        <footer className="border-t-2 border-duo-swan p-6 md:p-10 flex justify-center bg-white sticky bottom-0">
          <div className="max-w-xl w-full flex gap-4">
            {status !== 'success' ? (
              <Button 
                size="full" 
                onClick={currentTask.type === 'interaction' ? verifyOnHela : () => setStatus('success')}
                disabled={status === 'loading'}
              >
                {status === 'loading' ? 'Verifying Hela...' : currentTask.actionLabel || 'Check'}
              </Button>
            ) : (
              <Button size="full" onClick={handleNextTask}>
                Continue
              </Button>
            )}
          </div>
        </footer>
      )}
    </div>
  );
};

export default Lesson;
