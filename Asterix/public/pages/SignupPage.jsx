const { useState } = React;

const SignupPage = ({ onSignup, onGoLogin }) => {
    const [form, setForm] = useState({ name: "", email: "", pwd: "", confirm: "" });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const setField = (key) => (event) => setForm(prev => ({ ...prev, [key]: event.target.value }));

    const validate = () => {
        const next = {};
        if (!form.name.trim()) next.name = "Name is required";
        if (!/\S+@\S+\.\S+/.test(form.email)) next.email = "Valid email required";
        if (form.pwd.length < 8) next.pwd = "Min 8 characters";
        if (form.pwd !== form.confirm) next.confirm = "Passwords do not match";
        return next;
    };

    const handleSignup = () => {
        const next = validate();
        setErrors(next);
        if (Object.keys(next).length > 0) return;
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            onSignup();
        }, 1200);
    };

    const Field = ({ label, icon, type = "text", field, placeholder }) => (
        <div>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: 7 }}>
                <Icon name={icon} size={11} /> {label}
            </label>
            <input
                className="crisis-input"
                type={type}
                placeholder={placeholder}
                value={form[field]}
                onChange={setField(field)}
                style={{ borderColor: errors[field] ? "rgba(255,77,109,0.5)" : undefined }}
            />
            {errors[field] && (
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent-high)", marginTop: 5 }}>
                    ⚠ {errors[field]}
                </div>
            )}
        </div>
    );

    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
            <AuthBg />
            <div className="fade-up" style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 440, padding: "0 20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 28 }}>
                    <LogoMark size={36} />
                    <div>
                        <div style={{ fontWeight: 800, fontSize: 20, letterSpacing: "0.04em" }}>CrisisGuard AI</div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent-blue)", letterSpacing: "0.12em" }}>ANALYST PORTAL</div>
                    </div>
                </div>

                <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, padding: 32 }}>
                    <h2 style={{ fontWeight: 800, fontSize: 20, marginBottom: 6 }}>Create your account</h2>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 28 }}>Join the global risk monitoring network</p>

                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        <Field label="FULL NAME" icon="user" field="name" placeholder="Jane Analyst" />
                        <Field label="WORK EMAIL" icon="mail" field="email" placeholder="analyst@firm.com" />
                        <Field label="PASSWORD" icon="lock" type="password" field="pwd" placeholder="Min 8 characters" />
                        <Field label="CONFIRM PASSWORD" icon="lock" type="password" field="confirm" placeholder="Re-enter password" />

                        {form.pwd && (
                            <div>
                                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: 5 }}>
                                    PASSWORD STRENGTH
                                </div>
                                <div style={{ display: "flex", gap: 4 }}>
                                    {[1, 2, 3, 4].map(n => {
                                        const strength = [form.pwd.length >= 8, /[A-Z]/.test(form.pwd), /[0-9]/.test(form.pwd), /[^a-zA-Z0-9]/.test(form.pwd)].filter(Boolean).length;
                                        const colors = ["var(--accent-high)", "var(--accent-med)", "var(--accent-med)", "var(--accent-low)"];
                                        return <div key={n} style={{ flex: 1, height: 3, borderRadius: 2, background: n <= strength ? colors[strength - 1] : "rgba(255,255,255,0.06)", transition: "all 0.3s" }} />;
                                    })}
                                </div>
                            </div>
                        )}

                        <button className="btn-primary" onClick={handleSignup} style={{ marginTop: 6 }}>
                            {loading ? "Creating Account..." : "Create Account"}
                        </button>
                    </div>

                    <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--text-muted)" }}>
                        Already have an account? <span onClick={onGoLogin} style={{ color: "var(--accent-blue)", cursor: "pointer", fontWeight: 600 }}>Sign in</span>
                    </div>
                </div>

                <div style={{ textAlign: "center", marginTop: 16, fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.06em" }}>
                    BY SIGNING UP YOU AGREE TO OUR TERMS OF SERVICE
                </div>
            </div>
        </div>
    );
};
