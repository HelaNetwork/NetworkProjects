import { useState, useEffect, useCallback } from "react";
import api from "../utils/api";
import PostCard from "../components/PostCard";

export default function Explore() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchExplore = useCallback(async (p = 1) => {
    try {
      const { data } = await api.get(`/posts/explore?page=${p}`);
      if (p === 1) setPosts(data.posts);
      else setPosts((prev) => [...prev, ...data.posts]);
      setHasMore(data.hasMore);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchExplore(1); }, [fetchExplore]);

  const handlePostUpdate = (updated) =>
    setPosts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));

  const handlePostDelete = (id) =>
    setPosts((prev) => prev.filter((p) => p._id !== id));

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl text-chain-text">Explore</h1>
        <p className="text-chain-text-muted text-sm mt-1">Discover posts from the entire network</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-5 animate-pulse space-y-3">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-chain-border" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-chain-border rounded w-24" />
                  <div className="h-3 bg-chain-border rounded w-40" />
                </div>
              </div>
              <div className="h-3 bg-chain-border rounded w-full" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-4xl mb-3">🔭</p>
          <p className="font-display text-chain-text">Nothing here yet</p>
          <p className="text-chain-text-muted text-sm mt-1">Be the first to post!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} onUpdate={handlePostUpdate} onDelete={handlePostDelete} />
          ))}
          {hasMore && (
            <button onClick={() => { const next = page + 1; setPage(next); fetchExplore(next); }} className="btn-ghost w-full">
              Load more
            </button>
          )}
        </div>
      )}
    </div>
  );
}
