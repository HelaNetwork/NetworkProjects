import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuthStore from "../store/authStore";

export default function Landing() {
  const { connectWallet, isConnecting, walletAddress } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (walletAddress) navigate("/feed");
  }, [walletAddress, navigate]);

  const handleConnect = async () => {
    try {
      const result = await connectWallet();
      if (result.isNew) {
        toast.success("Welcome to ChainGraph! Set up your profile.");
        navigate("/setup");
      } else {
        toast.success(`Welcome back, ${result.user.username}!`);
        navigate("/feed");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-chain-bg flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: "linear-gradient(#6c63ff 1px, transparent 1px), linear-gradient(90deg, #6c63ff 1px, transparent 1px)", backgroundSize: "60px 60px" }}
      />
      {/* Glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-chain-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-chain-green/10 rounded-full blur-3xl" />

      <div className="relative z-10 text-center max-w-2xl mx-auto animate-fade-in">
        {/* Logo */}
        <div className="mb-8 inline-flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-chain-accent flex items-center justify-center animate-pulse-glow">
            <span className="text-white font-display font-bold text-lg">⬡</span>
          </div>
          <span className="font-display text-xl text-chain-text tracking-wider">ChainGraph</span>
        </div>

        <h1 className="font-display text-5xl md:text-7xl text-chain-text leading-tight mb-6">
          Your Wallet.<br />
          <span className="text-chain-accent">Your Identity.</span>
        </h1>

        <p className="text-chain-text-muted text-lg mb-10 leading-relaxed max-w-lg mx-auto">
          A decentralized social network where relationships are transparent, identity is sovereign, and reputation is earned — not assigned.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="btn-primary flex items-center gap-2 text-base px-8 py-3 animate-pulse-glow"
          >
            {isConnecting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <span>🦊</span> Connect MetaMask
              </>
            )}
          </button>
          <span className="text-chain-text-muted text-sm font-display">No email. No password. Ever.</span>
        </div>

        {/* Feature pills */}
        <div className="mt-16 flex flex-wrap justify-center gap-3">
          {["Wallet-Based Login", "On-Chain Identity", "Social Graph", "Reputation Score", "Decentralized Feed"].map((f) => (
            <span key={f} className="text-xs font-display text-chain-text-muted border border-chain-border px-3 py-1.5 rounded-full">
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
