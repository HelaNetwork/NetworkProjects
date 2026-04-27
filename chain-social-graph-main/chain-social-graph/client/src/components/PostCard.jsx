import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Trash2, ChevronDown, ChevronUp, Send } from "lucide-react";
import toast from "react-hot-toast";
import api from "../utils/api";
import useAuthStore from "../store/authStore";
import { shortAddress, timeAgo } from "../utils/helpers";
import { WalletAvatar } from "./Layout";

export default function PostCard({ post, onUpdate, onDelete }) {
  const { walletAddress } = useAuthStore();
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [liking, setLiking] = useState(false);

  const isLiked = post.likes?.includes(walletAddress);
  const isOwn = post.author === walletAddress;

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    try {
      await api.post(`/posts/${post._id}/like`, { walletAddress });
      const updated = {
        ...post,
        likes: isLiked
          ? post.likes.filter((a) => a !== walletAddress)
          : [...(post.likes || []), walletAddress],
      };
      onUpdate(updated);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLiking(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setPosting(true);
    try {
      const { data } = await api.post(`/posts/${post._id}/comment`, {
        author: walletAddress,
        content: comment,
      });
      onUpdate(data);
      setComment("");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this post?")) return;
    try {
      await api.delete(`/posts/${post._id}`, { data: { walletAddress } });
      onDelete(post._id);
      toast.success("Post deleted");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const author = post.authorData || { walletAddress: post.author, username: `user_${post.author?.slice(2, 8)}` };

  return (
    <div className="card p-5 animate-fade-in hover:border-chain-accent/30 transition-colors">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <Link to={`/profile/${post.author}`}>
          <WalletAvatar address={post.author} size={10} className="hover:opacity-80 transition-opacity" />
        </Link>
        <div className="flex-1 min-w-0">
          <Link to={`/profile/${post.author}`} className="hover:text-chain-accent transition-colors">
            <span className="font-medium text-chain-text text-sm">@{author.username}</span>
          </Link>
          <p className="text-xs text-chain-text-muted font-display">{shortAddress(post.author)} · {timeAgo(post.createdAt)}</p>
        </div>
        {isOwn && (
          <button onClick={handleDelete} className="text-chain-text-muted hover:text-chain-red transition-colors p-1">
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Content */}
      <p className="text-chain-text text-sm leading-relaxed mb-4 whitespace-pre-wrap break-words">{post.content}</p>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-3 border-t border-chain-border">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-sm transition-colors ${
            isLiked ? "text-chain-red" : "text-chain-text-muted hover:text-chain-red"
          }`}
        >
          <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
          <span>{post.likes?.length || 0}</span>
        </button>

        <button
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1.5 text-sm text-chain-text-muted hover:text-chain-accent transition-colors"
        >
          <MessageCircle size={16} />
          <span>{post.comments?.length || 0}</span>
          {showComments ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="mt-4 space-y-3">
          {post.comments?.map((c, i) => (
            <div key={i} className="flex gap-2">
              <WalletAvatar address={c.author} size={6} />
              <div className="flex-1 bg-chain-surface rounded-lg px-3 py-2">
                <p className="text-xs text-chain-accent font-display mb-0.5">{shortAddress(c.author)}</p>
                <p className="text-chain-text text-xs">{c.content}</p>
              </div>
            </div>
          ))}

          <form onSubmit={handleComment} className="flex gap-2">
            <input
              className="input text-xs py-2"
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={300}
            />
            <button type="submit" disabled={posting || !comment.trim()} className="btn-primary px-3 py-2">
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
