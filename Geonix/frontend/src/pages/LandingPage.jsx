import React, { useState, useEffect } from 'react';
import { ArrowRight, Zap, Shield, Clock, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function LandingPage() {
  const [hoveredLetter, setHoveredLetter] = useState(null);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  const springConfig = { damping: 20, stiffness: 150, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const titleLine1 = 'PAY';
  const titleLine2 = 'STREAM';

  return (
    <div className="min-h-screen bg-[#0a0a0f] cursor-none">
      {/* ORANGE LIQUID GLASS CURSOR */}
      <motion.div
        className="fixed pointer-events-none z-50"
        style={{ x: smoothX, y: smoothY, translateX: '-50%', translateY: '-50%' }}
      >
        <div
          className="absolute rounded-full"
          style={{
            width: hoveredLetter !== null ? '350px' : '250px',
            height: hoveredLetter !== null ? '350px' : '250px',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(249, 115, 22, 0.15) 0%, transparent 70%)',
            filter: 'blur(30px)',
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
        <div
          className="relative rounded-full"
          style={{
            width: hoveredLetter !== null ? '180px' : '120px',
            height: hoveredLetter !== null ? '180px' : '120px',
            background: `radial-gradient(circle at 40% 40%, rgba(249,115,22,${hoveredLetter !== null ? '0.5' : '0.35'}) 0%, rgba(249,115,22,${hoveredLetter !== null ? '0.25' : '0.15'}) 40%, rgba(249,115,22,0.05) 70%, transparent 100%)`,
            filter: `blur(${hoveredLetter !== null ? '15px' : '20px'})`,
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: hoveredLetter !== null ? '0 0 60px rgba(249,115,22,0.4), inset 0 0 30px rgba(249,115,22,0.2)' : '0 0 40px rgba(249,115,22,0.2)',
          }}
        />
        <div className="absolute rounded-full" style={{ width: '8px', height: '8px', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#F97316', boxShadow: '0 0 10px #F97316, 0 0 20px rgba(249,115,22,0.5)' }} />
      </motion.div>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden px-6 py-24">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full blur-[150px] pointer-events-none opacity-20" style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.5) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[150px] pointer-events-none opacity-20" style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.5) 0%, transparent 70%)' }} />

        <div className="relative z-10 w-full max-w-7xl mx-auto">
          <motion.div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs mb-12" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af' }} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#4ade80', boxShadow: '0 0 10px #4ade80' }} />
            Built on HeLa Network
          </motion.div>

          {/* TITLE - PER LETTER HOVER */}
          <motion.div className="mb-10" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}>
            <h1 className="text-7xl md:text-8xl lg:text-9xl font-bold leading-[0.9] tracking-tight cursor-none">
              {titleLine1.split('').map((char, i) => (
                <span
                  key={`l1-${i}`}
                  className="inline-block transition-all duration-200"
                  onMouseEnter={() => setHoveredLetter(`l1-${i}`)}
                  onMouseLeave={() => setHoveredLetter(null)}
                  style={{
                    color: hoveredLetter === `l1-${i}` ? '#F97316' : '#ffffff',
                    textShadow: hoveredLetter === `l1-${i}` ? '0 0 40px rgba(249,115,22,0.8), 0 0 80px rgba(249,115,22,0.4)' : 'none',
                    transform: hoveredLetter === `l1-${i}` ? 'translateY(-5px) scale(1.1)' : 'translateY(0) scale(1)',
                  }}
                >
                  {char}
                </span>
              ))}
              <br />
              {titleLine2.split('').map((char, i) => (
                <span
                  key={`l2-${i}`}
                  className="inline-block transition-all duration-200"
                  onMouseEnter={() => setHoveredLetter(`l2-${i}`)}
                  onMouseLeave={() => setHoveredLetter(null)}
                  style={{
                    color: hoveredLetter === `l2-${i}` ? '#F97316' : '#ffffff',
                    textShadow: hoveredLetter === `l2-${i}` ? '0 0 40px rgba(249,115,22,0.8), 0 0 80px rgba(249,115,22,0.4)' : 'none',
                    transform: hoveredLetter === `l2-${i}` ? 'translateY(-5px) scale(1.1)' : 'translateY(0) scale(1)',
                  }}
                >
                  {char}
                </span>
              ))}
            </h1>
          </motion.div>

          {/* SUBTITLE - per word hover */}
          <motion.p className="text-xl md:text-2xl max-w-2xl leading-relaxed cursor-none text-gray-500 mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }}>
            Real-time salary streaming on the <span className="text-purple-300 font-semibold">HeLa Network</span>. Pay your team <span className="text-orange-300 font-semibold">every second</span>.
          </motion.p>

          {/* SINGLE LOGIN BUTTON */}
          <motion.div className="flex gap-4 mb-20" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.6 }}>
            <Link
              to="/login"
              className="group inline-flex items-center justify-center gap-3 px-10 py-5 rounded-2xl text-xl font-semibold text-white transition-all hover:scale-105 cursor-none"
              style={{ background: 'linear-gradient(135deg, #F97316, #EA580C)', boxShadow: '0 10px 40px rgba(249,115,22,0.3)' }}
            >
              Get Started
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={24} />
            </Link>
          </motion.div>

          {/* STATS */}
          <motion.div className="flex flex-wrap gap-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.6 }}>
            {[
              { label: 'GAS COST', value: '<$0.001', color: '#FB923C' },
              { label: 'STREAMING', value: 'Per Second', color: '#C084FC' },
              { label: 'NETWORK', value: 'HeLa', color: '#FB923C' },
              { label: 'CURRENCY', value: 'HLUSD', color: '#C084FC' },
            ].map((stat, i) => (
              <div key={i} className="cursor-none">
                <div className="text-3xl font-bold font-mono" style={{ color: stat.color }}>{stat.value}</div>
                <div className="text-xs text-gray-600 mt-1 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.h2 className="text-5xl md:text-7xl font-bold text-center mb-20 cursor-none text-white" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            Why PayStream?
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { icon: <Clock size={32} />, title: 'Second-by-Second Pay', desc: 'Employees earn salary every second. Real-time streaming powered by HeLa.', color: '#F97316', id: 'f1' },
              { icon: <DollarSign size={32} />, title: 'HLUSD Gas Efficiency', desc: "Ultra-low transaction fees using HeLa's stablecoin-native gas.", color: '#A855F7', id: 'f2' },
              { icon: <Shield size={32} />, title: 'Secure Access Control', desc: 'Role-based permissions. Only HR/Admin creates streams.', color: '#F97316', id: 'f3' },
              { icon: <Zap size={32} />, title: 'Auto Tax Compliance', desc: 'Built-in tax withholding routes deductions automatically.', color: '#A855F7', id: 'f4' },
            ].map((f, i) => (
              <motion.div key={i} className="p-8 rounded-3xl cursor-none transition-all duration-400 hover:-translate-y-2" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.6 }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-white" style={{ background: `linear-gradient(135deg, ${f.color}, ${f.color}dd)` }}>{f.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-3">{f.title}</h3>
                <p className="text-gray-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 py-8 px-6 text-center text-gray-600 text-sm">
        PayStream © 2026 — Built on <span className="text-purple-400">HeLa Network</span>
      </footer>
    </div>
  );
}