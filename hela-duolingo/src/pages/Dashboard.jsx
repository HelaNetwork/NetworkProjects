import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, CheckCircle, Award, Flame, Brain } from 'lucide-react';
import { lessons } from '../data/lessons';
import LessonCard from '../components/LessonCard';
import { useProgress } from '../hooks/useProgress';

const Dashboard = () => {
  const navigate = useNavigate();
  const { xp, level, streak, badges, completedLessons } = useProgress();

  const handleStartLesson = (lesson) => {
    navigate(`/lesson/${lesson.id}`);
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-32 px-6 md:px-20 lg:px-40">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div>
            <h1 className="text-4xl font-black text-duo-eel mb-2 tracking-tight">Learning Path</h1>
            <div className="flex items-center gap-3">
              <div className="w-16 h-2 bg-duo-blue rounded-full" />
              <span className={`text-sm font-black uppercase tracking-widest ${level.color}`}>{level.name} Student</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            {/* XP Card */}
            <div className="bg-duo-swan/20 p-5 rounded-3xl border-2 border-duo-swan flex items-center gap-4 min-w-[180px]">
              <div className="w-12 h-12 bg-duo-yellow rounded-2xl flex items-center justify-center border-b-4 border-duo-yellow-dark">
                <Zap className="text-white w-7 h-7 fill-white" />
              </div>
              <div>
                <span className="text-[10px] font-black text-duo-hare uppercase tracking-widest">Total XP</span>
                <p className="text-2xl font-black text-duo-eel">{xp}</p>
              </div>
            </div>

            {/* Streak Card */}
            <div className="bg-duo-swan/20 p-5 rounded-3xl border-2 border-duo-swan flex items-center gap-4 min-w-[180px]">
              <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center border-b-4 border-orange-700">
                <Flame className="text-white w-7 h-7 fill-white" />
              </div>
              <div>
                <span className="text-[10px] font-black text-duo-hare uppercase tracking-widest">Day Streak</span>
                <p className="text-2xl font-black text-duo-eel">{streak}</p>
              </div>
            </div>

            {/* AI Status */}
            <div className="bg-duo-swan/20 p-5 rounded-3xl border-2 border-duo-swan flex items-center gap-4 min-w-[180px]">
              <div className="w-12 h-12 bg-duo-blue rounded-2xl flex items-center justify-center border-b-4 border-duo-blue-dark">
                <Brain className="text-white w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-black text-duo-hare uppercase tracking-widest">AI Profile</span>
                <p className="text-2xl font-black text-duo-eel">Active</p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-16">
            <section>
              <h2 className="text-sm font-black text-duo-hare uppercase tracking-widest mb-6 border-b-2 border-duo-swan pb-2">Unit 1: Foundations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {lessons.map(lesson => (
                  <div key={lesson.id} className="relative">
                    {completedLessons.includes(lesson.id) && (
                      <motion.div 
                        initial={{ scale: 0 }} 
                        animate={{ scale: 1 }}
                        className="absolute -top-3 -right-3 z-10 bg-duo-green text-white p-2 rounded-full border-b-4 border-duo-green-dark shadow-lg"
                      >
                        <CheckCircle className="w-6 h-6" />
                      </motion.div>
                    )}
                    <LessonCard 
                      lesson={{ ...lesson, progress: completedLessons.includes(lesson.id) ? 100 : lesson.progress }} 
                      onStart={handleStartLesson} 
                    />
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Badges Section */}
            <div className="border-2 border-duo-swan rounded-3xl p-6">
              <h3 className="text-xl font-black text-duo-eel mb-4 flex items-center gap-2">
                <Award className="text-duo-yellow w-6 h-6" />
                Achievements
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
                  const isUnlocked = badges.length >= i;
                  return (
                    <div 
                      key={i} 
                      className={`aspect-square rounded-xl border-b-4 flex items-center justify-center transition-all ${
                        isUnlocked 
                          ? 'bg-duo-yellow/20 border-duo-yellow-dark text-duo-yellow-dark' 
                          : 'bg-duo-swan/30 border-duo-swan text-duo-hare opacity-50'
                      }`}
                      title={isUnlocked ? `Achievement ${i} Unlocked` : 'Locked'}
                    >
                      <Award className="w-6 h-6" />
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 text-xs font-bold text-duo-hare text-center uppercase tracking-widest">
                {badges.length} of 8 Badges Earned
              </p>
            </div>

            {/* AI Insights Sidebar */}
            <div className="bg-duo-blue/5 border-2 border-duo-blue/20 rounded-3xl p-6">
              <h3 className="text-lg font-black text-duo-blue-dark mb-3 flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI Learning Tips
              </h3>
              <p className="text-sm font-bold text-duo-wolf italic">
                "Based on your recent activity, try focusing on DeFi liquidity concepts next. You're doing great with NFTs!"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
