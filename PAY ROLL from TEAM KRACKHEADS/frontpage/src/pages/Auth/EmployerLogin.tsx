import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../app/api";

export default function EmployerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const data = await login(email, password);
      localStorage.setItem("token", data.access_token);
      navigate("/employer-dashboard/overview");
    } catch {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    const demoEmail = (import.meta as any).env?.VITE_DEMO_EMPLOYER_EMAIL || "";
    const demoPassword = (import.meta as any).env?.VITE_DEMO_EMPLOYER_PASSWORD || "";
    if (!demoEmail || !demoPassword) {
      setError("Demo credentials not set");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const data = await login(demoEmail, demoPassword);
      localStorage.setItem("token", data.access_token);
      navigate("/employer-dashboard/overview");
    } catch {
      setError("Demo login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">

      {/* LEFT SIDE */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center px-8 lg:px-20 py-12">

        <h1 className="text-3xl lg:text-4xl font-bold mb-4">
          Hey <span className="text-pink-600">Chief!</span>
        </h1>

        <p className="text-gray-500 mb-8">
          Sign in to continue managing your workforce
        </p>

        {error && (
          <div className="mb-4 p-3 text-sm bg-red-100 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        <input
          type="email"
          placeholder="Employer ID"
          className="w-full mb-4 px-4 py-3 border rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-pink-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-6 px-4 py-3 border rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-pink-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3 rounded-lg text-white font-semibold
                     bg-gradient-to-r from-pink-500 to-purple-600
                     hover:opacity-90 transition duration-200
                     disabled:opacity-50"
        >
          {loading ? "Signing In..." : "Access Dashboard →"}
        </button>
        <button
          onClick={handleDemoLogin}
          disabled={loading}
          className="mt-3 w-full py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-indigo-500 to-blue-600 hover:opacity-90 transition duration-200 disabled:opacity-50"
        >
          Use Demo Login
        </button>
      </div>

      {/* RIGHT SIDE */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br 
                      from-pink-500 via-purple-500 to-indigo-500 
                      flex-col justify-center items-center 
                      text-white px-20">

        <h2 className="text-3xl font-bold mb-6">Secure Access</h2>

        <p className="text-lg text-center mb-10 max-w-md">
          Bank-grade security protecting your workforce
          management and transaction data
        </p>

        <div className="space-y-4 w-full max-w-md">
          {[
            {
              title: "Real-time Analytics",
              desc: "Track performance metrics"
            },
            {
              title: "Workforce Management",
              desc: "Control your entire team"
            },
            {
              title: "Transaction Insights",
              desc: "Optimize financial flow"
            }
          ].map((item, index) => (
            <div
              key={index}
              className="bg-white/20 p-4 rounded-lg backdrop-blur-md"
            >
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

