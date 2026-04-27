import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import useAuthStore from "../store/authStore";
import FollowButton from "./FollowButton";
import { WalletAvatar } from "./Layout";
import { shortAddress } from "../utils/helpers";

export default function SuggestedUsers() {
  const { walletAddress } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/users/${walletAddress}/suggestions`)
      .then(({ data }) => setUsers(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [walletAddress]);

  if (loading) return (
    <div className="card p-4 animate-pulse space-y-3">
      <div className="h-3 bg-chain-border rounded w-24" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-chain-border" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 bg-chain-border rounded w-20" />
            <div className="h-2 bg-chain-border rounded w-16" />
          </div>
        </div>
      ))}
    </div>
  );

  if (users.length === 0) return null;

  return (
    <div className="card p-4">
      <h3 className="font-display text-xs text-chain-text-muted uppercase tracking-wider mb-4">Who to Follow</h3>
      <div className="space-y-3">
        {users.map((u) => (
          <div key={u.walletAddress} className="flex items-center gap-3">
            <Link to={`/profile/${u.walletAddress}`}>
              <WalletAvatar address={u.walletAddress} size={8} />
            </Link>
            <div className="flex-1 min-w-0">
              <Link to={`/profile/${u.walletAddress}`} className="hover:text-chain-accent transition-colors">
                <p className="text-chain-text text-sm font-medium truncate">@{u.username}</p>
              </Link>
              <p className="text-chain-text-muted text-xs font-display">{shortAddress(u.walletAddress)}</p>
            </div>
            <FollowButton targetAddress={u.walletAddress} isFollowing={false} onChange={() => setUsers((prev) => prev.filter((x) => x.walletAddress !== u.walletAddress))} />
          </div>
        ))}
      </div>
    </div>
  );
}
