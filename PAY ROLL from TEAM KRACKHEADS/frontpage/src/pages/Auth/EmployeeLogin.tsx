import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { login } from "../../app/api";

export default function EmployeeLogin() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async () => {
        setError("");
        setLoading(true);

        try {
            const data = await login(email, password);
            localStorage.setItem("token", data.access_token);
            const target = (import.meta as any).env?.VITE_EMPLOYEE_PORTAL_URL || "/employee";
            window.location.href = target;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed");
        } finally {
            setLoading(false);
        }
    };
    const handleDemoLogin = async () => {
        const demoEmail = (import.meta as any).env?.VITE_DEMO_EMPLOYEE_EMAIL || "";
        const demoPassword = (import.meta as any).env?.VITE_DEMO_EMPLOYEE_PASSWORD || "";
        if (!demoEmail || !demoPassword) {
            setError("Demo credentials not set");
            return;
        }
        setError("");
        setLoading(true);
        try {
            const data = await login(demoEmail, demoPassword);
            localStorage.setItem("token", data.access_token);
            const target = (import.meta as any).env?.VITE_EMPLOYEE_PORTAL_URL || "/employee";
            window.location.href = target;
        } catch {
            setError("Demo login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-700 via-indigo-700 to-purple-900 p-6">

            <motion.div
                className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md text-center"
                initial={{ opacity: 0, y: 60, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6 }}
            >

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-purple-600">
                        KRACKHEADS
                    </h1>
                    <p className="text-gray-500">Employee Portal</p>
                </div>

                <h2 className="text-3xl font-bold mb-2">
                    Hello, <span className="text-purple-600">welcome!</span>
                </h2>

                <p className="text-gray-500 mb-8">
                    Access your earnings and payment tracking
                </p>

                {error && (
                    <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-6 text-left">

                    <div>
                        <label className="text-sm text-gray-600">Email</label>
                        <input
                            type="text"
                            placeholder="employee@test.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            className="w-full mt-2 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-600">Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            className="w-full mt-2 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                        />
                    </div>

                    <div className="flex justify-between items-center text-sm">
                        <label className="flex items-center gap-2">
                            <input type="checkbox" />
                            Remember me
                        </label>
                        <span className="text-purple-600 cursor-pointer">
                            Forgot password?
                        </span>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLogin}
                        disabled={loading || !email || !password}
                        className="w-full py-4 rounded-xl text-white font-semibold text-lg bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 shadow-xl disabled:opacity-50"
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleDemoLogin}
                        disabled={loading}
                        className="mt-3 w-full py-4 rounded-xl text-white font-semibold text-lg bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 shadow-xl disabled:opacity-50"
                    >
                        Use Demo Login
                    </motion.button>
                </div>

                <div className="mt-8 text-sm text-gray-500">
                    Need help? <span className="text-purple-600 cursor-pointer">Contact Support</span>
                </div>

                <div className="mt-10 flex justify-around text-gray-400 text-sm">
                    <span>Pay Stubs</span>
                    <span>Earnings</span>
                    <span>Transactions</span>
                </div>

                <div className="mt-6 text-xs text-gray-400">
                    Secure employee authentication · Bank-grade security
                </div>

            </motion.div>
        </div>
    );
}
