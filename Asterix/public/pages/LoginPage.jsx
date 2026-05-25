const { useState } = React;

const LoginPage = ({ onLogin, onGoSignup }) => {
    const [email, setEmail] = useState("");
    const [pwd, setPwd] = useState("");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    const handleLogin = () => {
        if (!email || !pwd) {
            setErr("Please fill in all fields.");
            return;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setErr("Enter a valid email address.");
            return;
        }
        setErr("");
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            onLogin();
        }, 1200);
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
            <AuthBg />
            <div className="fade-up" style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 420, padding: "0 20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 32 }}>
                    <LogoMark size={40} />
                    <div>
                        <div style={{ fontWeight: 800, fontSize: 22, letterSpacing: "0.04em" }}>CrisisGuard AI</div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent-blue)", letterSpacing: "0.12em" }}>FINANCIAL EARLY WARNING SYSTEM</div>
                    </div>
                </div>

                <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, padding: 32 }}>
                    <h2 style={{ fontWeight: 800, fontSize: 20, marginBottom: 6 }}>Welcome back</h2>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 28 }}>Sign in to your analyst account</p>

                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div>
                            <label style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: 7 }}>
                                <Icon name="mail" size={11} /> EMAIL ADDRESS
                            </label>
                            <input className="crisis-input" type="email" placeholder="analyst@firm.com" value={email} onChange={e => setEmail(e.target.value)} />
                        </div>
                        <div>
                            <label style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: 7 }}>
                                <Icon name="lock" size={11} /> PASSWORD
                            </label>
                            <input
                                className="crisis-input"
                                type="password"
                                placeholder="••••••••••"
                                value={pwd}
                                onChange={e => setPwd(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleLogin()}
                            />
                        </div>

                        {err && (
                            <div style={{ background: "rgba(255,77,109,0.08)", border: "1px solid rgba(255,77,109,0.25)", borderRadius: 8, padding: "10px 14px", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent-high)" }}>
                                ⚠ {err}
                            </div>
                        )}

                        <button className="btn-primary" onClick={handleLogin} style={{ marginTop: 4 }}>
                            {loading ? "Authenticating..." : "Sign In"}
                        </button>
                    </div>

                    <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--text-muted)" }}>
                        New to CrisisGuard? <span onClick={onGoSignup} style={{ color: "var(--accent-blue)", cursor: "pointer", fontWeight: 600 }}>Create an account</span>
                    </div>
                </div>

                <div style={{ textAlign: "center", marginTop: 16, fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.06em" }}>
                    SECURED · ISO 27001 CERTIFIED · SOC 2 TYPE II
                </div>
            </div>
        </div>
    );
};
