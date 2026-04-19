import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wallet, Shield, Zap, Globe } from 'lucide-react';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();
    const { login, user } = useAuth();
    const [role, setRole] = useState('employee');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            navigate(user.role === 'hr' ? '/hr-dashboard' : '/employee-dashboard');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const result = await login(formData.email, formData.password, role);
            if (result.success) {
                navigate(role === 'hr' ? '/hr-dashboard' : '/employee-dashboard');
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="home-minimal">
            {/* Minimalist Blockchain Animation Background */}
            <div className="blockchain-bg">
                <div className="network-grid"></div>
                {[...Array(12)].map((_, i) => (
                    <div key={i} className={`node node-${i + 1} ${i % 3 === 1 ? 'node-green' : i % 3 === 2 ? 'node-red' : ''}`}>
                        <div className="node-pulse"></div>
                    </div>
                ))}
            </div>

            <header className="minimal-header">
                <div className="brand">
                    <div className="logo-box">H</div>
                    <span>StreamPay</span>
                </div>
                <div className="network-status">
                    <span className="live-dot"></span>
                    Hela Network TestNet
                </div>
            </header>

            <main className="minimal-main">
                <div className="minimal-grid">
                    <div className="hero-content">
                        <div className="hela-badge">Next-Gen Protocol</div>
                        <h1>Second-by-second <br />Payroll.</h1>
                        <p>
                            StreamPay is the official compensation protocol built on <strong>Hela Blockchain</strong>.
                            Zero latency, immutable security, and instant liquidity for the modern workforce.
                        </p>

                        <div className="features-inline">
                            <div className="feat">
                                <Shield size={14} /> <span>TrustFull</span>
                            </div>
                            <div className="feat">
                                <Zap size={14} /> <span>Instant</span>
                            </div>
                            <div className="feat">
                                <Globe size={14} /> <span>Global</span>
                            </div>
                        </div>
                    </div>

                    <div className="auth-container">
                        <div className="auth-box-compact">
                            <div className="auth-header">
                                <h3>Portal Access</h3>

                            </div>

                            <div className="role-pills">
                                <button
                                    className={role === 'employee' ? 'active' : ''}
                                    onClick={() => setRole('employee')}
                                >
                                    Workforce
                                </button>
                                <button
                                    className={role === 'hr' ? 'active' : ''}
                                    onClick={() => setRole('hr')}
                                >
                                    Organization
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="compact-form">
                                <div className="field-min">
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="user@gmail.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="field-min">
                                    <label>Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="XXXXX"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                {error && <div className="error-small">{error}</div>}
                                <button type="submit" disabled={loading} className="btn-black">
                                    {loading ? 'Verifying...' : 'Launch Portal'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="minimal-footer">
                <div className="f-left">STREAMPAY PROTOCOL // POWERED BY HELA</div>
                <div className="f-right">
                    <span>BUILT BY </span>
                    <span className="dot-sep"></span>
                    <span>BILLU BLASTERS </span>
                </div>
            </footer>
        </div>
    );
};

export default Home;
