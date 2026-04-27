import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuthStore from "../store/authStore";
import api from "../utils/api";
import { shortAddress } from "../utils/helpers";

export default function SetupProfile() {
  const { user, walletAddress, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) return toast.error("Username is required");
    if (username.length < 3) return toast.error("Username must be at least 3 characters");

    setLoading(true);
    try {
      const { data } = await api.put(`/users/${walletAddress}`, { username, bio });
      updateUser(data);
      toast.success("Profile created!");
      navigate("/feed");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-chain-bg flex items-center justify-center px-4">
      <div className="card p-8 w-full max-w-md animate-slide-up">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-chain-accent/20 border border-chain-accent/30 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">👤</span>
          </div>
          <h1 className="font-display text-2xl text-chain-text mb-1">Set Up Profile</h1>
          <p className="text-chain-text-muted text-sm">Linked to <span className="address-badge">{shortAddress(walletAddress)}</span></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-chain-text-muted mb-2 font-display">Username *</label>
            <input
              className="input"
              placeholder="satoshi_nakamoto"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, "_"))}
              maxLength={30}
            />
          </div>
          <div>
            <label className="block text-sm text-chain-text-muted mb-2 font-display">Bio</label>
            <textarea
              className="input resize-none"
              placeholder="Building on-chain..."
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={160}
            />
            <p className="text-xs text-chain-text-muted mt-1 text-right">{bio.length}/160</p>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
            {loading ? "Saving..." : "Launch Profile 🚀"}
          </button>
        </form>
      </div>
    </div>
  );
}
