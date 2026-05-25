"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppKit } from '@reown/appkit/react';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const { open } = useAppKit();

  if (!mounted) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>INITIALIZING TERMINAL...</p>
      </div>
    );
  }

  return (
    <main style={{
      minHeight: '100vh',
      padding: '4rem 2rem',
      backgroundColor: '#f5f5f5',
      fontFamily: '"Arial Black", Arial, sans-serif',
      color: 'black',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        maxWidth: '800px',
        width: '100%',
        margin: '0 auto',
        border: '5px solid black',
        backgroundColor: 'white',
        boxShadow: '15px 15px 0 black',
        rotate: '-1deg'
      }}>
        
        {/* Header Tab Toggles */}
        <div style={{ display: 'flex', borderBottom: '5px solid black' }}>
          <button 
            onClick={() => setIsLogin(true)}
            style={{
              flex: 1,
              padding: '1.5rem',
              backgroundColor: isLogin ? '#ffff00' : '#fff',
              color: 'black',
              border: 'none',
              borderRight: '5px solid black',
              fontSize: '1.5rem',
              fontWeight: '900',
              fontFamily: '"Arial Black", sans-serif',
              cursor: 'pointer',
              textTransform: 'uppercase'
            }}
          >
            LOGIN
          </button>
          <button 
            onClick={() => setIsLogin(false)}
            style={{
              flex: 1,
              padding: '1.5rem',
              backgroundColor: !isLogin ? '#ffff00' : '#fff',
              color: 'black',
              border: 'none',
              fontSize: '1.5rem',
              fontWeight: '900',
              fontFamily: '"Arial Black", sans-serif',
              cursor: 'pointer',
              textTransform: 'uppercase'
            }}
          >
            SIGNUP
          </button>
        </div>

        <div style={{ padding: '3rem' }}>
          
          <h1 style={{
            fontSize: '3rem',
            fontWeight: '900',
            color: 'black',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            margin: '0 0 0.5rem 0',
            textShadow: '3px 3px 0 #00ffff'
          }}>
            {isLogin ? 'CONNECT WALLET' : 'JOIN ECOSYSTEM'}
          </h1>
          <p style={{
            fontSize: '1.2rem',
            color: 'black',
            fontFamily: 'monospace',
            marginBottom: '2rem',
            fontWeight: 'bold'
          }}>
            {isLogin ? 'AUTHORIZE TO ENTER THE TERMINAL' : 'INITIALIZE YOUR PRESENCE'}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '3rem' }}>
            {/* Wallet Integration Buttons */}
            
            <button onClick={() => open()} style={buttonStyle('#fff', '#ff5500')} onMouseDown={handlePress} onMouseUp={handleRelease} onMouseOut={handleRelease}>
              <span style={{ fontSize: '1.5rem' }}>🦊</span> METAMASK
            </button>
            <button onClick={() => open()} style={buttonStyle('#fff', '#3b82f6')} onMouseDown={handlePress} onMouseUp={handleRelease} onMouseOut={handleRelease}>
              <span style={{ fontSize: '1.5rem' }}>🔗</span> WALLETCONNECT
            </button>
            <button onClick={() => open({ view: 'Connect' })} style={buttonStyle('#fff', '#10b981')} onMouseDown={handlePress} onMouseUp={handleRelease} onMouseOut={handleRelease}>
              <span style={{ fontSize: '1.5rem' }}>🟢</span> COINBASE WALLET
            </button>
            <button onClick={() => open()} style={buttonStyle('#fff', '#8b5cf6')} onMouseDown={handlePress} onMouseUp={handleRelease} onMouseOut={handleRelease}>
              <span style={{ fontSize: '1.5rem' }}>👻</span> PHANTOM
            </button>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '2rem', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderBottom: '4px solid black', zIndex: 1 }}></div>
            <span style={{ 
              position: 'relative', 
              zIndex: 2, 
              backgroundColor: 'white', 
              padding: '0 1rem', 
              fontFamily: '"Arial Black", sans-serif',
              fontWeight: 900,
              fontSize: '1.2rem' 
            }}>
              OR {isLogin ? 'RETURN' : 'ABORT'}
            </span>
          </div>

          <Link href="/" style={{
            display: 'block',
            textAlign: 'center',
            width: '100%',
            padding: '1.5rem 2rem',
            backgroundColor: '#ff0000',
            color: 'white',
            border: '4px solid black',
            fontSize: '1.3rem',
            fontWeight: 'bold',
            fontFamily: '"Arial Black", sans-serif',
            cursor: 'pointer',
            boxShadow: '6px 6px 0 black',
            textTransform: 'uppercase',
            textDecoration: 'none',
            transition: 'all 0.1s',
            rotate: '1deg'
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translate(4px, 4px)';
            e.currentTarget.style.boxShadow = '2px 2px 0 black';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = '';
            e.currentTarget.style.boxShadow = '6px 6px 0 black';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = '';
            e.currentTarget.style.boxShadow = '6px 6px 0 black';
          }}>
            ← BACK TO TERMINAL
          </Link>

        </div>
      </div>
    </main>
  );
}

const buttonStyle = (bg: string, hoverBorder: string) => ({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  gap: '1rem',
  width: '100%',
  padding: '1.2rem 2rem',
  backgroundColor: bg,
  color: 'black',
  border: '4px solid black',
  fontSize: '1.25rem',
  fontWeight: '900',
  fontFamily: '"Arial Black", sans-serif',
  cursor: 'pointer',
  boxShadow: '6px 6px 0 black',
  textTransform: 'uppercase' as const,
  transition: 'all 0.1s'
});

const handlePress = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.currentTarget.style.transform = 'translate(4px, 4px)';
  e.currentTarget.style.boxShadow = '2px 2px 0 black';
  e.currentTarget.style.backgroundColor = '#f0f0f0';
};

const handleRelease = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.currentTarget.style.transform = '';
  e.currentTarget.style.boxShadow = '6px 6px 0 black';
  e.currentTarget.style.backgroundColor = '#fff';
};
