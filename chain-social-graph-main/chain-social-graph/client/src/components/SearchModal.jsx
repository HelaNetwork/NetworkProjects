import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Search, X } from "lucide-react";
import api from "../utils/api";
import { WalletAvatar } from "./Layout";
import { shortAddress } from "../utils/helpers";

export default function SearchModal({ onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
        setResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4" onClick={onClose}>
      <div className="w-full max-w-lg bg-chain-card border border-chain-border rounded-2xl shadow-2xl overflow-hidden animate-slide-up" onClick={(e) => e.stopPropagation()}>
        {/* Search input */}
        <div className="flex items-center gap-3 p-4 border-b border-chain-border">
          <Search size={18} className="text-chain-text-muted flex-shrink-0" />
          <input
            ref={inputRef}
            className="flex-1 bg-transparent text-chain-text placeholder-chain-text-muted outline-none text-sm"
            placeholder="Search users by name or address..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={onClose} className="text-chain-text-muted hover:text-chain-text transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center text-chain-text-muted text-sm">Searching...</div>
          ) : results.length > 0 ? (
            results.map((u) => (
              <Link
                key={u.walletAddress}
                to={`/profile/${u.walletAddress}`}
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 hover:bg-chain-surface transition-colors"
              >
                <WalletAvatar address={u.walletAddress} size={10} />
                <div>
                  <p className="text-chain-text text-sm font-medium">@{u.username}</p>
                  <p className="text-chain-text-muted text-xs font-display">{shortAddress(u.walletAddress)}</p>
                </div>
                <div className="ml-auto text-xs text-chain-text-muted">
                  {u.followers?.length || 0} followers
                </div>
              </Link>
            ))
          ) : query ? (
            <div className="p-6 text-center text-chain-text-muted text-sm">No users found for "{query}"</div>
          ) : (
            <div className="p-6 text-center text-chain-text-muted text-sm">Type to search users</div>
          )}
        </div>
      </div>
    </div>
  );
}
