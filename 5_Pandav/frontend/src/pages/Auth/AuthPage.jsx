import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from '../../../firebase';
import { Mail, Lock, User, Hexagon, ChevronLeft, BarChart3, ShieldAlert, Activity } from 'lucide-react';
import ParticleField from '../LandingPage/ParticleField';
import './AuthPage.css';

export default function AuthPage({ defaultMode = 'login' }) {
  const [mode, setMode] = useState(defaultMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/dashboard');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const toggleMode = () => {
    setMode(prev => prev === 'login' ? 'signup' : 'login');
    setError(null);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!email || !password || (mode === 'signup' && !name)) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (mode === 'signup') {
        await createUserWithEmailAndPassword(auth, email, password);
        // Normally you'd update profile with name here, but keeping it simple
        navigate('/dashboard');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard');
    } catch (err) {
       setError(err.message.replace('Firebase: ', ''));
    }
  };

  return (
    <div className="auth-container">
      {/* Left Panel - Form */}
      <div className="auth-left">
        <div className="auth-form-wrapper">
          <Link to="/" className="back-link">
            <ChevronLeft size={20} /> Back to Home
          </Link>
          
          <div className="auth-header">
            <div className="auth-logo">
              <Hexagon className="logo-icon" size={28} />
              <span>Agentic Protocol</span>
            </div>
            <h1>{mode === 'signup' ? 'Sign up' : 'Log in'}</h1>
            <p className="auth-subtitle">
              {mode === 'signup' 
                ? 'Start your 30-day free trial.' 
                : 'Welcome back. Please enter your details.'}
            </p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleAuth} className="auth-form">
            {mode === 'signup' && (
              <div className="form-group">
                <label>Name*</label>
                <div className="input-with-icon">
                  <User size={18} className="input-icon" />
                  <input 
                    type="text" 
                    placeholder="Enter your name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                  />
                </div>
              </div>
            )}
            
            <div className="form-group">
              <label>Email*</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password*</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input 
                  type="password" 
                  placeholder="Create a password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                />
              </div>
              {mode === 'signup' && <span className="input-hint">Must be at least 8 characters.</span>}
            </div>

            <button type="submit" className="primary-btn pulse-glow" disabled={loading}>
              {loading ? 'Processing...' : (mode === 'signup' ? 'Get started' : 'Log in')}
            </button>
          </form>

          <button onClick={handleGoogleSignIn} className="google-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {mode === 'signup' ? 'Sign up with Google' : 'Sign in with Google'}
          </button>

          <p className="auth-switch">
            {mode === 'signup' ? 'Already have an account? ' : 'Don\'t have an account? '}
            <span onClick={toggleMode} className="switch-link">
              {mode === 'signup' ? 'Log in' : 'Sign up'}
            </span>
          </p>

          <div className="auth-footer-text">
            <span>© Agentic Protocol 2026</span>
            <span>help@agenticprotocol.com</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Visual Showcase */}
      <div className="auth-right">
        <div className="particle-wrapper">
          <ParticleField />
        </div>
        
        <div className="showcase-content">
          <div className="floating-cards">
            {/* Mock Card 1 */}
            <div className="glass-card card-1">
              <div className="card-header">
                <div className="card-icon blue"><Activity size={20} /></div>
                <div>
                  <h4>AI Agent Beta</h4>
                  <p>@agent_alpha</p>
                </div>
              </div>
              <div className="card-body">
                <div className="val-label">Jan '26-27 | Protocol Value</div>
                <div className="val-amount">$ 5,837.45</div>
                <div className="val-change positive">+ $563 today</div>
              </div>
              <div className="mock-chart">
                 <div className="bar b1"></div>
                 <div className="bar b2"></div>
                 <div className="bar b3"></div>
                 <div className="bar b4"></div>
                 <div className="bar b5"></div>
                 <div className="bar b6"></div>
                 <div className="bar b7"></div>
              </div>
            </div>

            {/* Mock Card 2 */}
            <div className="glass-card card-2">
              <ShieldAlert size={28} className="card-icon red" />
              <span>Anomaly Detected</span>
            </div>

            <div className="glass-card card-3">
              <BarChart3 size={28} className="card-icon green" />
              <span>Strategies</span>
            </div>
          </div>

          <div className="showcase-text">
            <h2>Introducing AutoReports 2.0®</h2>
            <p>Powerful, self-serve product and trade analytics to help you grow your decentralized assets securely.</p>
            
            <div className="carousel-dots">
              <div className="dot"></div>
              <div className="dot active"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
            <div className="showcase-footer-text">This design was curated for Agentic Protocol</div>
          </div>
        </div>
      </div>
    </div>
  );
}
