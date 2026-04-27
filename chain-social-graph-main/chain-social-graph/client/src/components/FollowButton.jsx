import { useState } from "react";
import toast from "react-hot-toast";
import api from "../utils/api";
import useAuthStore from "../store/authStore";

export default function FollowButton({ targetAddress, isFollowing: initialFollowing, onChange }) {
  const { walletAddress, refreshUser } = useAuthStore();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (following) {
        await api.post("/follow/unfollow", {
          followerAddress: walletAddress,
          targetAddress,
        });
        setFollowing(false);
        toast.success("Unfollowed");
      } else {
        await api.post("/follow/follow", {
          followerAddress: walletAddress,
          targetAddress,
        });
        setFollowing(true);
        toast.success("Following!");
      }
      refreshUser();
      onChange && onChange(!following);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (following) {
    return (
      <button
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        disabled={loading}
        className={`font-display text-sm px-4 py-2 rounded-lg border transition-all duration-200 ${
          hovered
            ? "border-chain-red text-chain-red bg-chain-red/10"
            : "border-chain-border text-chain-text-muted"
        }`}
      >
        {loading ? "..." : hovered ? "Unfollow" : "Following"}
      </button>
    );
  }

  return (
    <button onClick={handleClick} disabled={loading} className="btn-primary">
      {loading ? "..." : "Follow"}
    </button>
  );
}
