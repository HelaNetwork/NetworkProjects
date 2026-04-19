import { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import { ReactLenis } from 'lenis/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Send, Server, Lock, Copy, Check, Linkedin, Mail, Shield, Zap, Key } from 'lucide-react';
import BlurText from './components/BlurText';
import LogoWall, { type LogoItem } from './components/LogoWall';
import ClickSpark from './components/ClickSpark';
import LetterGlitch from './components/LetterGlitch';
import Ribbons from './components/Ribbons';
import Waves from './components/Waves';
import PillNav from './components/PillNav';
import Peer from 'peerjs';

const DottedGrid = ({ rows = 5, cols = 5, color = '#cbd5e1', opacity = 0.5 }: { rows?: number, cols?: number, color?: string, opacity?: number }) => (
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 8px)`, gap: '8px', opacity }}>
    {Array.from({ length: rows * cols }).map((_, i) => (
      <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: color }} />
    ))}
  </div>
);

const logoItems: LogoItem[] = [
  { imgUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg', altText: 'React' },
  { imgUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg', altText: 'GitHub' },
  { imgUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg', altText: 'Docker' },
  { imgUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-original-wordmark.svg', altText: 'AWS' },
  { imgUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg', altText: 'Tailwind' },
  { imgUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg', altText: 'Node.js' },
  { imgUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/supabase/supabase-original.svg', altText: 'Supabase' }
];

// --- Type Definitions ---
interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  isMyMessage: boolean;
  isEncrypted?: boolean;
  isSystemMessage?: boolean;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

// ============================================================
// LANDING PAGE COMPONENT (Matrix.org-inspired)
// ============================================================
function LandingPage({ onConnectWallet, onDemoLogin }: { onConnectWallet: () => void; onDemoLogin: () => void }) {
  return (
    <div className="min-h-screen w-full bg-black overflow-x-hidden">
      <ClickSpark
        sparkColor="#00D4FF"
        sparkSize={12}
        sparkRadius={20}
        sparkCount={8}
        duration={0.6}
      />
      {/* ===== NAVBAR ===== */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <PillNav items={['Home', 'Features', 'About Us']} />
        </div>
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section id="home" style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '120px 40px 80px', position: 'relative', background: 'black', overflow: 'hidden'
      }}>
        {/* Animated black waves background */}
        <Waves
          lineColor="rgba(255, 255, 255, 0.12)"
          backgroundColor="transparent"
          waveSpeedX={0.012}
          waveSpeedY={0.008}
          waveAmpX={40}
          waveAmpY={50}
          xGap={12}
          yGap={32}
          friction={0.925}
          tension={0.012}
          maxCursorMove={120}
          style={{ zIndex: 1 }}
        />

        {/* Title */}
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(36px, 6vw, 72px)',
          color: 'white', lineHeight: 1.1, marginBottom: 24, letterSpacing: '-2px', maxWidth: 800, position: 'relative', zIndex: 10
        }}>
          Zero-Trust<br />Messenger
        </h1>

        {/* Animated Tagline */}
        <div style={{ position: 'relative', zIndex: 10 }}>
          <BlurText
            text="An open network for secure, decentralised communication"
            className="text-lg md:text-xl lg:text-2xl"
            delay={80}
            animateBy="words"
            direction="bottom"
          />
        </div>

        {/* Floating Background Effects */}
        <Ribbons color="#4F46E5" speed={0.5} opacity={0.6} />

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: 16, marginTop: 48, flexWrap: 'wrap', justifyContent: 'center', position: 'relative', zIndex: 10 }}>
          <button onClick={onConnectWallet} className="pill-btn pill-btn-primary">
            <Wallet size={20} />
            Connect Wallet
          </button>
          <button onClick={onDemoLogin} className="pill-btn pill-btn-outline">
            Enter Demo Mode
          </button>
        </div>

        <p style={{ color: '#64748B', fontSize: 13, marginTop: 24, position: 'relative', zIndex: 1, marginBottom: 80 }}>
          No central database. No email. No passwords.
        </p>

        {/* Logo Loop */}
        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 1000, marginTop: 'auto', paddingBottom: 20 }}>
          <LogoWall
            items={logoItems}
            direction="horizontal"
            pauseOnHover={true}
            size="clamp(2rem, 1rem + 6vmin, 3.5rem)"
            duration="30s"
            bgColor="transparent"
          />
        </div>
      </section>

      {/* ===== LAYERED CURVE SEPARATOR (Dark → Light) ===== */}
      <div style={{ position: 'relative', marginTop: -1 }}>
        <svg width="100%" height="120" viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ display: 'block' }}>
          {/* Background fill */}
          <rect width="1440" height="120" fill="#F6F7F9" />
          {/* Layered arcs from dark to light */}
          <path d="M0,0 L1440,0 L1440,20 Q720,120 0,20 Z" fill="#000000" />
          <path d="M0,0 L1440,0 L1440,24 Q720,118 0,24 Z" fill="#1a1a1a" />
          <path d="M0,0 L1440,0 L1440,28 Q720,116 0,28 Z" fill="#2a2a2a" />
          <path d="M0,0 L1440,0 L1440,32 Q720,114 0,32 Z" fill="#3a3a3a" />
          <path d="M0,0 L1440,0 L1440,35 Q720,112 0,35 Z" fill="#4a4a4a" />
          <path d="M0,0 L1440,0 L1440,38 Q720,110 0,38 Z" fill="#5a5a5a" />
          <path d="M0,0 L1440,0 L1440,41 Q720,108 0,41 Z" fill="#777" />
          <path d="M0,0 L1440,0 L1440,43 Q720,106 0,43 Z" fill="#999" />
          <path d="M0,0 L1440,0 L1440,45 Q720,104 0,45 Z" fill="#bbb" />
          <path d="M0,0 L1440,0 L1440,47 Q720,102 0,47 Z" fill="#ddd" />
          <path d="M0,0 L1440,0 L1440,49 Q720,100 0,49 Z" fill="#eee" />
        </svg>
      </div>

      {/* ===== FEATURES SECTION (Light) ===== */}
      <section id="features" className="landing-section landing-section-light" style={{ position: 'relative', overflow: 'hidden', padding: '40px 20px 120px' }}>
        {/* Background Waves */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <svg width="100%" height="100%" viewBox="0 0 1440 600" preserveAspectRatio="none">
            <path d="M-50 200 Q200 150 400 220 T800 190 T1200 240 T1490 180" fill="none" stroke="#e2e8f0" strokeWidth="2" />
            <path d="M-50 240 Q200 190 400 260 T800 230 T1200 280 T1490 220" fill="none" stroke="#e2e8f0" strokeWidth="1.5" />
            <path d="M-50 280 Q200 230 400 300 T800 270 T1200 320 T1490 260" fill="none" stroke="#e2e8f0" strokeWidth="1" />
            <path d="M-50 320 Q200 270 400 340 T800 310 T1200 360 T1490 300" fill="none" stroke="#e2e8f0" strokeWidth="2" />
            <path d="M-50 360 Q200 310 400 380 T800 350 T1200 400 T1490 340" fill="none" stroke="#e2e8f0" strokeWidth="1.5" />
          </svg>
        </div>

        <div className="section-container" style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center', position: 'relative', zIndex: 10 }}>

          {/* Left Column: Heading & CTAs */}
          <div style={{ paddingRight: 40 }}>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(36px, 5vw, 56px)',
              color: '#000000', marginBottom: 32, letterSpacing: '-1.5px', lineHeight: 1.15
            }}>
              Chat with friends,<br />family<br />and co-workers
            </h2>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <button onClick={onDemoLogin} className="pill-btn pill-btn-dark" style={{ padding: '16px 36px', fontSize: 18 }}>
                Start a conversation
              </button>
              <button
                onClick={() => document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' })}
                className="pill-btn pill-btn-outline"
                style={{ padding: '16px 36px', fontSize: 18, color: '#000', borderColor: '#000' }}
              >
                Support us
              </button>
            </div>
          </div>

          {/* Right Column: Chat Mockup */}
          <div style={{ position: 'relative', width: '100%', height: 480, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>

            {/* Light Gray Container Background */}
            <div style={{
              position: 'absolute', top: 40, right: 20, width: '85%', height: 380,
              background: 'linear-gradient(to bottom, #f8fafc, #e2e8f0)', borderRadius: 24, zIndex: 0
            }} />

            {/* Dot Grid Pattern Bottom Right */}
            <div style={{
              position: 'absolute', bottom: 20, right: -10, zIndex: 2
            }}>
              <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                <pattern id="dotGrid" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="3" fill="#000000" />
                </pattern>
                <rect width="120" height="120" fill="url(#dotGrid)" />
              </svg>
            </div>

            {/* Chat Bubbles Container */}
            <div style={{ position: 'relative', zIndex: 5, width: '90%', maxWidth: 450, display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* Outgoing Message 1 (Top Right) */}
              <div style={{ display: 'flex', gap: 16, alignSelf: 'flex-end', alignItems: 'center' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#cbd5e1', flexShrink: 0 }} />
                <div style={{
                  background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px 24px 24px 8px',
                  padding: '20px 24px', maxWidth: 280, boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
                }}>
                  <p style={{ color: '#0f172a', fontSize: 15, lineHeight: 1.5, fontWeight: 500 }}>
                    Hey there, do you want me to grab drinks or snacks on my way?
                  </p>
                </div>
              </div>

              {/* Incoming Message (Middle Left) */}
              <div style={{ display: 'flex', gap: 16, alignSelf: 'flex-start', alignItems: 'center' }}>
                <div style={{
                  background: '#000000', borderRadius: '24px 24px 24px 8px',
                  padding: '20px 24px', maxWidth: 300, boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                }}>
                  <p style={{ color: '#ffffff', fontSize: 15, lineHeight: 1.5, fontWeight: 500 }}>
                    Hi, I've got plenty to eat, but if the store is still open could someone grab some soda?
                  </p>
                </div>
                <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#e2e8f0', flexShrink: 0 }} />
              </div>

              {/* Outgoing Message 2 (Bottom Right) */}
              <div style={{ display: 'flex', gap: 16, alignSelf: 'flex-end', alignItems: 'center' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#cbd5e1', flexShrink: 0 }} />
                <div style={{
                  background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px 24px 24px 8px',
                  padding: '16px 24px', maxWidth: 240, boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
                }}>
                  <p style={{ color: '#0f172a', fontSize: 15, lineHeight: 1.5, fontWeight: 500 }}>
                    Sure, will do!
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ===== WAVE SEPARATOR (Light → Dark) ===== */}
      <div className="wave-separator" style={{ background: '#F6F7F9' }}>
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none">
          <path d="M0,0 C360,60 1080,60 1440,0 L1440,60 L0,60 Z" fill="#000000" />
        </svg>
      </div>

      {/* ===== FEATURES & WORKING SECTION (Black) ===== */}
      <section id="how-it-works" style={{ backgroundColor: '#000000', color: '#ffffff', position: 'relative', overflow: 'hidden', padding: '100px 20px' }}>
        {/* Animated White Waves Background */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.1, pointerEvents: 'none', zIndex: 0 }}>
          <Waves
            lineColor="#ffffff"
            backgroundColor="transparent"
            waveSpeedX={0.01}
            waveSpeedY={0.005}
            waveAmpX={30}
            waveAmpY={15}
            friction={0.9}
            tension={0.01}
            maxCursorMove={100}
            xGap={15}
            yGap={15}
          />
        </div>

        <div className="section-container" style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 10 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(32px, 4vw, 48px)', textAlign: 'center', marginBottom: 60, letterSpacing: '-1px' }}>
            Features & Working
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 40, marginBottom: 80 }}>
            {/* Feature Cards */}
            <div style={{ background: '#0a0a0a', padding: 32, borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 40px rgba(0,0,0,0.5)' }}>
              <div style={{ width: 80, height: 80, borderRadius: 20, background: '#ffffff', color: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, boxShadow: '0 8px 30px rgba(255,255,255,0.1)' }}>
                <Shield size={40} />
              </div>
              <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12, fontFamily: 'var(--font-display)' }}>Zero-Trust Security</h3>
              <p style={{ color: '#aaa', lineHeight: 1.6, fontSize: 16 }}>Every message is encrypted end-to-end. There is no central database, meaning your conversations are never stored anywhere—not even by us.</p>
            </div>
            <div style={{ background: '#0a0a0a', padding: 32, borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 40px rgba(0,0,0,0.5)' }}>
              <div style={{ width: 80, height: 80, borderRadius: 20, background: '#ffffff', color: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, boxShadow: '0 8px 30px rgba(255,255,255,0.1)' }}>
                <Key size={40} />
              </div>
              <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12, fontFamily: 'var(--font-display)' }}>Wallet Auth</h3>
              <p style={{ color: '#aaa', lineHeight: 1.6, fontSize: 16 }}>No passwords. No emails. Authenticate anonymously using your decentralized Web3 wallet address to establish trust seamlessly.</p>
            </div>
            <div style={{ background: '#0a0a0a', padding: 32, borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 40px rgba(0,0,0,0.5)' }}>
              <div style={{ width: 80, height: 80, borderRadius: 20, background: '#ffffff', color: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, boxShadow: '0 8px 30px rgba(255,255,255,0.1)' }}>
                <Zap size={40} />
              </div>
              <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12, fontFamily: 'var(--font-display)' }}>P2P Architecture</h3>
              <p style={{ color: '#aaa', lineHeight: 1.6, fontSize: 16 }}>Connect directly with peers over a high-speed relay network. When you disconnect, the chat data disappears forever.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== WAVE SEPARATOR (Dark → White) ===== */}
      <div className="wave-separator" style={{ background: '#000000' }}>
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none">
          <path d="M0,0 C360,60 1080,60 1440,0 L1440,60 L0,60 Z" fill="#ffffff" />
        </svg>
      </div>

      {/* ===== ABOUT US (Developers) SECTION (White) ===== */}
      <section id="about" style={{ backgroundColor: '#ffffff', color: '#000000', position: 'relative', overflow: 'hidden', padding: '100px 20px' }}>
        {/* Animated Black Waves Background */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.1, pointerEvents: 'none', zIndex: 0 }}>
          <Waves
            lineColor="#000000"
            backgroundColor="transparent"
            waveSpeedX={0.01}
            waveSpeedY={0.005}
            waveAmpX={30}
            waveAmpY={15}
            friction={0.9}
            tension={0.01}
            maxCursorMove={100}
            xGap={15}
            yGap={15}
          />
        </div>

        <div className="section-container" style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 10 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(32px, 4vw, 48px)', textAlign: 'center', marginBottom: 60, letterSpacing: '-1px' }}>
            About Us
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 40, alignItems: 'start', paddingBottom: 80 }}>
            {/* Rishabh */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              {/* Decorative Circle */}
              <div style={{ position: 'absolute', top: -20, left: -20, zIndex: -1, width: 60, height: 60, borderRadius: '50%', background: '#e2e8f0', opacity: 0.8 }} />
              {/* Decorative Dot Grid */}
              <div style={{ position: 'absolute', bottom: -20, right: -20, zIndex: -1 }}>
                <DottedGrid rows={6} cols={5} color="#000" opacity={0.15} />
              </div>

              <div style={{ background: '#f8fafc', padding: 40, borderRadius: 24, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', transition: 'transform 0.3s', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <img src="https://ui-avatars.com/api/?name=Rishabh+Chobey&size=150&background=000&color=fff&bold=true" alt="Rishabh Chobey" style={{ width: 100, height: 100, borderRadius: '50%', marginBottom: 20, objectFit: 'cover', border: '3px solid #e2e8f0' }} />
                <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, fontFamily: 'var(--font-display)' }}>Rishabh Chobey</h3>
                <p style={{ color: '#0284C7', fontSize: 13, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 20 }}>Team Leader & UI/UX</p>
                <p style={{ color: '#475569', fontSize: 15, lineHeight: 1.6, marginBottom: 24, flex: 1 }}>
                  Visionary UI/UX engineer framing seamless and aesthetically stunning interfaces to bridge the gap between complex web3 mechanics and ordinary users.
                </p>
                <div style={{ display: 'flex', gap: 12 }}>
                  <a href="https://www.linkedin.com/in/rishabh-chobey-48899137b?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank" rel="noreferrer" style={{ width: 40, height: 40, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', border: '1px solid #cbd5e1' }}>
                    <Linkedin size={18} />
                  </a>
                  <a href="mailto:rishabhchobey95@gmail.com" style={{ width: 40, height: 40, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', border: '1px solid #cbd5e1' }}>
                    <Mail size={18} />
                  </a>
                </div>
              </div>
            </div>

            {/* Prince */}
            <div style={{ position: 'relative', zIndex: 1, marginTop: 40 }}>
              {/* Decorative Circle */}
              <div style={{ position: 'absolute', bottom: -15, right: -25, zIndex: -1, width: 80, height: 80, borderRadius: '50%', background: '#e2e8f0', opacity: 0.8 }} />

              <div style={{ background: '#0a0a0a', color: '#ffffff', padding: 40, borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', transition: 'transform 0.3s', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}>
                <img src="https://ui-avatars.com/api/?name=Prince+Mewara&size=150&background=fff&color=000&bold=true" alt="Prince Mewara" style={{ width: 100, height: 100, borderRadius: '50%', marginBottom: 20, objectFit: 'cover', border: '3px solid rgba(255,255,255,0.1)' }} />
                <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, fontFamily: 'var(--font-display)', color: '#fff' }}>Prince Mewara</h3>
                <p style={{ color: '#10B981', fontSize: 13, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 20 }}>Backend & Integration</p>
                <p style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.6, marginBottom: 24, flex: 1 }}>
                  Architected the secure Web3 backend, integrating wallet authentication and precisely routing peer-to-peer WebSocket communications.
                </p>
                <div style={{ display: 'flex', gap: 12 }}>
                  <a href="https://www.linkedin.com/in/prince-mewara-66564237b?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank" rel="noreferrer" style={{ width: 40, height: 40, borderRadius: '50%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Linkedin size={18} />
                  </a>
                  <a href="mailto:princemewara69@gmail.com" style={{ width: 40, height: 40, borderRadius: '50%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Mail size={18} />
                  </a>
                </div>
              </div>
            </div>

            {/* Kapil */}
            <div style={{ position: 'relative', zIndex: 1, marginTop: 80 }}>
              {/* Decorative Circle */}
              <div style={{ position: 'absolute', top: 40, left: -30, zIndex: -1, width: 50, height: 50, borderRadius: '50%', background: '#e2e8f0', opacity: 0.8 }} />
              {/* Decorative Dot Grid */}
              <div style={{ position: 'absolute', top: -20, right: -10, zIndex: -1 }}>
                <DottedGrid rows={4} cols={5} color="#000" opacity={0.15} />
              </div>

              <div style={{ background: '#f8fafc', padding: 40, borderRadius: 24, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', transition: 'transform 0.3s', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <img src="https://ui-avatars.com/api/?name=Kapil+Saini&size=150&background=000&color=fff&bold=true" alt="Kapil Saini" style={{ width: 100, height: 100, borderRadius: '50%', marginBottom: 20, objectFit: 'cover', border: '3px solid #e2e8f0' }} />
                <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, fontFamily: 'var(--font-display)' }}>Kapil Saini</h3>
                <p style={{ color: '#4F46E5', fontSize: 13, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 20 }}>R&D & Testing</p>
                <p style={{ color: '#475569', fontSize: 15, lineHeight: 1.6, marginBottom: 24, flex: 1 }}>
                  Spearheaded Research & Development to bulletproof security models and led comprehensive Quality Assurance testing across all core platform features.
                </p>
                <div style={{ display: 'flex', gap: 12 }}>
                  <a href="mailto:kapilsaini0342@gmail.com" style={{ width: 40, height: 40, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', border: '1px solid #cbd5e1' }}>
                    <Mail size={18} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>




      {/* ===== FOOTER ===== */}
      <footer style={{ background: 'black', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '40px 40px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: '#64748B' }}>Zero-Trust Messenger</span>
          </div>
          <p style={{ color: '#475569', fontSize: 13 }}>
            Built for Hackathon 2026 • No data stored • Fully open source
          </p>
        </div>
      </footer>
    </div>
  );
}


// ============================================================
// MAIN APP COMPONENT
// ============================================================
export default function App() {
  // --- State ---
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [peerId, setPeerId] = useState<string | null>(null);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [alias, setAlias] = useState<string>('');
  const [peerAlias, setPeerAlias] = useState<string>('Connected Peer');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [appMode, setAppMode] = useState<'idle' | 'hosting' | 'joining'>('idle');
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  // WebRTC / PeerJS State
  const [wsStatus, setWsStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const peerInstanceRef = useRef<Peer | null>(null);
  const activeConnectionRef = useRef<any>(null); // To store the active connection with another peer
  const activeChatRef = useRef<string | null>(null);

  // Keep ref in sync to avoid stale closures in the WS listener
  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  // --- PeerJS Connection Logic ---
  useEffect(() => {
    if (!peerId) return;

    setWsStatus('connecting');
    const peer = new Peer(peerId);
    peerInstanceRef.current = peer;

    peer.on('open', (id) => {
      console.log('My peer ID is: ' + id);
      setWsStatus('connected');
    });

    peer.on('connection', (conn) => {
      console.log('Incoming connection from: ' + conn.peer);
      
      // Auto-accept connection and switch to chat view
      setActiveChat(conn.peer);
      setAppMode('idle');
      activeConnectionRef.current = conn;
      
      conn.on('data', (data: any) => {
        console.log('Received data:', data);
        if (data.type === 'P2P_MESSAGE') {
            const { id, senderId, text, timestamp, senderAlias, isSystemMessage } = data.payload;

            if (senderAlias) {
              setPeerAlias(senderAlias);
            }

            const systemText = isSystemMessage && senderAlias ? `${senderAlias} joined the chat.` : text;

            setMessages(prev => {
              if (prev.some(m => m.id === id)) return prev;
              
              const encryptedMsg: Message = { id, senderId, text: isSystemMessage ? systemText : ('🔐 ' + btoa(text).substring(0, 20) + '...'), timestamp, isMyMessage: false, isEncrypted: !isSystemMessage, isSystemMessage };
              
              if (!isSystemMessage) {
                setTimeout(() => {
                  setMessages(currentMessages => currentMessages.map(m => m.id === id ? { ...m, text, isEncrypted: false } : m));
                }, 800);
              }
              
              return [...prev, encryptedMsg];
            });
        }
      });
      
      conn.on('close', () => {
         console.log("Connection closed.");
         setWsStatus('disconnected');
      });
    });

    peer.on('error', (err) => {
      console.error('PeerJS error:', err);
      // In case of a conflict, PeerJS throws 'unavailable-id'
      if (err.type === 'unavailable-id') {
         alert("That Host Code is already in use by another browser. Please log in with a different wallet or use a different Demo ID.");
      }
    });

    return () => {
      if (peerInstanceRef.current) {
        peerInstanceRef.current.destroy();
      }
    };
  }, [peerId]);

  // --- Utilities ---
  // Generate a 16-character alphanumeric string 
  const generate16CharId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Format it slightly for readability e.g. ABCD-1234-WXYZ-5678
    return `${result.slice(0, 4)}-${result.slice(4, 8)}-${result.slice(8, 12)}-${result.slice(12, 16)}`.toUpperCase();
  }

  const generateAlias = () => {
    const adjectives = ["Neon", "Cyber", "Crypto", "Phantom", "Stealth", "Quantum", "Hyper", "Alpha", "Zero", "Ghost", "Void", "Cosmic", "Lunar", "Solar"];
    const nouns = ["Rider", "Punk", "Ninja", "Surfer", "Wolf", "Hawk", "Dragon", "Phoenix", "Node", "Vanguard", "Runner", "Hacker", "Cipher"];
    return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]} ${Math.floor(Math.random() * 1000)}`;
  };

  // --- Mock Wallet Logic (For Demo/Testing) ---
  const handleDemoLogin = () => {
    const randomHex = ethers.hexlify(ethers.randomBytes(20));
    setWalletAddress(randomHex);
    setPeerId(generate16CharId());
    setAlias(generateAlias());
    setIsDemoMode(true);
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("No Web3 wallet detected! Please install MetaMask or use Demo Mode.");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Request accounts using the standard Ethers v6 pattern
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      if (address) {
        setWalletAddress(address);
        
        // Fulfilling the "node-based peer-to-peer messaging" requirement:
        // By deriving the Node ID deterministically from the user's verifiable Web3 wallet address.
        // We append a tiny 2-char random suffix ONLY so you can test two tabs locally with the exact same wallet address simultaneously without them kicking each other off the relay network!
        const randomSuffix = Math.random().toString(36).substring(2, 4).toUpperCase();
        const derivedNodeId = `${address.slice(2, 6)}-${address.slice(6, 10)}-${address.slice(10, 14)}-${address.slice(14, 18)}-${randomSuffix}`.toUpperCase();
        setPeerId(derivedNodeId);
        setAlias(generateAlias());
        setIsDemoMode(false);
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert("Failed to connect wallet.");
    }
  };

  const handleCopyCode = async () => {
    if (peerId) {
      try {
        await navigator.clipboard.writeText(peerId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy!", err);
      }
    }
  };

  // --- Chat UI Handlers ---
  const handleHostChat = () => {
    setAppMode('hosting');
  };

  const handleJoinChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = joinCode.trim().toUpperCase();
    if (code) {
      setActiveChat(code);
      setAppMode('idle'); // Instantly transition the Joiner to the Chat Screen

      // Send handshake
      if (peerInstanceRef.current && wsStatus === 'connected') {
        const conn = peerInstanceRef.current.connect(code);
        activeConnectionRef.current = conn;
        
        conn.on('open', () => {
          const id = Math.random().toString(36).substring(2, 9);
          const timestamp = Date.now();
          conn.send({
            type: 'P2P_MESSAGE',
            payload: {
              recipientId: code,
              senderId: peerId,
              text: "Peer joined the chat.",
              senderAlias: alias,
              id,
              timestamp,
              isSystemMessage: true
            }
          });
          
          setMessages([{
            id,
            senderId: peerId || 'unknown',
            text: "You joined the chat.",
            timestamp,
            isMyMessage: true,
            isSystemMessage: true
          }]);
          
          // Listen for incoming messages on this connection specifically
          conn.on('data', (data: any) => {
            if (data.type === 'P2P_MESSAGE') {
                const { id, senderId, text, timestamp, senderAlias, isSystemMessage } = data.payload;

                if (senderAlias) {
                  setPeerAlias(senderAlias);
                }

                const systemText = isSystemMessage && senderAlias ? `${senderAlias} joined the chat.` : text;

                setMessages(prev => {
                  if (prev.some(m => m.id === id)) return prev;
                  
                  const encryptedMsg: Message = { id, senderId, text: isSystemMessage ? systemText : ('🔐 ' + btoa(text).substring(0, 20) + '...'), timestamp, isMyMessage: false, isEncrypted: !isSystemMessage, isSystemMessage };
                  
                  if (!isSystemMessage) {
                    setTimeout(() => {
                      setMessages(currentMessages => currentMessages.map(m => m.id === id ? { ...m, text, isEncrypted: false } : m));
                    }, 800);
                  }
                  
                  return [...prev, encryptedMsg];
                });
            }
          });
        });
      }
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || !peerInstanceRef.current || wsStatus !== 'connected') return;

    // Demo Mode Limit Enforcement
    if (isDemoMode) {
      const sentMessagesCount = messages.filter(m => m.isMyMessage && !m.isSystemMessage).length;
      if (sentMessagesCount >= 10) {
        alert("Demo Limit Reached! To continue chatting securely, please reconnect using your Web3 Wallet.");
        // Force disconnect and redirect to login
        setWalletAddress(null);
        setPeerId(null);
        setActiveChat(null);
        setMessages([]);
        setAppMode('idle');
        if (peerInstanceRef.current) peerInstanceRef.current.destroy();
        return;
      }
    }

    const id = Math.random().toString(36).substring(2, 9);
    const timestamp = Date.now();

    // 1. Show message locally immediately
    const msg: Message = {
      id,
      senderId: peerId || 'unknown',
      text: newMessage,
      timestamp,
      isMyMessage: true,
    };
    setMessages([...messages, msg]);

    // 2. Send via PeerJS WebRTC Connection
    if (activeConnectionRef.current && activeConnectionRef.current.open) {
      activeConnectionRef.current.send({
        type: 'P2P_MESSAGE',
        payload: {
          recipientId: activeChat,
          senderId: peerId,
          text: newMessage,
          senderAlias: alias,
          id,
          timestamp
        }
      });
    } else {
       console.error("Connection is not open to peer:", activeChat);
       alert("Peer is offline or connection was lost.");
    }

    setNewMessage('');
  };

  // --- Render Functions ---

  // Show Matrix.org-style landing page when not logged in
  if (!walletAddress) {
    return (
      <ReactLenis root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
        <LandingPage onConnectWallet={connectWallet} onDemoLogin={handleDemoLogin} />
      </ReactLenis>
    );
  }

  // Show Chat App when logged in — Element/Matrix-style, Black & White
  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: '#000', fontFamily: 'var(--font-body)', color: '#fff' }}>

      <AnimatePresence mode="wait">
        {!activeChat ? (
          /* ===== Initial Screen: Host / Join / Hosting / Joining ===== */
          <motion.div
            key="setup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col items-center justify-center text-center p-8 relative"
          >
            {/* Hacker Glitch Background */}
            <LetterGlitch glitchSpeed={30} centerVignette={true} outerVignette={true} smooth={true} />

            {/* Main Container for Initial Flow (needs z-index to sit above canvas) */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80%', height: '70%', background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.7) 40%, transparent 65%)', zIndex: 5, pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 10, textShadow: '0 0 20px rgba(0,0,0,1), 0 0 40px rgba(0,0,0,1), 0 0 60px rgba(0,0,0,0.8)' }}>
              {appMode === 'idle' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center gap-6"
                >
                  <div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 36, color: '#fff', marginBottom: 8, letterSpacing: '-1.5px' }}>
                      Secure Messenger
                    </h1>
                    <p style={{ color: '#aaa', fontSize: 14 }}>
                      Encrypted peer-to-peer chat. No data stored.
                    </p>
                  </div>

                  <div className="flex gap-4" style={{ marginTop: 16 }}>
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: '0 8px 30px rgba(255,255,255,0.15)' }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleHostChat}
                      className="flex items-center gap-3"
                      style={{
                        padding: '16px 36px',
                        background: '#fff',
                        color: '#000',
                        fontSize: 16,
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: 999,
                        boxShadow: '0 4px 20px rgba(255,255,255,0.1)',
                        transition: 'all 0.2s',
                      }}
                    >
                      <Server size={20} />
                      Host
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: '0 8px 30px rgba(255,255,255,0.15)' }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setAppMode('joining')}
                      className="flex items-center gap-3"
                      style={{
                        padding: '16px 36px',
                        background: 'transparent',
                        color: '#fff',
                        fontSize: 16,
                        fontWeight: 700,
                        border: '2px solid #fff',
                        cursor: 'pointer',
                        borderRadius: 999,
                        transition: 'all 0.2s',
                      }}
                    >
                      <Lock size={20} />
                      Join
                    </motion.button>
                  </div>

                  {/* User Info */}
                  <div className="flex items-center gap-2" style={{ marginTop: 24, opacity: 0.5 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: wsStatus === 'connected' ? '#10B981' : '#F59E0B' }} />
                    <span style={{ fontSize: 12, color: '#888' }}>{alias} • {wsStatus === 'connected' ? 'Online' : 'Connecting...'}</span>
                  </div>
                </motion.div>
              )}

              {appMode === 'hosting' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center"
                >
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ width: 64, height: 64, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}
                  >
                    <Server size={28} style={{ color: '#888' }} />
                  </motion.div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 22, color: '#fff', marginBottom: 8, letterSpacing: '-0.5px' }}>Waiting for peer...</h3>
                  <p style={{ color: '#aaa', fontSize: 14, maxWidth: 380, lineHeight: 1.6, marginBottom: 24 }}>Share your host code below. The chat will begin when someone connects.</p>

                  {/* Host Code Card */}
                  <div style={{ background: '#111', borderRadius: 12, padding: '16px 24px', border: '1px solid rgba(255,255,255,0.1)', minWidth: 300 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#555', marginBottom: 8 }}>Your Host Code</p>
                    <div className="flex items-center gap-3">
                      <p style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 700, letterSpacing: '0.15em', color: '#fff', flex: 1 }}>{peerId}</p>
                      <motion.button
                        onClick={handleCopyCode}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        style={{ color: '#888', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                      >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                      </motion.button>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ background: '#1a1a1a' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setAppMode('idle'); }}
                    style={{ marginTop: 24, padding: '10px 24px', borderRadius: 999, background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#888', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
                  >
                    Cancel
                  </motion.button>
                </motion.div>
              )}

              {appMode === 'joining' && (
                <motion.form
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleJoinChatSubmit}
                  className="w-full max-w-sm"
                >
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 22, color: '#fff', marginBottom: 8, letterSpacing: '-0.5px', textAlign: 'center' }}>Join a peer</h3>
                  <p style={{ color: '#aaa', fontSize: 14, marginBottom: 24, textAlign: 'center' }}>Enter the host code to connect</p>
                  <input
                    type="text"
                    placeholder="XXXX-XXXX-XXXX-XXXX"
                    className="w-full outline-none transition-all uppercase"
                    style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '14px 16px', color: '#fff', fontSize: 14, fontFamily: 'monospace', fontWeight: 600, letterSpacing: '0.15em', textAlign: 'center' }}
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                  <motion.button
                    whileHover={{ background: '#222' }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={!joinCode.trim()}
                    className="w-full"
                    style={{ marginTop: 12, padding: '14px', borderRadius: 10, background: '#fff', color: '#000', fontSize: 14, fontWeight: 700, border: '2px solid #fff', cursor: 'pointer' }}
                  >
                    Connect
                  </motion.button>
                  <motion.button
                    whileHover={{ background: '#1a1a1a' }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => { setAppMode('idle'); setJoinCode(''); }}
                    className="w-full"
                    style={{ marginTop: 8, padding: '10px', borderRadius: 10, background: 'transparent', border: '2px solid #fff', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                  >
                    Cancel
                  </motion.button>
                </motion.form>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col"
            style={{ position: 'relative' }}
          >
            {/* Static Dot Grid Background */}
            <div style={{
              position: 'absolute',
              inset: 0,
              zIndex: 0,
              background: '#09090b', // dark background
              backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)',
              backgroundSize: '24px 24px', // spacing between dots
            }}>
              {/* Fade out the edges of the grid slightly so it doesn't hard-cut */}
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 30%, #09090b 100%)' }} />
            </div>

            {/* Floating Nav Pills — name on left, leave on right */}
            <div style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px' }}>
              {/* Name Pill */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)', borderRadius: 999, padding: '8px 20px 8px 10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#000' }}>
                  {peerAlias?.charAt(0)?.toUpperCase() || 'P'}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', fontFamily: 'var(--font-display)' }}>{peerAlias}</span>
              </div>

              {/* Leave Pill */}
              <motion.button
                whileHover={{ background: 'rgba(255,255,255,0.15)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setActiveChat(null); setAppMode('idle'); setMessages([]); }}
                style={{ padding: '8px 20px', borderRadius: 999, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                Leave
              </motion.button>
            </div>

            {/* Simple Welcome Text */}
            <div style={{ position: 'relative', zIndex: 5, textAlign: 'center', padding: '8px 0', color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
              Welcome to the chat 🔒
            </div>

            {/* Messages — Element-style flat layout (no bubbles) */}
            <div className="flex-1 overflow-y-auto no-scrollbar" style={{ padding: '16px 24px', position: 'relative', zIndex: 5 }}>
              {/* Subtle Animated Background */}
              <div style={{ position: 'absolute', inset: 0, opacity: 0.15, pointerEvents: 'none', zIndex: 0 }}>
                <Waves
                  lineColor="rgba(255,255,255,0.05)"
                  backgroundColor="transparent"
                  waveSpeedX={0.01}
                  waveSpeedY={0.005}
                  waveAmpX={30}
                  waveAmpY={15}
                  friction={0.9}
                  tension={0.01}
                  maxCursorMove={100}
                  xGap={15}
                  yGap={15}
                />
              </div>

              <div style={{ position: 'relative', zIndex: 1 }}>
                {messages.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center" style={{ minHeight: '100%', padding: '40px 0' }}>
                    <p style={{ color: '#555', fontSize: 13, background: '#111', padding: '8px 20px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.05)' }}>
                      Connection established. Start typing securely.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    {messages.map((msg, index) => {
                      // Show date separator if first message or different day
                      const showDate = index === 0 ||
                        new Date(msg.timestamp).toDateString() !== new Date(messages[index - 1].timestamp).toDateString();

                      return (
                        <div key={msg.id}>
                          {showDate && (
                            <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
                              <span style={{ fontSize: 11, color: '#444', fontWeight: 600, background: '#0a0a0a', padding: '4px 12px', borderRadius: 4 }}>
                                {new Date(msg.timestamp).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          )}

                          {msg.isSystemMessage ? (
                            <div style={{ textAlign: 'center', padding: '12px 0' }}>
                              <span style={{ fontSize: 12, color: '#888', background: '#111', padding: '6px 16px', borderRadius: 999, fontWeight: 500, border: '1px solid rgba(255,255,255,0.05)' }}>
                                {msg.text}
                              </span>
                            </div>
                          ) : (
                            <motion.div
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2 }}
                              className={`flex gap-3 ${msg.isMyMessage ? 'flex-row-reverse' : ''}`}
                              style={{ padding: '8px 0', maxWidth: '75%', marginLeft: msg.isMyMessage ? 'auto' : 0, marginRight: msg.isMyMessage ? 0 : 'auto' }}
                            >

                              {/* Message Bubble */}
                              <div style={{
                                background: msg.isMyMessage ? '#fff' : '#111827',
                                borderRadius: 20,
                                padding: '14px 20px',
                                minWidth: 0,
                                boxShadow: msg.isMyMessage ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                              }}>
                                <p style={{
                                  fontSize: msg.isEncrypted ? 13 : 16,
                                  color: msg.isMyMessage ? (msg.isEncrypted ? '#999' : '#000') : (msg.isEncrypted ? '#666' : '#fff'),
                                  lineHeight: 1.5,
                                  wordBreak: 'break-word',
                                  fontWeight: 500,
                                  fontFamily: msg.isEncrypted ? 'monospace' : 'inherit'
                                }}>
                                  {msg.text}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                {/* Invisible div for auto-scrolling */}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Bar — Element style */}
            <div style={{ position: 'relative', zIndex: 10, padding: '12px 24px 16px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
              <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder={wsStatus === 'connected' ? "Send a message..." : "Connecting..."}
                  disabled={wsStatus !== 'connected'}
                  className="flex-1 outline-none disabled:opacity-40"
                  style={{ background: '#111', border: '2px solid #fff', borderRadius: 8, padding: '12px 16px', color: '#fff', fontSize: 14, fontWeight: 500 }}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,255,255,0.2)'}
                  onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                />
                <motion.button
                  type="submit"
                  disabled={!newMessage.trim() || wsStatus !== 'connected'}
                  whileHover={{ background: '#e2e8f0', scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    background: '#fff',
                    color: '#000',
                    border: 'none',
                    borderRadius: '50%',
                    width: 44,
                    height: 44,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 1,
                    transition: 'all 0.2s',
                    boxShadow: 'none'
                  }}
                >
                  <Send size={18} style={{ marginLeft: -2 }} />
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
