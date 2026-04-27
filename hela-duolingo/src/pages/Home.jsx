import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Zap, Trophy, Repeat, Image as ImageIcon } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAccount } from 'wagmi';

const Home = () => {
  const navigate = useNavigate();
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20 bg-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-3xl"
      >
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 bg-duo-green rounded-3xl flex items-center justify-center border-b-[8px] border-duo-green-dark shadow-lg">
              <GraduationCap className="text-white w-14 h-14" />
            </div>
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute -top-4 -right-4 w-12 h-12 bg-duo-yellow rounded-2xl flex items-center justify-center border-b-4 border-duo-yellow-dark shadow-md"
            >
              <Zap className="text-white w-6 h-6 fill-white" />
            </motion.div>
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-duo-green mb-4 tracking-tighter">
          CryptoDuo
        </h1>
        <p className="text-2xl md:text-3xl font-bold text-duo-wolf mb-4">
          Learn → Do → Earn on Hela Chain
        </p>
        <p className="text-lg font-bold text-duo-hare mb-12 max-w-lg mx-auto">
          Master Crypto Basics, DeFi, and NFTs through fun, bite-sized tasks with real on-chain proofs.
        </p>

        <div className="flex flex-col gap-4 w-full max-w-xs mx-auto mb-20">
          <Button size="lg" onClick={() => navigate('/dashboard')}>
            {isConnected ? 'Continue Path' : 'Get Started'}
          </Button>
          {!isConnected && (
            <p className="text-[10px] font-black text-duo-hare uppercase tracking-widest mt-2">
              Connect to Hela Testnet to claim rewards
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-left border-t-2 border-duo-swan pt-12">
          <div className="flex flex-col gap-3">
            <div className="p-3 bg-duo-blue/10 rounded-2xl w-fit">
              <Repeat className="text-duo-blue w-6 h-6" />
            </div>
            <h3 className="font-black text-duo-eel text-xl tracking-tight">Learn</h3>
            <p className="text-duo-wolf text-sm font-bold leading-relaxed">Quick lessons on crypto fundamentals, DeFi protocols, and NFT standards.</p>
          </div>
          <div className="flex flex-col gap-3">
            <div className="p-3 bg-duo-green/10 rounded-2xl w-fit">
              <Zap className="text-duo-green w-6 h-6" />
            </div>
            <h3 className="font-black text-duo-eel text-xl tracking-tight">Do</h3>
            <p className="text-duo-wolf text-sm font-bold leading-relaxed">Submit real transaction hashes to prove task completion on Hela Chain.</p>
          </div>
          <div className="flex flex-col gap-3">
            <div className="p-3 bg-duo-yellow/10 rounded-2xl w-fit">
              <Trophy className="text-duo-yellow w-6 h-6" />
            </div>
            <h3 className="font-black text-duo-eel text-xl tracking-tight">Earn</h3>
            <p className="text-duo-wolf text-sm font-bold leading-relaxed">Win XP, unlock on-chain badges, and build your digital identity.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
