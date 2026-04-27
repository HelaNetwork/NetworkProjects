import { useState } from "react";
import toast from "react-hot-toast";
import api from "../utils/api";
import useAuthStore from "../store/authStore";
import { WalletAvatar } from "./Layout";

export default function CreatePost({ onPost }) {
  const { walletAddress, user } = useAuthStore();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post("/posts", { author: walletAddress, content });
      // Enrich with author data for immediate display
      const enriched = { ...data, authorData: { walletAddress, username: user?.username } };
      onPost(enriched);
      setContent("");
      toast.success("Posted!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const remaining = 500 - content.length;

  return (
    <div className="card p-5">
      <div className="flex gap-3">
        <WalletAvatar address={walletAddress} size={10} />
        <div className="flex-1">
          <textarea
            className="input resize-none text-sm"
            placeholder="What's happening on-chain?"
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={500}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.metaKey) handleSubmit(e);
            }}
          />
          <div className="flex items-center justify-between mt-3">
            <span className={`text-xs font-display ${remaining < 50 ? "text-chain-red" : "text-chain-text-muted"}`}>
              {remaining} chars left
            </span>
            <button
              onClick={handleSubmit}
              disabled={loading || !content.trim()}
              className="btn-primary flex items-center gap-2"
            >
              {loading ? (
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : null}
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
