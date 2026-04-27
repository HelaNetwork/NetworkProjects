import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Edit2, Check, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "../utils/api";
import useAuthStore from "../store/authStore";
import PostCard from "../components/PostCard";
import FollowButton from "../components/FollowButton";
import { WalletAvatar } from "../components/Layout";
import { shortAddress, reputationLabel } from "../utils/helpers";

export default function Profile() {
  const { address } = useParams();
  const { walletAddress, user: me, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const isOwn = address?.toLowerCase() === walletAddress?.toLowerCase();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editBio, setEditBio] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("posts");

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const [profileRes, postsRes] = await Promise.all([
          api.get(`/users/${address}`),
          api.get(`/posts/user/${address}`),
        ]);
        setProfile(profileRes.data);
        setPosts(postsRes.data.posts || []);
        setEditBio(profileRes.data.bio || "");
        setEditUsername(profileRes.data.username || "");
      } catch (err) {
        toast.error("Profile not found");
        navigate("/feed");
      } finally {
        setLoading(false);
      }
    };
    if (address) fetchProfile();
  }, [address, navigate]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put(`/users/${walletAddress}`, { username: editUsername, bio: editBio });
      setProfile(data);
      updateUser(data);
      setEditing(false);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleFollowChange = (newFollowing) => {
    setProfile((prev) => {
      const alreadyFollowing = prev.followers.includes(walletAddress);
      return {
        ...prev,
        followers: alreadyFollowing
          ? prev.followers.filter((a) => a !== walletAddress)
          : [...prev.followers, walletAddress],
      };
    });
  };

  const handlePostDelete = (id) => setPosts((prev) => prev.filter((p) => p._id !== id));
  const handlePostUpdate = (updated) => setPosts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 animate-pulse space-y-4">
        <div className="card p-6 space-y-4">
          <div className="flex gap-4">
            <div className="w-20 h-20 rounded-full bg-chain-border" />
            <div className="flex-1 space-y-2 pt-2">
              <div className="h-4 bg-chain-border rounded w-32" />
              <div className="h-3 bg-chain-border rounded w-24" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const rep = reputationLabel(profile.reputationScore || 0);
  const isFollowing = profile.followers?.includes(walletAddress);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4 animate-fade-in">
      {/* Profile Card */}
      <div className="card p-6">
        <div className="flex gap-4 items-start">
          <WalletAvatar address={profile.walletAddress} size={16} />

          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-2">
                <input className="input text-base" value={editUsername} onChange={(e) => setEditUsername(e.target.value)} placeholder="Username" />
                <textarea className="input resize-none" value={editBio} onChange={(e) => setEditBio(e.target.value)} placeholder="Bio" rows={2} maxLength={160} />
                <div className="flex gap-2">
                  <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-1">
                    <Check size={14} /> Save
                  </button>
                  <button onClick={() => setEditing(false)} className="btn-ghost flex items-center gap-1">
                    <X size={14} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-display text-xl text-chain-text">@{profile.username}</h1>
                  <span className={`text-xs font-display ${rep.color}`}>{rep.label}</span>
                </div>
                <p className="address-badge mt-1 inline-block">{shortAddress(profile.walletAddress)}</p>
                {profile.bio && <p className="text-chain-text-muted text-sm mt-2">{profile.bio}</p>}
                <div className="flex gap-4 mt-3 text-sm">
                  <span className="text-chain-text"><strong className="font-display">{profile.followers?.length || 0}</strong> <span className="text-chain-text-muted">followers</span></span>
                  <span className="text-chain-text"><strong className="font-display">{profile.following?.length || 0}</strong> <span className="text-chain-text-muted">following</span></span>
                  <span className="text-chain-text"><strong className="font-display">{profile.reputationScore || 0}</strong> <span className="text-chain-text-muted">rep</span></span>
                </div>
              </>
            )}
          </div>

          <div className="flex-shrink-0">
            {isOwn ? (
              !editing && (
                <button onClick={() => setEditing(true)} className="btn-ghost flex items-center gap-1">
                  <Edit2 size={14} /> Edit
                </button>
              )
            ) : (
              <FollowButton
                targetAddress={profile.walletAddress}
                isFollowing={isFollowing}
                onChange={handleFollowChange}
              />
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-chain-border">
        {["posts"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-display capitalize transition-colors ${
              tab === t ? "text-chain-accent border-b-2 border-chain-accent" : "text-chain-text-muted hover:text-chain-text"
            }`}
          >
            Posts ({posts.length})
          </button>
        ))}
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-3xl mb-2">📭</p>
          <p className="text-chain-text-muted text-sm">No posts yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} onUpdate={handlePostUpdate} onDelete={handlePostDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
