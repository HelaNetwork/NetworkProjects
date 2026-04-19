import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, SignOutButton } from "@clerk/clerk-react";

export default function LandingPage() {
    const navigate = useNavigate();
    const { isSignedIn, user, isLoaded } = useUser();

    if (!isLoaded) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
    }

    return (
        <div className="app-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 4rem)', textAlign: 'center' }}>
            <header style={{ marginBottom: '4rem', position: 'relative', zIndex: 2 }}>
                <div style={{
                    fontSize: '4rem',
                    marginBottom: '1.5rem',
                    filter: 'drop-shadow(0 0 20px rgba(147, 51, 234, 0.4))',
                    background: 'var(--gradient-text)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 800
                }}>
                    P
                </div>
                <h1 style={{
                    fontSize: '4.5rem',
                    fontWeight: '800',
                    background: 'var(--gradient-text)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.02em',
                    marginBottom: '1rem',
                    textShadow: '0 10px 30px rgba(147, 51, 234, 0.2)'
                }}>
                    PayStream
                </h1>
                <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
                    The decentralized payroll streaming protocol.
                    <br />
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Real-time earnings • Instant withdrawals • Automated tax compliance</span>
                </p>
            </header>

            <div className="glass-card" style={{ padding: '3rem', maxWidth: '480px', width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div>
                    <h2 style={{ marginBottom: '0.5rem', fontSize: '1.5rem' }}>Account Portal</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Select your role to continue</p>
                </div>

                {isSignedIn && (
                    <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.85rem',
                        border: '1px solid var(--glass-border)',
                        color: 'var(--text-secondary)'
                    }}>
                        Signed in as <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{user.primaryEmailAddress?.emailAddress}</span>
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button
                        className="btn btn-primary"
                        style={{ padding: '1.25rem', fontSize: '1.1rem', justifyContent: 'center' }}
                        onClick={() => navigate(isSignedIn ? '/hr' : '/hr/sign-in')}
                    >
                        Access HR Dashboard
                    </button>

                    <button
                        className="btn"
                        style={{
                            padding: '1.25rem',
                            fontSize: '1.1rem',
                            background: 'transparent',
                            border: '1px solid var(--glass-border)',
                            color: 'var(--text-primary)',
                            justifyContent: 'center'
                        }}
                        onClick={() => navigate(isSignedIn ? '/employee' : '/employee/sign-in')}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        Access Employee Portal
                    </button>

                    {isSignedIn && (
                        <SignOutButton>
                            <button className="btn-ghost" style={{ marginTop: '0.5rem', width: '100%' }}>
                                Sign Out
                            </button>
                        </SignOutButton>
                    )}
                </div>
            </div>

            <footer style={{ marginTop: '4rem', color: 'var(--text-muted)', fontSize: '0.8rem', opacity: 0.6 }}>
                HeLa Testnet • Secure • Decentralized
            </footer>
        </div>
    );
}
