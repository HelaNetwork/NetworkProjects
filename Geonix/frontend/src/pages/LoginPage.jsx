import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserCog, User, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', role: 'employee' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (token && userRole) {
      // Already logged in, redirect to appropriate dashboard
      if (userRole === 'hr') {
        navigate('/hr', { replace: true });
      } else if (userRole === 'employee') {
        navigate('/employee', { replace: true });
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store auth data
      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.user.role);
      localStorage.setItem('userName', data.user.name);
      localStorage.setItem('userEmail', data.user.email);
      localStorage.setItem('userId', data.user.id);
      if (data.user.wallet_address) {
        localStorage.setItem('walletAddress', data.user.wallet_address);
      }

      // Navigate based on role
      if (data.user.role === 'hr') {
        navigate('/hr', { replace: true });
      } else {
        navigate('/employee', { replace: true });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-6 py-24 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-20 -left-20 w-[600px] h-[600px] rounded-full blur-[150px] pointer-events-none opacity-20" style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.5) 0%, transparent 70%)' }} />
      <div className="absolute bottom-20 -right-20 w-[600px] h-[600px] rounded-full blur-[150px] pointer-events-none opacity-20" style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.5) 0%, transparent 70%)' }} />

      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-2xl" style={{ background: 'linear-gradient(135deg, #F97316, #A855F7)' }}>P</div>
            <span className="text-2xl font-bold" style={{ background: 'linear-gradient(135deg, #F97316, #A855F7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>PayStream</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-500">Sign in to your dashboard</p>
        </div>

        {/* Card */}
        <div className="p-8 rounded-3xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}>
          {/* Role Selector */}
          <div className="flex gap-3 mb-8">
            <button
              type="button"
              onClick={() => setForm({ ...form, role: 'hr' })}
              className="flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition-all"
              style={{
                background: form.role === 'hr' ? 'linear-gradient(135deg, #F97316, #EA580C)' : 'rgba(255,255,255,0.05)',
                border: form.role === 'hr' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                color: form.role === 'hr' ? 'white' : '#9ca3af',
                boxShadow: form.role === 'hr' ? '0 5px 20px rgba(249,115,22,0.3)' : 'none',
              }}
            >
              <UserCog size={18} />
              HR / Admin
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, role: 'employee' })}
              className="flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition-all"
              style={{
                background: form.role === 'employee' ? 'linear-gradient(135deg, #A855F7, #7C3AED)' : 'rgba(255,255,255,0.05)',
                border: form.role === 'employee' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                color: form.role === 'employee' ? 'white' : '#9ca3af',
                boxShadow: form.role === 'employee' ? '0 5px 20px rgba(168,85,247,0.3)' : 'none',
              }}
            >
              <User size={18} />
              Employee
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
                <AlertCircle size={20} className="text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-400 mb-2">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@company.com"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-orange-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-orange-500 focus:outline-none transition-colors pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-2 transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{
                background: form.role === 'hr'
                  ? 'linear-gradient(135deg, #F97316, #EA580C)'
                  : 'linear-gradient(135deg, #A855F7, #7C3AED)',
                boxShadow: form.role === 'hr'
                  ? '0 10px 40px rgba(249,115,22,0.3)'
                  : '0 10px 40px rgba(168,85,247,0.3)',
              }}
            >
              {loading ? 'Please wait...' : 'Sign In'}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>

          {/* Default Credentials Info */}
          <div className="mt-8 space-y-4">
            <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <p className="text-xs text-orange-300 font-semibold mb-2">HR Admin Login:</p>
              <p className="text-xs text-gray-400 font-mono">admin@paystream.io / admin123</p>
            </div>

            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <p className="text-xs text-purple-300 font-semibold mb-2">Employee Demo Logins:</p>
              <div className="space-y-1 text-xs text-gray-400 font-mono">
                <p>john.doe@paystream.io / employee123</p>
                <p>jane.smith@paystream.io / employee123</p>
                <p>bob.wilson@paystream.io / employee123</p>
                <p className="text-gray-500">+ 2 more...</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
